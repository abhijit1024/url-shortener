import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import './index.css'
import App from './App.jsx'

// Create emotion cache
const emotionCache = createCache({
  key: 'css',
  prepend: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <App />
    </CacheProvider>
  </StrictMode>,
)
