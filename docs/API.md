# DataFlow Pro - API Documentation

## Overview

The DataFlow Pro API provides comprehensive endpoints for data collection, processing, and management. Built with Next.js API routes and TypeScript, it offers a robust, type-safe interface for frontend applications and third-party integrations.

## Base URL

```
Production: https://dataflow-pro.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Endpoints

### Data Collection

#### GET /api/data/collected

Retrieve collected data with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `source_id` (string): Filter by data source
- `date_from` (string): Filter by start date (ISO format)
- `date_to` (string): Filter by end date (ISO format)
- `search` (string): Search in title and description

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Data Title",
        "description": "Data description",
        "url": "https://example.com",
        "source_id": "source_name",
        "collected_at": "2024-01-15T10:30:00Z",
        "metadata": {}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /api/data/collect

Trigger a new data collection job.

**Request Body:**
```json
{
  "source_id": "source_name",
  "urls": ["https://example.com/page1", "https://example.com/page2"],
  "priority": "high|normal|low"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "status": "queued",
    "estimated_duration": 300
  }
}
```

#### GET /api/data/jobs/{job_id}

Get the status of a collection job.

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "status": "completed|running|failed",
    "progress": 75,
    "total_urls": 100,
    "processed_urls": 75,
    "started_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:35:00Z"
  }
}
```

### User Management

#### GET /api/user/profile

Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user|admin",
    "created_at": "2024-01-15T10:30:00Z",
    "settings": {}
  }
}
```

#### PUT /api/user/profile

Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "settings": {
    "notifications": true,
    "theme": "dark"
  }
}
```

### Analytics

#### GET /api/analytics/overview

Get platform analytics overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_records": 15000,
    "total_sources": 25,
    "records_today": 150,
    "active_jobs": 3,
    "collection_success_rate": 98.5,
    "average_processing_time": 2.3
  }
}
```

#### GET /api/analytics/sources

Get analytics by data source.

**Query Parameters:**
- `date_from` (string): Start date (ISO format)
- `date_to` (string): End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "source_id": "source_name",
      "total_records": 5000,
      "records_today": 50,
      "success_rate": 99.2,
      "average_processing_time": 1.8
    }
  ]
}
```

### Templates

#### GET /api/templates

Get communication templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template-uuid",
      "name": "Welcome Template",
      "content": "Hello {{name}}, welcome to our platform!",
      "variables": ["name"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/templates

Create a new template.

**Request Body:**
```json
{
  "name": "New Template",
  "content": "Hello {{name}}, this is a new template.",
  "variables": ["name"]
}
```

### Export

#### GET /api/export/data

Export collected data.

**Query Parameters:**
- `format` (string): csv|json|xml (default: csv)
- `source_id` (string): Filter by source
- `date_from` (string): Start date
- `date_to` (string): End date

**Response:**
```
CSV file download or JSON response
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Authentication endpoints**: 10 requests per minute
- **Data collection endpoints**: 5 requests per minute
- **Analytics endpoints**: 20 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## Webhooks

### POST /api/webhooks/data-collection

Webhook endpoint for data collection events.

**Request Body:**
```json
{
  "event": "collection.completed",
  "job_id": "job-uuid",
  "source_id": "source_name",
  "records_processed": 100,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { DataFlowAPI } from '@dataflow-pro/sdk';

const api = new DataFlowAPI({
  baseUrl: 'https://dataflow-pro.vercel.app/api',
  token: 'your-jwt-token'
});

// Get collected data
const data = await api.getCollectedData({
  page: 1,
  limit: 20,
  source_id: 'example_source'
});

// Trigger collection job
const job = await api.triggerCollection({
  source_id: 'example_source',
  urls: ['https://example.com/page1']
});
```

### Python

```python
import requests

class DataFlowAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def get_collected_data(self, params=None):
        response = requests.get(
            f'{self.base_url}/data/collected',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def trigger_collection(self, data):
        response = requests.post(
            f'{self.base_url}/data/collect',
            headers=self.headers,
            json=data
        )
        return response.json()
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Internal server error |

## Testing

### Postman Collection

Import the DataFlow Pro API collection into Postman:

```
https://dataflow-pro.vercel.app/api/docs/postman-collection.json
```

### API Testing

```bash
# Test authentication
curl -X POST https://dataflow-pro.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test data collection
curl -X GET https://dataflow-pro.vercel.app/api/data/collected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For API support and questions:

- **Documentation**: https://dataflow-pro.vercel.app/api/docs
- **GitHub Issues**: https://github.com/yourusername/dataflow-pro/issues
- **Email**: api-support@dataflow-pro.com

---

This API demonstrates modern RESTful design principles with comprehensive documentation and developer-friendly features. 