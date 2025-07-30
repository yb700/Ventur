#!/usr/bin/env python3
"""
Improved Ealing Council Planning Application Scraper
Enhanced with better error handling, logging, and performance optimizations.
"""

import asyncio
import logging
import sys
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from urllib.parse import urljoin
from datetime import datetime, timedelta, timezone
import hashlib
from dotenv import load_dotenv
import os
import json
from typing import Dict, List, Optional, Tuple
import time

# Import Supabase Client
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ealing_scraper.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase Client
SUPABASE_URL = os.environ.get("PY_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("PY_SUPABASE_SERVICE_ROLE_KEY")
SCRAPER_USER_ID = os.environ.get("PY_SCRAPER_USER_ID")

if not all([SUPABASE_URL, SUPABASE_KEY, SCRAPER_USER_ID]):
    raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SCRAPER_USER_ID")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuration
BASE_URL = "https://pam.ealing.gov.uk/online-applications/"
COUNCIL_ID = "ealing_london"
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
PAGE_TIMEOUT = 30000  # milliseconds
BATCH_SIZE = 10  # Process applications in batches

class EalingScraper:
    def __init__(self):
        self.stats = {
            'total_processed': 0,
            'new_applications': 0,
            'updated_applications': 0,
            'errors': 0,
            'start_time': None,
            'end_time': None
        }
    
    async def get_last_successful_scrape_date(self) -> datetime:
        """Get the last successful scrape date from database."""
        try:
            response = supabase.table("scraper_metadata").select("*").eq("council_id", COUNCIL_ID).eq("user_id", SCRAPER_USER_ID).limit(1).execute()
            metadata = response.data[0] if response.data else None

            if metadata and metadata.get('last_successful_scrape_date'):
                return datetime.fromisoformat(metadata['last_successful_scrape_date'])
            
            logger.info("No previous scrape date found. Defaulting to last 30 days.")
            return datetime.now(timezone.utc) - timedelta(days=30)
        except Exception as e:
            logger.error(f"Error getting last scrape date: {e}")
            return datetime.now(timezone.utc) - timedelta(days=30)

    async def update_last_successful_scrape_date(self, scrape_date: datetime):
        """Update the last successful scrape date."""
        try:
            scrape_date_iso = scrape_date.isoformat()
            data_to_upsert = {
                'council_id': COUNCIL_ID,
                'user_id': SCRAPER_USER_ID,
                'last_successful_scrape_date': scrape_date_iso,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            response = supabase.table("scraper_metadata").upsert(
                data_to_upsert,
                on_conflict='user_id,council_id'
            ).execute()

            if response.data:
                logger.info(f"Updated last successful scrape date to {scrape_date_iso}")
            else:
                logger.error(f"Failed to update scrape date: {response}")
        except Exception as e:
            logger.error(f"Error updating scrape date: {e}")

    async def get_application_data_from_db(self, reference: str) -> dict | None:
        """Fetches an application record from Supabase by reference number."""
        response = supabase.table("applications").select("*").eq("reference", reference).limit(1).execute()
        return response.data[0] if response.data else None

    async def save_application_to_db(self, data: Dict) -> bool:
        """Save application to database."""
        try:
            app_reference = data.get('Reference')
            if not app_reference:
                logger.warning("Skipping save: 'Reference' field is missing from data.")
                return False

            # Prepare data for Supabase
            now_utc_iso = datetime.now(timezone.utc).isoformat()
            supabase_data = {
                'reference': data.get('Reference'),
                'application_registered': data.get('Application Registered'),
                'application_validated': data.get('Application Validated'),
                'address': data.get('Address'),
                'proposal': data.get('Proposal'),
                'status': data.get('Status'),
                'decision': data.get('Decision'),
                'decision_issued_date': data.get('Decision Issued Date'),
                'applicant_name': data.get('Applicant Name'),
                'url': data.get('URL'),
                'content_hash': data.get('content_hash'),
                'last_scraped_at': now_utc_iso,
            }
            
            # Check if application already exists by reference
            existing_app = await self.get_application_data_from_db(app_reference)

            if existing_app:
                # Compare content hash to detect changes
                if existing_app.get('content_hash') != supabase_data.get('content_hash'):
                    logger.info(f"Updating existing application: {app_reference}")
                    response = supabase.table("applications").update(supabase_data).eq("reference", app_reference).execute()
                else:
                    # Content hash matches, only update last_scraped_at
                    logger.info(f"Application {app_reference} unchanged, updating last_scraped_at")
                    response = supabase.table("applications").update({'last_scraped_at': now_utc_iso}).eq("reference", app_reference).execute()
            else:
                logger.info(f"Inserting new application: {app_reference}")
                response = supabase.table("applications").insert([supabase_data]).execute()

            if response.data:
                return True
            else:
                logger.error(f"Failed to save application {app_reference}")
                return False

        except Exception as e:
            logger.error(f"Error saving application to database: {e}")
            return False

    async def scrape_application_details(self, page, url: str) -> Optional[Dict]:
        """Scrape details from a single application page."""
        for attempt in range(MAX_RETRIES):
            try:
                await page.goto(url, wait_until='networkidle', timeout=PAGE_TIMEOUT)
                
                # Extract summary data with better error handling
                summary_data = {}
                
                # Define field mappings
                field_mappings = {
                    'Reference': 'th:has-text("Reference") + td',
                    'Application Registered': 'th:has-text("Application Received") + td',
                    'Application Validated': 'th:has-text("Application Validated") + td',
                    'Address': 'th:has-text("Address") + td',
                    'Proposal': 'th:has-text("Proposal") + td',
                    'Status': 'th:has-text("Status") + td',
                    'Decision': 'th:has-text("Decision") + td',
                    'Decision Issued Date': 'th:has-text("Decision Issued Date") + td'
                }

                for field_name, selector in field_mappings.items():
                    try:
                        element = page.locator(selector).first
                        if await element.count() > 0:
                            summary_data[field_name] = await element.inner_text()
                        else:
                            summary_data[field_name] = None
                    except Exception as e:
                        logger.warning(f"Could not extract {field_name}: {e}")
                        summary_data[field_name] = None

                # Get applicant name from further information page
                link_locator = page.get_by_role('link', name='Further Information')
                
                if await link_locator.count() > 0:
                    relative_url = await link_locator.get_attribute('href')
                    full_info_url = urljoin(BASE_URL, relative_url)
                    summary_data['URL'] = full_info_url

                    # Navigate to further information page
                    await link_locator.click()
                    await page.wait_for_load_state('networkidle', timeout=PAGE_TIMEOUT)
                    
                    applicant_name_locator = page.locator('th:has-text("Applicant Name") + td').first
                    if await applicant_name_locator.count() > 0:
                        summary_data['Applicant Name'] = await applicant_name_locator.inner_text()
                    else:
                        summary_data['Applicant Name'] = None
                    
                    # Go back to previous page
                    await page.go_back(wait_until='networkidle')
                else:
                    summary_data['Applicant Name'] = None
                    summary_data['URL'] = url

                # Generate content hash
                content_to_hash = (summary_data.get('Proposal', '') or '').strip() + \
                                  (summary_data.get('Address', '') or '').strip()
                summary_data['content_hash'] = hashlib.sha256(content_to_hash.encode('utf-8')).hexdigest()

                return summary_data

            except PlaywrightTimeoutError:
                logger.warning(f"Timeout on attempt {attempt + 1} for {url}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY)
                else:
                    logger.error(f"Failed to scrape {url} after {MAX_RETRIES} attempts")
                    return None
            except Exception as e:
                logger.error(f"Error scraping {url} (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY)
                else:
                    return None

    async def collect_application_urls(self, page, target_month_str: str) -> List[str]:
        """Collect all application URLs for a given month."""
        application_urls = []
        page_number = 1
        
        try:
            # Navigate to search page
            start_url = urljoin(BASE_URL, "search.do?action=monthlyList")
            await page.goto(start_url, wait_until='domcontentloaded')

            # Select month and search
            await page.select_option('#month', target_month_str)
            await page.check('#dateDecided')
            await page.get_by_role('button', name='Search').click()
            await page.wait_for_load_state('networkidle', timeout=PAGE_TIMEOUT)
            
            logger.info(f"Search results for {target_month_str} loaded")

            # Collect URLs from all pages
            while True:
                logger.info(f"Collecting links from page {page_number} for {target_month_str}")
                
                try:
                    await page.wait_for_selector('#searchresults .summaryLink', timeout=20000)
                except PlaywrightTimeoutError:
                    logger.info(f"No more summary links found on page {page_number}")
                    break

                links = await page.locator('#searchresults .summaryLink').all()
                logger.info(f"Found {len(links)} links on page {page_number}")
                
                for link in links:
                    href = await link.get_attribute('href')
                    if href:
                        full_url = urljoin(BASE_URL, href)
                        application_urls.append(full_url)
                
                # Check for next page
                next_button = page.locator('.bottom > .next')
                if await next_button.count() > 0 and await next_button.is_enabled():
                    await next_button.click()
                    await page.wait_for_load_state('networkidle', timeout=PAGE_TIMEOUT)
                    page_number += 1
                else:
                    logger.info("No more pages of results")
                    break

        except Exception as e:
            logger.error(f"Error collecting URLs for {target_month_str}: {e}")

        return application_urls

    async def run(self):
        """Main scraping process."""
        self.stats['start_time'] = datetime.now()
        logger.info("Starting Ealing Council scraper...")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Set user agent to avoid detection
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })

            try:
                last_scrape_dt = await self.get_last_successful_scrape_date()
                current_date_utc = datetime.now(timezone.utc)

                # Collect URLs from all months since last scrape
                all_urls = []
                year = last_scrape_dt.year
                month = last_scrape_dt.month

                while datetime(year, month, 1, tzinfo=timezone.utc) <= current_date_utc.replace(day=1):
                    target_month_str = datetime(year, month, 1).strftime('%b %y')
                    logger.info(f"Processing month: {target_month_str}")
                    
                    urls = await self.collect_application_urls(page, target_month_str)
                    all_urls.extend(urls)
                    
                    # Move to next month
                    if month == 12:
                        month = 1
                        year += 1
                    else:
                        month += 1

                # Remove duplicates
                unique_urls = list(dict.fromkeys(all_urls))
                logger.info(f"Found {len(unique_urls)} unique applications to process")

                # Process applications in batches
                for i in range(0, len(unique_urls), BATCH_SIZE):
                    batch = unique_urls[i:i + BATCH_SIZE]
                    logger.info(f"Processing batch {i//BATCH_SIZE + 1}/{(len(unique_urls) + BATCH_SIZE - 1)//BATCH_SIZE}")
                    
                    for j, url in enumerate(batch):
                        try:
                            logger.info(f"Processing {i + j + 1}/{len(unique_urls)}: {url}")
                            data = await self.scrape_application_details(page, url)
                            
                            if data:
                                await self.save_application_to_db(data)
                                self.stats['total_processed'] += 1
                            else:
                                self.stats['errors'] += 1
                                
                        except Exception as e:
                            logger.error(f"Error processing {url}: {e}")
                            self.stats['errors'] += 1
                    
                    # Add delay between batches
                    if i + BATCH_SIZE < len(unique_urls):
                        logger.info("Waiting between batches...")
                        await asyncio.sleep(5)

            finally:
                await browser.close()

            # Update last successful scrape date
            await self.update_last_successful_scrape_date(current_date_utc)

        self.stats['end_time'] = datetime.now()
        duration = self.stats['end_time'] - self.stats['start_time']
        
        logger.info("=" * 50)
        logger.info("SCRAPING COMPLETED")
        logger.info("=" * 50)
        logger.info(f"Total processed: {self.stats['total_processed']}")
        logger.info(f"New applications: {self.stats['new_applications']}")
        logger.info(f"Updated applications: {self.stats['updated_applications']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info(f"Duration: {duration}")
        logger.info("=" * 50)

        return self.stats

async def main():
    """Main entry point."""
    try:
        scraper = EalingScraper()
        stats = await scraper.run()
        
        # Exit with error code if there were too many errors
        if stats['errors'] > stats['total_processed'] * 0.5:  # More than 50% errors
            sys.exit(1)
        else:
            sys.exit(0)
            
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unhandled error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main()) 