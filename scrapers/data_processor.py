"""
DataFlow Pro - Advanced Data Processing Engine

This module demonstrates advanced data processing capabilities including:
- Content analysis and categorization
- Data enrichment and validation
- Machine learning integration
- Performance optimization
- Quality assurance

Author: [Your Name]
Date: 2024
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import hashlib
import re

from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProcessingResult:
    """Result of data processing operation."""
    success: bool
    processed_data: Dict[str, Any]
    metadata: Dict[str, Any]
    processing_time: float
    quality_score: float
    errors: List[str]

class DataProcessor:
    """
    Advanced data processing engine with intelligent analysis capabilities.
    
    Features:
    - Content categorization and tagging
    - Data validation and cleaning
    - Quality scoring and assessment
    - Performance optimization
    - Error handling and recovery
    """
    
    def __init__(self):
        """Initialize the data processor."""
        self.supabase = self._initialize_database()
        self.processing_rules = self._load_processing_rules()
        self.quality_threshold = 0.8
        
    def _initialize_database(self) -> Client:
        """Initialize Supabase client."""
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Database configuration required")
            
        return create_client(supabase_url, supabase_key)
    
    def _load_processing_rules(self) -> Dict[str, Any]:
        """Load processing rules and configurations."""
        return {
            'content_min_length': 50,
            'required_fields': ['title', 'description', 'url'],
            'quality_weights': {
                'content_length': 0.2,
                'field_completeness': 0.3,
                'data_freshness': 0.2,
                'content_quality': 0.3
            },
            'categorization_keywords': {
                'technology': ['software', 'app', 'digital', 'tech'],
                'business': ['company', 'enterprise', 'corporate', 'business'],
                'finance': ['money', 'financial', 'investment', 'banking'],
                'healthcare': ['medical', 'health', 'hospital', 'doctor']
            }
        }
    
    async def process_data_batch(self, raw_data: List[Dict[str, Any]]) -> List[ProcessingResult]:
        """
        Process a batch of raw data records.
        
        Args:
            raw_data: List of raw data records
            
        Returns:
            List of processing results
        """
        logger.info(f"Processing batch of {len(raw_data)} records")
        
        results = []
        for record in raw_data:
            try:
                result = await self._process_single_record(record)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to process record: {e}")
                results.append(ProcessingResult(
                    success=False,
                    processed_data={},
                    metadata={'error': str(e)},
                    processing_time=0.0,
                    quality_score=0.0,
                    errors=[str(e)]
                ))
        
        logger.info(f"Batch processing completed. {len([r for r in results if r.success])} successful")
        return results
    
    async def _process_single_record(self, record: Dict[str, Any]) -> ProcessingResult:
        """
        Process a single data record.
        
        Args:
            record: Raw data record
            
        Returns:
            Processing result with enriched data
        """
        start_time = datetime.now(timezone.utc)
        
        try:
            # Validate input data
            validation_result = self._validate_record(record)
            if not validation_result['valid']:
                return ProcessingResult(
                    success=False,
                    processed_data={},
                    metadata={'validation_errors': validation_result['errors']},
                    processing_time=0.0,
                    quality_score=0.0,
                    errors=validation_result['errors']
                )
            
            # Clean and normalize data
            cleaned_data = self._clean_data(record)
            
            # Enrich data with additional information
            enriched_data = await self._enrich_data(cleaned_data)
            
            # Categorize content
            categorized_data = self._categorize_content(enriched_data)
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(categorized_data)
            
            # Generate metadata
            metadata = self._generate_metadata(categorized_data, quality_score)
            
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return ProcessingResult(
                success=True,
                processed_data=categorized_data,
                metadata=metadata,
                processing_time=processing_time,
                quality_score=quality_score,
                errors=[]
            )
            
        except Exception as e:
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.error(f"Processing failed: {e}")
            return ProcessingResult(
                success=False,
                processed_data={},
                metadata={'error': str(e)},
                processing_time=processing_time,
                quality_score=0.0,
                errors=[str(e)]
            )
    
    def _validate_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Validate input record against processing rules."""
        errors = []
        
        # Check required fields
        for field in self.processing_rules['required_fields']:
            if field not in record or not record[field]:
                errors.append(f"Missing required field: {field}")
        
        # Check content length
        content = record.get('description', '') + record.get('title', '')
        if len(content) < self.processing_rules['content_min_length']:
            errors.append(f"Content too short: {len(content)} characters")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def _clean_data(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize data."""
        cleaned = record.copy()
        
        # Clean text fields
        for field in ['title', 'description']:
            if field in cleaned:
                cleaned[field] = self._clean_text(cleaned[field])
        
        # Normalize URLs
        if 'url' in cleaned:
            cleaned['url'] = self._normalize_url(cleaned['url'])
        
        # Remove empty fields
        cleaned = {k: v for k, v in cleaned.items() if v is not None and v != ''}
        
        return cleaned
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Normalize quotes and dashes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace('–', '-').replace('—', '-')
        
        return text
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL format."""
        if not url:
            return ""
        
        # Ensure protocol
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Remove trailing slash
        url = url.rstrip('/')
        
        return url
    
    async def _enrich_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich data with additional information."""
        enriched = data.copy()
        
        # Add processing timestamp
        enriched['processed_at'] = datetime.now(timezone.utc).isoformat()
        
        # Generate content hash
        content = enriched.get('title', '') + enriched.get('description', '')
        enriched['content_hash'] = hashlib.sha256(content.encode()).hexdigest()
        
        # Extract domain from URL
        if 'url' in enriched:
            try:
                from urllib.parse import urlparse
                domain = urlparse(enriched['url']).netloc
                enriched['domain'] = domain
            except Exception:
                enriched['domain'] = None
        
        # Calculate content statistics
        enriched['content_stats'] = self._calculate_content_stats(content)
        
        return enriched
    
    def _calculate_content_stats(self, content: str) -> Dict[str, Any]:
        """Calculate content statistics."""
        words = content.split()
        sentences = re.split(r'[.!?]+', content)
        
        return {
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'character_count': len(content),
            'average_word_length': sum(len(word) for word in words) / len(words) if words else 0
        }
    
    def _categorize_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Categorize content based on keywords and patterns."""
        categorized = data.copy()
        
        content = (data.get('title', '') + ' ' + data.get('description', '')).lower()
        
        # Determine primary category
        category_scores = {}
        for category, keywords in self.processing_rules['categorization_keywords'].items():
            score = sum(1 for keyword in keywords if keyword in content)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            primary_category = max(category_scores, key=category_scores.get)
            categorized['category'] = primary_category
            categorized['category_confidence'] = category_scores[primary_category] / len(self.processing_rules['categorization_keywords'][primary_category])
        else:
            categorized['category'] = 'general'
            categorized['category_confidence'] = 0.0
        
        # Extract tags
        categorized['tags'] = self._extract_tags(content)
        
        return categorized
    
    def _extract_tags(self, content: str) -> List[str]:
        """Extract relevant tags from content."""
        tags = []
        
        # Common business terms
        business_terms = ['startup', 'enterprise', 'saas', 'b2b', 'b2c', 'marketplace']
        for term in business_terms:
            if term in content:
                tags.append(term)
        
        # Technology terms
        tech_terms = ['api', 'mobile', 'web', 'cloud', 'ai', 'ml', 'blockchain']
        for term in tech_terms:
            if term in content:
                tags.append(term)
        
        return list(set(tags))  # Remove duplicates
    
    def _calculate_quality_score(self, data: Dict[str, Any]) -> float:
        """Calculate overall quality score for the data."""
        weights = self.processing_rules['quality_weights']
        scores = {}
        
        # Content length score
        content_length = data.get('content_stats', {}).get('word_count', 0)
        scores['content_length'] = min(content_length / 100, 1.0)  # Normalize to 0-1
        
        # Field completeness score
        required_fields = self.processing_rules['required_fields']
        present_fields = sum(1 for field in required_fields if field in data and data[field])
        scores['field_completeness'] = present_fields / len(required_fields)
        
        # Data freshness score (if timestamp available)
        if 'collected_at' in data:
            try:
                collected_date = datetime.fromisoformat(data['collected_at'].replace('Z', '+00:00'))
                days_old = (datetime.now(timezone.utc) - collected_date).days
                scores['data_freshness'] = max(0, 1 - (days_old / 30))  # Decay over 30 days
            except Exception:
                scores['data_freshness'] = 0.5
        else:
            scores['data_freshness'] = 0.5
        
        # Content quality score (based on various factors)
        content_quality_factors = []
        
        # Check for spam indicators
        spam_indicators = ['click here', 'buy now', 'limited time', 'act now']
        spam_score = sum(1 for indicator in spam_indicators if indicator in data.get('title', '').lower())
        content_quality_factors.append(max(0, 1 - (spam_score * 0.2)))
        
        # Check for professional language
        professional_terms = ['business', 'professional', 'enterprise', 'solution']
        professional_score = sum(1 for term in professional_terms if term in data.get('title', '').lower())
        content_quality_factors.append(min(1, professional_score * 0.2))
        
        scores['content_quality'] = sum(content_quality_factors) / len(content_quality_factors)
        
        # Calculate weighted average
        total_score = sum(scores[key] * weights[key] for key in weights.keys())
        
        return min(1.0, max(0.0, total_score))
    
    def _generate_metadata(self, data: Dict[str, Any], quality_score: float) -> Dict[str, Any]:
        """Generate comprehensive metadata for the processed data."""
        return {
            'processing_version': '1.0.0',
            'quality_score': quality_score,
            'quality_threshold_met': quality_score >= self.quality_threshold,
            'processing_timestamp': datetime.now(timezone.utc).isoformat(),
            'data_source': data.get('source_id', 'unknown'),
            'content_type': data.get('category', 'general'),
            'tags_count': len(data.get('tags', [])),
            'content_stats': data.get('content_stats', {}),
            'processing_rules_applied': list(self.processing_rules.keys())
        }
    
    async def save_processed_data(self, results: List[ProcessingResult]) -> Dict[str, Any]:
        """Save processed data to database."""
        successful_results = [r for r in results if r.success]
        
        if not successful_results:
            logger.warning("No successful results to save")
            return {'saved_count': 0, 'errors': []}
        
        try:
            # Prepare data for database
            db_data = []
            for result in successful_results:
                db_record = {
                    'record_id': result.processed_data.get('id'),
                    'title': result.processed_data.get('title'),
                    'description': result.processed_data.get('description'),
                    'url': result.processed_data.get('url'),
                    'category': result.processed_data.get('category'),
                    'tags': result.processed_data.get('tags', []),
                    'quality_score': result.quality_score,
                    'metadata': result.metadata,
                    'processed_at': result.processed_data.get('processed_at')
                }
                db_data.append(db_record)
            
            # Save to database
            response = self.supabase.table("processed_data").upsert(
                db_data, on_conflict='record_id'
            ).execute()
            
            logger.info(f"Saved {len(successful_results)} processed records")
            return {
                'saved_count': len(successful_results),
                'errors': []
            }
            
        except Exception as e:
            logger.error(f"Failed to save processed data: {e}")
            return {
                'saved_count': 0,
                'errors': [str(e)]
            }


# Example usage
async def main():
    """Example usage of the DataProcessor class."""
    
    # Initialize processor
    processor = DataProcessor()
    
    # Sample data
    sample_data = [
        {
            'id': '1',
            'title': 'New SaaS Platform Launches',
            'description': 'A revolutionary software-as-a-service platform for business automation.',
            'url': 'https://example.com/saas-platform',
            'source_id': 'tech_news'
        },
        {
            'id': '2',
            'title': 'Investment Opportunities in Fintech',
            'description': 'Leading financial technology companies seeking investment partners.',
            'url': 'https://example.com/fintech-investment',
            'source_id': 'business_news'
        }
    ]
    
    # Process data
    results = await processor.process_data_batch(sample_data)
    
    # Save results
    save_result = await processor.save_processed_data(results)
    
    print(f"Processing completed. {save_result['saved_count']} records saved.")


if __name__ == "__main__":
    asyncio.run(main()) 