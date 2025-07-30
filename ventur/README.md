# Ventur - Planning Application Tracker

A comprehensive SaaS platform for construction businesses to find and connect with planning applicants.

## Features

- Real-time monitoring of planning applications from 50+ UK councils
- AI-powered lead generation and filtering
- Interactive map view with geolocation
- Automated outreach system with professional templates
- Multi-bucket organization system
- Dashboard with analytics and insights

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables
4. Run the development server: `npm run dev`

## Troubleshooting

### Geolocation Issues

If you encounter geolocation errors:

1. **Permission Denied**: The browser is blocking location access
   - Solution: Allow location access in your browser settings
   - The app will fallback to London coordinates if blocked

2. **Map Loading Issues**: If the map doesn't load properly
   - Solution: Refresh the page and wait for the map to initialize
   - Check browser console for any JavaScript errors

### Common Error Messages

- `GeolocationPositionError code: 1`: Location access blocked by browser
- `Cannot read properties of undefined (reading '_leaflet_pos')`: Map initialization issue

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: May require manual location permission
- Mobile browsers: Location access may be restricted

## Development

### Tech Stack

- Next.js 14 with App Router
- TypeScript
- Supabase (Database & Auth)
- Leaflet (Maps)
- DaisyUI (UI Components)
- Tailwind CSS

### Key Components

- `ApplicationsMap.tsx`: Interactive map component
- `Dashboard`: Main application view
- `Applications`: Saved applications management
- `Send`: Letter sending functionality

## License

MIT License - see LICENSE file for details.
