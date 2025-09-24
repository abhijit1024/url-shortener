import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [recentLinks, setRecentLinks] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimer = useRef(null)

  // Toggle dark/light mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Load recent links from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem('recentLinks')
    if (savedLinks) {
      setRecentLinks(JSON.parse(savedLinks))
    }
  }, [])

  const API_BASE_URL = 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShortUrl('')
    setStats(null)

    try {
      // Basic URL validation
      if (!originalUrl) {
        throw new Error('Please enter a URL to shorten')
      }

      // Add https:// if not present
      let processedUrl = originalUrl;
      if (!/^https?:\/\//i.test(originalUrl)) {
        processedUrl = 'https://' + originalUrl;
      }

      const payload = { original_url: processedUrl }
      if (customAlias) {
        payload.custom_alias = customAlias
      }

      console.log('Sending request to:', `${API_BASE_URL}/shorten`);
      console.log('Request payload:', JSON.stringify(payload, null, 2));
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      console.log('Request options:', requestOptions);
      
      const response = await fetch(`${API_BASE_URL}/shorten`, requestOptions);
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      if (!data.short_url) {
        throw new Error('Invalid response from server: missing short_url');
      }

      setShortUrl(data.short_url)
      
      // Save to recent links
      const newLink = {
        original: originalUrl,
        short: data.short_url,
        clicks: 0,
        date: new Date().toISOString()
      }
      const updatedLinks = [newLink, ...recentLinks].slice(0, 5) // Keep only last 5
      setRecentLinks(updatedLinks)
      localStorage.setItem('recentLinks', JSON.stringify(updatedLinks))
      
      // Fetch stats (you'll need to implement this endpoint)
      // fetchStats(data.short_url)
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An error occurred while shortening the URL');
    } finally {
      setLoading(false);
    }
  }

  const fetchStats = async (url) => {
    try {
      // You'll need to implement this endpoint in your backend
      const response = await fetch(`http://localhost:8000/stats?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }


  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }
    
    toastTimer.current = setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      showToastMessage('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      showToastMessage('Failed to copy. Please try again.')
    }
  }

  const handleRedirect = () => {
    window.open(shortUrl, '_blank')
  }


  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="theme-toggle"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      <div className="header">
        <div className="icon">🔗</div>
        <h1>URL Shortener</h1>
        <p>Transform your long URLs into short, shareable links</p>
      </div>
      
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter your URL here..."
            required
            className="url-input"
          />
          <button type="submit" disabled={loading} className="shorten-btn">
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
          
          <div className="alias-input-container">
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="Custom alias (optional)"
              className="alias-input"
              disabled={loading}
            />
            <span className="alias-prefix">short.ly/</span>
          </div>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
      
      {shortUrl && (
        <div className="result animate-in">
          <div className="success-icon">✅</div>
          <h3>Your shortened URL is ready!</h3>
          <div className="short-url-container">
            <input 
              type="text" 
              value={shortUrl} 
              readOnly 
              className="short-url" 
              aria-label="Shortened URL"
            />
            <div className="button-group">
              <button 
                onClick={copyToClipboard} 
                className="action-btn copy-btn" 
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                📋 Copy
              </button>
              <button 
                onClick={handleRedirect} 
                className="action-btn redirect-btn" 
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                🔗 Open
              </button>
            </div>
          </div>
          
          
          {showToast && (
            <div className="toast">
              {toastMessage}
            </div>
          )}
          
          {stats && (
            <div className="stats-container">
              <h4>Link Statistics</h4>
              <p>Total clicks: {stats.clicks || 0}</p>
              {/* Add more stats as needed */}
            </div>
          )}
          
          {recentLinks.length > 0 && (
            <div className="recent-links">
              <h4>Recent Links</h4>
              <div className="links-table">
                <div className="table-header">
                  <span>Original URL</span>
                  <span>Short URL</span>
                  <span>Actions</span>
                </div>
                {recentLinks.map((link, index) => (
                  <div className="table-row" key={index}>
                    <span className="original-url">{link.original}</span>
                    <span className="short-url-cell">{link.short}</span>
                    <div className="actions">
                      <button onClick={() => navigator.clipboard.writeText(link.short)} title="Copy">
                        📋
                      </button>
                      <button onClick={() => window.open(link.short, '_blank')} title="Open">
                        🔗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
