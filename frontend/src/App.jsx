import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) return savedTheme === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Update dark mode class and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShortUrl('')

    try {
      const payload = {
        original_url: originalUrl,
        ...(customAlias && { custom_alias: customAlias })
      }

      const response = await fetch('http://localhost:8000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const data = await response.json()
      setShortUrl(data.short_url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
  }

  const handleRedirect = () => {
    window.open(shortUrl, '_blank')
  }


  return (
    <div className="container">
      <div className="header">
        <div className="icon">🔗</div>
        <h1>URL Shortener</h1>
        <p>Transform your long URLs into short, shareable links</p>
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
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
        </div>
        <div className="custom-alias-container">
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="Custom alias (optional)"
            className="custom-alias-input"
            pattern="[a-zA-Z0-9-_]+"
            title="Only alphanumeric characters, hyphens, and underscores are allowed"
          />
        </div>
      </form>

      {error && <div className="error">{error}</div>}
      
      {shortUrl && (
        <div className="result animate-in">
          <div className="success-icon">✅</div>
          <h3>Your shortened URL is ready!</h3>
          <div className="short-url-container">
            <input type="text" value={shortUrl} readOnly className="short-url" />
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy
            </button>
            <button onClick={handleRedirect} className="redirect-btn">
              🚀 Visit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
