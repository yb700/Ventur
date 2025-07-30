#!/usr/bin/env python3
"""
Richmond Council Planning Applications Scraper
Scrapes planning applications from the last week and saves to Supabase
"""

import os
import sys
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import asyncio
from playwright.async_api import async_playwright, Browser, Page
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('richmond_scraper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class RichmondScraper:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.user_id = os.getenv('SCRAPER_USER_ID')
        
        if not all([self.supabase_url, self.supabase_key, self.user_id]):
            raise ValueError("Missing required environment variables")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.base_url = "https://planning.richmond.gov.uk"
        self.search_url = f"{self.base_url}/richmond/search-applications/"
        
        # Calculate date range for last week
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        self.start_date = week_ago.strftime("%d/%m/%Y")
        self.end_date = today.strftime("%d/%m/%Y")
        
        logger.info(f"Scraping Richmond applications from {self.start_date} to {self.end_date}")

    async def setup_browser(self) -> Browser:
        """Setup Playwright browser"""
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        return browser

    async def navigate_to_search_page(self, page: Page) -> bool:
        """Navigate to the search page and set up the search"""
        try:
            logger.info("Navigating to search page...")
            await page.goto(self.search_url, wait_until='networkidle', timeout=30000)
            
            # Wait for the page to load and look for the button
            logger.info("Waiting for page to load...")
            await page.wait_for_timeout(5000)
            
            # Debug: Take a screenshot and log page content
            logger.info("Taking screenshot for debugging...")
            await page.screenshot(path="richmond_debug.png")
            
            # Log the page title and some content for debugging
            page_title = await page.title()
            logger.info(f"Page title: {page_title}")
            
            # Handle cookie consent overlay first
            logger.info("Checking for cookie consent overlay...")
            try:
                cookie_overlay = await page.query_selector('.sas-cookie-consent-overlay')
                if cookie_overlay:
                    logger.info("Found cookie consent overlay, trying to accept...")
                    
                    # Try to find and click accept button
                    accept_selectors = [
                        'button:has-text("Accept")',
                        'button:has-text("Accept All")',
                        'button:has-text("Accept Cookies")',
                        'button:has-text("OK")',
                        'button:has-text("I Accept")',
                        '.cookie-accept',
                        '.cookie-consent-accept',
                        '[data-testid="accept-cookies"]'
                    ]
                    
                    for selector in accept_selectors:
                        try:
                            accept_button = await page.query_selector(selector)
                            if accept_button:
                                logger.info(f"Clicking cookie accept button: {selector}")
                                await accept_button.click()
                                await page.wait_for_timeout(2000)
                                break
                        except Exception as e:
                            logger.warning(f"Cookie accept selector {selector} failed: {e}")
                            continue
                    
                    # If no accept button found, try to remove the overlay
                    try:
                        await page.evaluate("""
                            const overlay = document.querySelector('.sas-cookie-consent-overlay');
                            if (overlay) {
                                overlay.style.display = 'none';
                                overlay.remove();
                            }
                        """)
                        logger.info("Removed cookie consent overlay via JavaScript")
                        await page.wait_for_timeout(2000)
                    except Exception as e:
                        logger.warning(f"Could not remove cookie overlay: {e}")
                        
            except Exception as e:
                logger.warning(f"Error handling cookie consent: {e}")
            
            # Try to find any buttons on the page
            buttons = await page.query_selector_all('button')
            logger.info(f"Found {len(buttons)} buttons on the page")
            for i, button in enumerate(buttons[:5]):  # Log first 5 buttons
                try:
                    button_text = await button.text_content()
                    button_id = await button.get_attribute('id')
                    button_class = await button.get_attribute('class')
                    logger.info(f"Button {i+1}: text='{button_text}', id='{button_id}', class='{button_class}'")
                except Exception as e:
                    logger.warning(f"Could not get button {i+1} info: {e}")
            
            # Try different selectors for the "Determined or Registered" button
            button_selectors = [
                '#switchDeterminedRegistered',
                'button[ng-click="switchToDeterminedRegistered()"]',
                'button:has-text("Determined or Registered")',
                'button.btn-primary:has-text("Determined")',
                'button.btn-primary:has-text("Registered")'
            ]
            
            button_found = False
            for selector in button_selectors:
                try:
                    logger.info(f"Trying selector: {selector}")
                    await page.wait_for_selector(selector, timeout=5000)
                    logger.info(f"Found button with selector: {selector}")
                    
                    # Click the "Determined or Registered" button
                    logger.info("Clicking 'Determined or Registered' button...")
                    await page.click(selector)
                    await page.wait_for_timeout(3000)
                    button_found = True
                    break
                    
                except Exception as e:
                    logger.warning(f"Selector {selector} failed: {e}")
                    continue
            
            if not button_found:
                logger.error("Could not find the 'Determined or Registered' button")
                return False
            
            # Try to find and set the date range
            date_selectors = [
                'input[ng-model="dateRange"]',
                '#dateRange0bj3ha7cu7j',
                'input[class*="date-picker"]',
                'input[placeholder*="date"]'
            ]
            
            date_input = None
            for selector in date_selectors:
                try:
                    logger.info(f"Trying date selector: {selector}")
                    date_input = await page.wait_for_selector(selector, timeout=5000)
                    if date_input:
                        logger.info(f"Found date input with selector: {selector}")
                        break
                except Exception as e:
                    logger.warning(f"Date selector {selector} failed: {e}")
                    continue
            
            if date_input:
                logger.info(f"Setting date range: {self.start_date} to {self.end_date}")
                await date_input.fill(f"{self.start_date} - {self.end_date}")
                await page.wait_for_timeout(2000)
            else:
                logger.warning("Could not find date input, continuing without date range")
            
            # Try to find and click the search button
            search_selectors = [
                '#btnSearchDetReg',
                'button:has-text("Search")',
                'button.btn-primary:has-text("Search")',
                'input[type="submit"]'
            ]
            
            search_clicked = False
            for selector in search_selectors:
                try:
                    logger.info(f"Trying search selector: {selector}")
                    await page.wait_for_selector(selector, timeout=5000)
                    logger.info("Clicking search button...")
                    await page.click(selector)
                    await page.wait_for_timeout(5000)
                    search_clicked = True
                    break
                except Exception as e:
                    logger.warning(f"Search selector {selector} failed: {e}")
                    continue
            
            if not search_clicked:
                logger.warning("Could not find search button, but continuing...")
            
            return True
            
        except Exception as e:
            logger.error(f"Error navigating to search page: {e}")
            return False

    async def extract_application_links(self, page: Page) -> List[str]:
        """Extract application detail page links from the results table"""
        try:
            logger.info("Extracting application links...")
            
            # Wait for results table to load
            await page.wait_for_selector('table tbody tr', timeout=15000)
            await page.wait_for_timeout(3000)
            
            # Get all application rows
            rows = await page.query_selector_all('table tbody tr.animate-repeat')
            logger.info(f"Found {len(rows)} application rows")
            
            application_links = []
            
            for row in rows:
                try:
                    # Extract the reference number from the row
                    reference_element = await row.query_selector('td:first-child')
                    if reference_element:
                        reference_text = await reference_element.text_content()
                        reference = reference_text.strip() if reference_text else None
                        
                        if reference:
                            # Construct the detail page URL
                            detail_url = f"{self.base_url}/richmond/application-details/{reference}"
                            application_links.append(detail_url)
                            logger.info(f"Found application: {reference}")
                            
                except Exception as e:
                    logger.warning(f"Error extracting link from row: {e}")
                    continue
            
            logger.info(f"Extracted {len(application_links)} application links")
            return application_links
            
        except Exception as e:
            logger.error(f"Error extracting application links: {e}")
            return []

    async def extract_application_details(self, page: Page, url: str) -> Optional[Dict[str, Any]]:
        """Extract detailed information from an application detail page"""
        try:
            logger.info(f"Extracting details from: {url}")
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Wait for the form to load
            await page.wait_for_selector('form[name="detregform"]', timeout=15000)
            
            # Extract all the required fields
            application_data = {
                'reference': None,
                'address': None,
                'proposal': None,
                'status': None,
                'decision': None,
                'decision_issued_date': None,
                'applicant_name': None,
                'application_registered': None,
                'application_validated': None,
                'url': url
            }
            
            # Extract reference number
            try:
                reference_input = await page.query_selector('input[sas-id="reference"]')
                if reference_input:
                    reference_value = await reference_input.get_attribute('value')
                    application_data['reference'] = reference_value.strip() if reference_value else None
            except Exception as e:
                logger.warning(f"Error extracting reference: {e}")
            
            # Extract location (address)
            try:
                location_textarea = await page.query_selector('textarea[sas-id="location"]')
                if location_textarea:
                    location_value = await location_textarea.text_content()
                    application_data['address'] = location_value.strip() if location_value else None
            except Exception as e:
                logger.warning(f"Error extracting address: {e}")
            
            # Extract proposal description
            try:
                proposal_textarea = await page.query_selector('textarea[sas-id="fullProposal"]')
                if proposal_textarea:
                    proposal_value = await proposal_textarea.text_content()
                    application_data['proposal'] = proposal_value.strip() if proposal_value else None
            except Exception as e:
                logger.warning(f"Error extracting proposal: {e}")
            
            # Extract status
            try:
                status_input = await page.query_selector('input[sas-id="statusNonOwner"]')
                if status_input:
                    status_value = await status_input.get_attribute('value')
                    application_data['status'] = status_value.strip() if status_value else None
            except Exception as e:
                logger.warning(f"Error extracting status: {e}")
            
            # Extract decision
            try:
                decision_span = await page.query_selector('span.stat-desc-span')
                if decision_span:
                    decision_value = await decision_span.text_content()
                    application_data['decision'] = decision_value.strip() if decision_value else None
            except Exception as e:
                logger.warning(f"Error extracting decision: {e}")
            
            # Extract decision issued date
            try:
                dispatch_input = await page.query_selector('input[sas-id="dispatchDate"]')
                if dispatch_input:
                    dispatch_value = await dispatch_input.get_attribute('value')
                    if dispatch_value:
                        application_data['decision_issued_date'] = self.parse_date(dispatch_value.strip())
            except Exception as e:
                logger.warning(f"Error extracting decision issued date: {e}")
            
            # Extract received date (application registered)
            try:
                received_input = await page.query_selector('input[sas-id="receivedDate"]')
                if received_input:
                    received_value = await received_input.get_attribute('value')
                    if received_value:
                        application_data['application_registered'] = self.parse_date(received_value.strip())
            except Exception as e:
                logger.warning(f"Error extracting received date: {e}")
            
            # Extract valid date (application validated)
            try:
                valid_input = await page.query_selector('input[sas-id="validDate"]')
                if valid_input:
                    valid_value = await valid_input.get_attribute('value')
                    if valid_value:
                        application_data['application_validated'] = self.parse_date(valid_value.strip())
            except Exception as e:
                logger.warning(f"Error extracting valid date: {e}")
            
            # Extract applicant name (from officer name as fallback)
            try:
                officer_input = await page.query_selector('input[sas-id="officerName"]')
                if officer_input:
                    officer_value = await officer_input.get_attribute('value')
                    application_data['applicant_name'] = officer_value.strip() if officer_value else None
            except Exception as e:
                logger.warning(f"Error extracting applicant name: {e}")
            
            # Generate content hash
            content_str = f"{application_data['reference']}{application_data['address']}{application_data['proposal']}{application_data['status']}"
            application_data['content_hash'] = hashlib.md5(content_str.encode()).hexdigest()
            
            # Add metadata
            application_data['council_id'] = 'Richmond'
            application_data['last_scraped_at'] = datetime.now().isoformat()
            
            logger.info(f"Extracted application: {application_data['reference']}")
            return application_data
            
        except Exception as e:
            logger.error(f"Error extracting application details from {url}: {e}")
            return None

    def parse_date(self, date_str: str) -> Optional[str]:
        """Parse date string to ISO format"""
        if not date_str:
            return None
        
        try:
            # Try different date formats
            date_formats = [
                "%d/%m/%Y",
                "%d-%m-%Y", 
                "%Y-%m-%d",
                "%d/%m/%y",
                "%d-%m-%y"
            ]
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_str.strip(), fmt)
                    return parsed_date.isoformat()
                except ValueError:
                    continue
            
            logger.warning(f"Could not parse date: {date_str}")
            return None
            
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None

    async def save_to_supabase(self, applications: List[Dict[str, Any]]) -> int:
        """Save applications to Supabase database"""
        if not applications:
            logger.info("No applications to save")
            return 0
        
        try:
            logger.info(f"Saving {len(applications)} applications to Supabase...")
            
            # Prepare data for insertion
            data_to_insert = []
            for app in applications:
                # Remove None values and ensure required fields
                clean_app = {k: v for k, v in app.items() if v is not None}
                if clean_app.get('reference'):  # Only insert if we have a reference
                    data_to_insert.append(clean_app)
            
            if not data_to_insert:
                logger.warning("No valid applications to insert")
                return 0
            
            # Insert data with conflict resolution
            result = self.supabase.table('applications').upsert(
                data_to_insert,
                on_conflict='reference'
            ).execute()
            
            inserted_count = len(result.data) if result.data else 0
            logger.info(f"Successfully saved {inserted_count} applications to database")
            return inserted_count
            
        except Exception as e:
            logger.error(f"Error saving to Supabase: {e}")
            return 0

    async def run(self) -> Dict[str, Any]:
        """Main scraper execution"""
        start_time = datetime.now()
        browser = None
        
        try:
            logger.info("Starting Richmond Council scraper...")
            
            # Setup browser
            browser = await self.setup_browser()
            page = await browser.new_page()
            
            # Set viewport and user agent
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            
            # Navigate to search page
            if not await self.navigate_to_search_page(page):
                raise Exception("Failed to navigate to search page")
            
            # Extract application links
            application_links = await self.extract_application_links(page)
            
            if not application_links:
                logger.warning("No application links found")
                return {
                    'success': True,
                    'applications_found': 0,
                    'applications_saved': 0,
                    'duration': (datetime.now() - start_time).total_seconds()
                }
            
            # Extract details from each application
            applications = []
            for i, link in enumerate(application_links[:50]):  # Limit to 50 applications
                try:
                    logger.info(f"Processing application {i+1}/{len(application_links)}")
                    app_data = await self.extract_application_details(page, link)
                    if app_data:
                        applications.append(app_data)
                    
                    # Small delay between requests
                    await page.wait_for_timeout(1000)
                    
                except Exception as e:
                    logger.error(f"Error processing application {link}: {e}")
                    continue
            
            # Save to database
            saved_count = await self.save_to_supabase(applications)
            
            duration = (datetime.now() - start_time).total_seconds()
            
            result = {
                'success': True,
                'applications_found': len(application_links),
                'applications_processed': len(applications),
                'applications_saved': saved_count,
                'duration': duration,
                'date_range': f"{self.start_date} to {self.end_date}"
            }
            
            logger.info(f"Scraper completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Scraper failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'duration': (datetime.now() - start_time).total_seconds()
            }
        
        finally:
            if browser:
                await browser.close()

async def main():
    """Main entry point"""
    try:
        scraper = RichmondScraper()
        result = await scraper.run()
        
        # Print result as JSON for the cron job
        print(json.dumps(result, indent=2))
        
        if result['success']:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        print(json.dumps({
            'success': False,
            'error': str(e)
        }, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 