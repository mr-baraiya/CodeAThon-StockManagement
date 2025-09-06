# Environment Configuration

This project uses environment variables to configure different settings for development, staging, and production environments.

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:9705
   VITE_APP_NAME="Code-A-Thon"
   VITE_APP_VERSION=1.0.0
   VITE_NODE_ENV=development
   ```

## Environment Files

- `.env` - Default environment variables
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables
- `.env.example` - Example template (safe to commit)

## Available Variables

### Required
- `VITE_API_BASE_URL` - Backend API base URL (e.g., http://localhost:9705)

### Optional
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_NODE_ENV` - Environment (development/production)

## Usage in Code

```javascript
// Using the config helper
import config from '../config';

console.log(config.apiBaseUrl); // http://localhost:9705
console.log(config.appName); // Code-A-Thon

// Direct access (not recommended)
console.log(import.meta.env.VITE_API_BASE_URL);
```

## Important Notes

1. **Vite Prefix**: All environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

2. **Security**: Never store sensitive information like API keys or secrets in client-side environment variables.

3. **Git**: Environment files (except `.env.example`) are gitignored for security.

## Development vs Production

### Development
```env
VITE_API_BASE_URL=http://localhost:9705
VITE_NODE_ENV=development
```

### Production
```env
VITE_API_BASE_URL=https://your-production-api.com
VITE_NODE_ENV=production
```
