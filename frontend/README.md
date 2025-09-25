# URL Shortener Frontend

This is the frontend for the URL Shortener application, built with React and Vite.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

## Deployment

This frontend is configured to be deployed on Vercel. The deployment is automated via GitHub integration.

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

### Vercel Configuration

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Your Render backend URL

## Testing

```bash
npm test
```
