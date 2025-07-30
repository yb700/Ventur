# DataFlow Pro - Development Guide

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **Python** 3.9 or higher
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd dataflow-pro

# Install all dependencies
npm run setup

# Start development server
npm run dev
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Python Environment
PYTHONPATH=./scrapers
```

## Project Structure

```
dataflow-pro/
├── docs/                    # Documentation
├── scrapers/               # Python data collection modules
│   └── data_collector.py  # Main data collection engine
├── ventur/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript definitions
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
└── README.md            # Project overview
```

## Development Workflow

### Git Branching Strategy

We follow a structured Git workflow:

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add new data collection feature"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request for review
```

### Commit Message Convention

We use conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Quality

#### Frontend (TypeScript/Next.js)

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Run tests
npm run test
```

#### Backend (Python)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run linting
flake8 scrapers/

# Type checking
mypy scrapers/

# Run tests
pytest scrapers/tests/
```

## Development Tasks

### Adding New Data Sources

1. **Create a new collector class**:

```python
# scrapers/custom_collector.py
from scrapers.data_collector import DataCollector

class CustomDataCollector(DataCollector):
    def __init__(self, source_id: str, base_url: str):
        super().__init__(source_id, base_url)
    
    async def _extract_page_data(self, page, url):
        # Implement custom extraction logic
        pass
```

2. **Add configuration**:

```python
# scrapers/config.py
CUSTOM_SOURCE_CONFIG = {
    'source_id': 'custom_source',
    'base_url': 'https://example.com',
    'urls': ['https://example.com/page1', 'https://example.com/page2']
}
```

3. **Update job scheduler**:

```python
# scrapers/job_scheduler.py
from scrapers.custom_collector import CustomDataCollector

async def run_custom_collection():
    collector = CustomDataCollector(
        source_id='custom_source',
        base_url='https://example.com'
    )
    return await collector.run_collection_job(urls)
```

### Adding New Frontend Features

1. **Create a new component**:

```typescript
// ventur/components/NewFeature.tsx
import React from 'react';

interface NewFeatureProps {
  // Define your props
}

export const NewFeature: React.FC<NewFeatureProps> = ({}) => {
  return (
    <div>
      {/* Your component content */}
    </div>
  );
};
```

2. **Add API endpoint**:

```typescript
// ventur/app/api/new-feature/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your API logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

3. **Update types**:

```typescript
// ventur/types/index.ts
export interface NewFeatureData {
  // Define your data types
}
```

## Testing

### Frontend Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing

```bash
# Run Python tests
pytest scrapers/tests/

# Run with coverage
pytest --cov=scrapers scrapers/tests/

# Run specific test file
pytest scrapers/tests/test_data_collector.py
```

## Database Management

### Local Development

1. **Set up Supabase locally**:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

2. **Database migrations**:

```sql
-- Create new table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Production Database

1. **Supabase Dashboard**: Manage your production database
2. **Migrations**: Apply schema changes through Supabase CLI
3. **Backups**: Automated daily backups
4. **Monitoring**: Real-time database performance monitoring

## Deployment

### Frontend Deployment (Vercel)

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Backend Deployment

```bash
# Deploy Python workers
# Configure your preferred hosting platform
# (Heroku, Railway, DigitalOcean, etc.)
```

## Performance Optimization

### Frontend

1. **Code Splitting**: Use dynamic imports
2. **Image Optimization**: Use Next.js Image component
3. **Caching**: Implement proper caching strategies
4. **Bundle Analysis**: Monitor bundle size

### Backend

1. **Async Processing**: Use asyncio for concurrent operations
2. **Connection Pooling**: Optimize database connections
3. **Caching**: Implement Redis caching
4. **Monitoring**: Track performance metrics

## Troubleshooting

### Common Issues

#### Frontend Issues

1. **Build Errors**:
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **TypeScript Errors**:
   ```bash
   # Check types
   npm run type-check
   ```

3. **Environment Variables**:
   - Ensure all required env vars are set
   - Check `.env.local` file exists

#### Backend Issues

1. **Python Dependencies**:
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

2. **Database Connection**:
   - Verify Supabase credentials
   - Check network connectivity

3. **Playwright Issues**:
   ```bash
   # Install Playwright browsers
   playwright install
   ```

### Debug Mode

Enable debug logging:

```bash
# Frontend
DEBUG=* npm run dev

# Backend
python -u scrapers/data_collector.py --debug
```

## Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Update documentation**
6. **Submit a pull request**

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## Support

For development support:

1. **Check existing issues** on GitHub
2. **Create a new issue** with detailed description
3. **Join our Discord** for real-time help
4. **Review documentation** in the `/docs` folder

---

Happy coding! 🚀 