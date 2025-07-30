# Vercel Cron Job Setup

## Overview
This application uses a Vercel cron job to automatically geocode planning application addresses daily at 1am. This moves the resource-intensive geocoding process from the frontend to the server.

## Setup Instructions

### 1. Environment Variables
Add the following environment variable to your Vercel project:

```
CRON_SECRET=your-secret-key-here
```

Generate a secure random string for `CRON_SECRET`. This is used to authenticate the cron job requests.

### 2. Vercel Configuration
The `vercel.json` file is already configured with:
```json
{
  "crons": [
    {
      "path": "/api/cron/geocode-applications",
      "schedule": "0 1 * * *"
    }
  ]
}
```

This runs the geocoding job daily at 1am UTC.

### 3. How It Works

#### Cron Job (`/api/cron/geocode-applications`)
- **Runs**: Daily at 1am UTC
- **Purpose**: Geocodes applications without coordinates
- **Process**:
  1. Fetches applications missing latitude/longitude
  2. Uses free Nominatim geocoding service
  3. Updates database with coordinates
  4. Respects rate limits (1 second delay between batches)

#### Frontend Map Component
- **No geocoding**: Removed all frontend geocoding logic
- **Instant display**: Uses pre-geocoded coordinates from database
- **Borough colors**: London boroughs have unique colors
- **Council filtering**: Map respects dashboard council filters
- **Performance**: Much faster and more responsive

### 4. London Borough Colors
Each London borough has a unique color for easy identification:
- Barking and Dagenham: Red (#FF6B6B)
- Barnet: Teal (#4ECDC4)
- Camden: Purple (#DDA0DD)
- Ealing: Yellow (#F7DC6F)
- And many more...

### 5. Benefits
- **Performance**: No frontend geocoding delays
- **Reliability**: Server-side processing with error handling
- **Cost**: Uses free geocoding service
- **User Experience**: Instant map loading
- **Scalability**: Handles large datasets efficiently

### 6. Monitoring
Check Vercel function logs to monitor cron job execution:
- Success/failure counts
- Processing time
- Error logs

### 7. Manual Trigger (Optional)
You can manually trigger the geocoding by calling:
```
GET /api/cron/geocode-applications
Authorization: Bearer your-cron-secret
```

## Troubleshooting

### Cron Job Not Running
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Check Vercel function logs for errors
3. Ensure `vercel.json` is in the root directory

### Geocoding Failures
1. Check Nominatim service status
2. Verify address format in database
3. Review rate limiting (1 second delays between batches)

### Map Not Showing Markers
1. Ensure applications have coordinates in database
2. Check council filter settings
3. Verify Leaflet map initialization 