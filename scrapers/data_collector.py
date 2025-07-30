"""
DataFlow Pro - Intelligent Data Collection Engine

This module demonstrates advanced web scraping capabilities including:
- Asynchronous data collection
- Intelligent content parsing
- Robust error handling
- Rate limiting and respectful crawling
- Database integration
- Content deduplication

Author: [Your Name]
Date: 2024
"""

import asyncio
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Browser, Page
from dotenv import load_dotenv
import os

# Database imports
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DataCollector:
    """
    Advanced data collection engine with intelligent scraping capabilities.
    
    Features:
    - Asynchronous processing for high performance
    - Intelligent content parsing and categorization
    - Robust error handling and retry mechanisms
    - Rate limiting and respectful crawling
    - Database integration with Supabase
    - Content deduplication using hash-based comparison
    """
    
    def __init__(self, source_id: str, base_url: str):
        """
        Initialize the data collector.
        
        Args:
            source_id: Unique identifier for the data source
            base_url: Base URL for the target website
        """
        self.source_id = source_id
        self.base_url = base_url
        self.supabase = self._initialize_database()
        
        # Configuration
        self.max_retries = 3
        self.retry_delay = 2
        self.rate_limit_delay = 1
        self.max_concurrent_pages = 5
        
    def _initialize_database(self) -> Client:
        """Initialize Supabase client for data persistence."""
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Database configuration required")
            
        return create_client(supabase_url, supabase_key)
    
    async def get_last_collection_date(self) -> datetime:
        """Retrieve the last successful data collection date."""
        try:
            response = self.supabase.table("collection_metadata").select("*").eq(
                "source_id", self.source_id
            ).limit(1).execute()
            
            if response.data:
                return datetime.fromisoformat(
                    response.data[0]['last_collection_date']
                )
        except Exception as e:
            logger.warning(f"Could not retrieve last collection date: {e}")
            
        # Default to 30 days ago
        return datetime.now(timezone.utc) - timedelta(days=30)
    
    async def update_collection_date(self, collection_date: datetime):
        """Update the last successful collection date."""
        try:
            data = {
                'source_id': self.source_id,
                'last_collection_date': collection_date.isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            self.supabase.table("collection_metadata").upsert(
                data, on_conflict='source_id'
            ).execute()
            
            logger.info(f"Updated collection date for {self.source_id}")
        except Exception as e:
            logger.error(f"Failed to update collection date: {e}")
    
    def _generate_content_hash(self, content: str) -> str:
        """Generate a hash for content deduplication."""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    async def _check_existing_record(self, record_id: str) -> Optional[Dict]:
        """Check if a record already exists in the database."""
        try:
            response = self.supabase.table("collected_data").select("*").eq(
                "record_id", record_id
            ).limit(1).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            return None
    
    async def _save_record(self, data: Dict[str, Any]):
        """Save a record to the database."""
        try:
            # Prepare data for database
            db_data = {
                'record_id': data.get('id'),
                'title': data.get('title'),
                'description': data.get('description'),
                'url': data.get('url'),
                'source_id': self.source_id,
                'content_hash': data.get('content_hash'),
                'metadata': data.get('metadata', {}),
                'collected_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Check if record exists
            existing = await self._check_existing_record(data.get('id'))
            
            if existing:
                if existing.get('content_hash') != data.get('content_hash'):
                    logger.info(f"Updating existing record: {data.get('id')}")
                    self.supabase.table("collected_data").update(db_data).eq(
                        "record_id", data.get('id')
                    ).execute()
                else:
                    logger.info(f"Record unchanged: {data.get('id')}")
            else:
                logger.info(f"Inserting new record: {data.get('id')}")
                self.supabase.table("collected_data").insert(db_data).execute()
                
        except Exception as e:
            logger.error(f"Failed to save record: {e}")
    
    async def _extract_page_data(self, page: Page, url: str) -> Dict[str, Any]:
        """
        Extract structured data from a web page.
        
        This method demonstrates intelligent content parsing and data extraction.
        """
        try:
            # Wait for page to load
            await page.wait_for_load_state('networkidle')
            
            # Extract basic page information
            title = await page.title()
            
            # Extract main content (customize based on target site structure)
            content_elements = await page.query_selector_all('main, article, .content, .main')
            
            content = ""
            if content_elements:
                content = await content_elements[0].inner_text()
            else:
                # Fallback to body content
                body = await page.query_selector('body')
                if body:
                    content = await body.inner_text()
            
            # Generate content hash for deduplication
            content_hash = self._generate_content_hash(content)
            
            # Extract metadata
            metadata = {
                'url': url,
                'title': title,
                'content_length': len(content),
                'extracted_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Generate unique record ID
            record_id = hashlib.md5(f"{url}{title}".encode()).hexdigest()
            
            return {
                'id': record_id,
                'title': title,
                'description': content[:500] + "..." if len(content) > 500 else content,
                'url': url,
                'content_hash': content_hash,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Failed to extract data from {url}: {e}")
            return None
    
    async def _process_url(self, browser: Browser, url: str) -> Optional[Dict]:
        """Process a single URL and extract data."""
        page = None
        try:
            page = await browser.new_page()
            
            # Set user agent for respectful crawling
            await page.set_extra_http_headers({
                'User-Agent': 'DataFlow-Pro/1.0 (Respectful Crawler)'
            })
            
            # Navigate to page with timeout
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            # Rate limiting
            await asyncio.sleep(self.rate_limit_delay)
            
            # Extract data
            data = await self._extract_page_data(page, url)
            
            if data:
                await self._save_record(data)
                return data
                
        except Exception as e:
            logger.error(f"Failed to process {url}: {e}")
            return None
        finally:
            if page:
                await page.close()
    
    async def collect_data(self, urls: List[str]) -> List[Dict]:
        """
        Main data collection method.
        
        Args:
            urls: List of URLs to process
            
        Returns:
            List of collected data records
        """
        logger.info(f"Starting data collection for {len(urls)} URLs")
        
        collected_data = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            
            # Process URLs with concurrency control
            semaphore = asyncio.Semaphore(self.max_concurrent_pages)
            
            async def process_with_semaphore(url):
                async with semaphore:
                    return await self._process_url(browser, url)
            
            # Create tasks for all URLs
            tasks = [process_with_semaphore(url) for url in urls]
            
            # Execute tasks and collect results
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, dict):
                    collected_data.append(result)
                elif isinstance(result, Exception):
                    logger.error(f"Task failed: {result}")
            
            await browser.close()
        
        logger.info(f"Data collection completed. Processed {len(collected_data)} records")
        return collected_data
    
    async def run_collection_job(self, urls: List[str]):
        """
        Run a complete data collection job with proper error handling and logging.
        """
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info(f"Starting collection job for source: {self.source_id}")
            
            # Collect data
            results = await self.collect_data(urls)
            
            # Update collection metadata
            await self.update_collection_date(start_time)
            
            logger.info(f"Collection job completed successfully. "
                       f"Processed {len(results)} records in "
                       f"{(datetime.now(timezone.utc) - start_time).total_seconds():.2f}s")
            
            return results
            
        except Exception as e:
            logger.error(f"Collection job failed: {e}")
            raise


# Example usage and demonstration
async def main():
    """Example usage of the DataCollector class."""
    
    # Initialize collector
    collector = DataCollector(
        source_id="example_source",
        base_url="https://example.com"
    )
    
    # Example URLs to process
    urls = [
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3"
    ]
    
    # Run collection job
    results = await collector.run_collection_job(urls)
    
    print(f"Collected {len(results)} records")


if __name__ == "__main__":
    asyncio.run(main()) 