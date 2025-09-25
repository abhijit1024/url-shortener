import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCustomAlias, setShowCustomAlias] = useState(false)
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) return JSON.parse(savedTheme)
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  });
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  // Save theme preference and update document class
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error parsing saved history:', err);
        localStorage.removeItem('urlHistory');
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('urlHistory', JSON.stringify(history));
    }
  }, [history]);

  // Toggle dark mode and save preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShortUrl('')

    try {
      // Basic URL validation
      if (!originalUrl) {
        throw new Error('Please enter a URL')
      }

      // Add https:// if not present
      let processedUrl = originalUrl.trim()
      if (!/^https?:\/\//i.test(processedUrl)) {
        processedUrl = 'https://' + processedUrl
      }

      const payload = { 
        original_url: processedUrl,
        custom_alias: showCustomAlias && customAlias ? customAlias.trim() : null
      }

      const response = await fetch('http://localhost:8000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to shorten URL')
      }

      setShortUrl(data.short_url)
      
      // Update history with the new URL
      const newUrl = {
        original_url: processedUrl,
        short_code: data.short_code,
        short_url: data.short_url,
        created_at: new Date().toISOString()
      }
      
      // Add to history and ensure we don't have duplicates
      setHistory(prev => {
        // Filter out any existing entry with the same short URL
        const filtered = prev.filter(item => item.short_url !== data.short_url);
        return [newUrl, ...filtered];
      });
      
      // Reset form
      setOriginalUrl('')
      setCustomAlias('')
      setShowCustomAlias(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const copyToClipboard = async (text, event) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show a temporary success message
      const originalText = event?.target?.textContent || 'Copy';
      if (event?.target) {
        event.target.textContent = 'Copied!';
        setTimeout(() => {
          if (event?.target) event.target.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard');
    }
  }
  const handleRedirect = () => {
    window.open(shortUrl, '_blank')
  }


  // Clear history function
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('urlHistory');
    }
  };

  // Generate random floating elements
  const floatingElements = Array.from({ length: 8 }).map((_, i) => {
    const size = Math.random() * 100 + 50; // 50-150px
    const duration = Math.random() * 15 + 10; // 10-25s
    const delay = Math.random() * 5; // 0-5s
    const posX = Math.random() * 100; // 0-100%
    const posY = Math.random() * 100; // 0-100%
    const opacity = Math.random() * 0.15 + 0.05; // 0.05-0.2
    const color = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 200)}, ${opacity})`;
    
    return (
      <div 
        key={i}
        className="floating-element"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${posX}%`,
          top: `${posY}%`,
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`,
          opacity: opacity,
          background: color,
          filter: `blur(${size * 0.2}px)`,
        }}
      />
    );
  });

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {floatingElements}
      <header className="app-header">
        <div className="header-content">
          <h1>🔗 URL Shortener</h1>
          <div className="header-actions">
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="theme-toggle-inner">
                <svg className="sun" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor" />
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg className="moon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4175C13.4879 20.9893 11.754 21.0833 10.0907 20.6869C8.42746 20.2905 6.90971 19.4205 5.74087 18.1924C4.57203 16.9642 3.8035 15.4292 3.53708 13.7846C3.27066 12.14 3.51738 10.4505 4.24853 8.94171C4.97968 7.43288 6.161 6.17449 7.63734 5.3486C9.11368 4.5227 10.814 4.16621 12.501 4.32853C13.3148 4.399 14.0055 4.779 14.4347 5.384C14.8639 5.98899 15.0106 6.764 14.832 7.505C14.6534 8.246 14.1549 8.898 13.5 9.25C12.8451 9.60199 12.1117 9.61599 11.5 9.5C11.1863 9.44071 10.8683 9.5598 10.682 9.798C10.4956 10.0362 10.4763 10.3525 10.633 10.61C11.51 12.102 11.216 14.008 9.99999 15.25C9.43174 15.8379 8.72787 16.2801 7.95199 16.537C8.91228 15.5993 9.50792 14.3507 9.62199 13.02C9.674 12.453 9.98999 12 10.5 12C10.7761 12 11 12.2239 11 12.5C11 12.7761 10.7761 13 10.5 13C10.3783 13 10.5 13.5 10.5 14C10.5 15.3807 9.38071 16.5 8 16.5C7.5 16.5 7 16.5 7 16.5C8.933 18.5 12 18.5 13 16.5C13.5 15.5 14.5 15.5 14.5 15.5C14.5 15.5 15.5 15.5 15.5 15.5C16.5 15.5 17.5 15.5 17.5 15.5C17.5 15.5 17.5 16 17.5 16.5C17.5 17.5 17 18.5 16 18.5C15.5 18.5 15 18.5 15 18.5C15 18.5 15 17.5 15 17C15 16.5 14.5 16 14 16C13.5 16 13.5 16.5 13.5 17C13.5 17.5 13.5 18 13.5 18.5C13.5 19 13.5 19.5 14 19.5C14.5 19.5 15 19.5 15.5 19.5C16 19.5 16.5 19.5 17 19.5C17.5 19.5 18 19.5 18.5 19.5C19 19.5 19.5 19 19.5 18.5C19.5 18 19.5 17.5 19.5 17C19.5 16.5 19.5 16 19.5 15.5C19.5 15 19.5 14.5 19.5 14C19.5 13.5 19.5 13 19.5 12.5C19.5 12.2239 19.2761 12 19 12C18.7239 12 18.5 12.2239 18.5 12.5C18.5 12.5 18.5 13 18.5 13.5C18.5 14 18.5 14.5 18.5 15C18.5 15.5 18.5 16 18.5 16.5C18.5 17 18.5 17.5 18.5 18C18.5 18.5 18.5 19 18 19C17.5 19 17 19 16.5 19C16 19 15.5 19 15 19C14.5 19 14 19 13.5 19C13 19 12.5 19 12 19C11.5 19 11 19 10.5 19C10 19 9.5 19 9 19C8.5 19 8 19 7.5 19C7 19 6.5 19 6 19C5.5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5.5 5 6 5C6.5 5 7 5 7.5 5C8 5 8.5 5 9 5C9.5 5 10 5 10.5 5C11 5 11.5 5 12 5C12.5 5 13 5 13.5 5C14 5 14.5 5 15 5C15.5 5 16 5 16.5 5C17 5 17.5 5 18 5C18.5 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 19 14.5 19 15C19 15.5 19 16 19 16.5C19 17 19 17.5 19 18C19 18.5 19 19 19 19.5C19 20 19 20.5 19 21C19 21.5 19 22 19 22.5C19 23 18.5 23.5 18 23.5C17.5 23.5 17 23.5 16.5 23.5C16 23.5 15.5 23.5 15 23.5C14.5 23.5 14 23.5 13.5 23.5C13 23.5 12.5 23.5 12 23.5C11.5 23.5 11 23.5 10.5 23.5C10 23.5 9.5 23.5 9 23.5C8.5 23.5 8 23.5 7.5 23.5C7 23.5 6.5 23.5 6 23.5C5.5 23.5 5 23 5 22.5C5 22 5 21.5 5 21C5 20.5 5 20 5 19.5C5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5 5 5 4.5C5 4 5 3.5 5 3C5 2.5 5.5 2 6 2C6.5 2 7 2 7.5 2C8 2 8.5 2 9 2C9.5 2 10 2 10.5 2C11 2 11.5 2 12 2C12.5 2 13 2 13.5 2C14 2 14.5 2 15 2C15.5 2 16 2 16.5 2C17 2 17.5 2 18 2C18.5 2 19 2.5 19 3C19 3.5 19 4 19 4.5C19 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 19 14.5 19 15C19 15.5 19 16 19 16.5C19 17 19 17.5 19 18C19 18.5 19 19 19 19.5C19 20 19 20.5 19 21C19 21.5 19 22 19 22.5C19 23 18.5 23.5 18 23.5C17.5 23.5 17 23.5 16.5 23.5C16 23.5 15.5 23.5 15 23.5C14.5 23.5 14 23.5 13.5 23.5C13 23.5 12.5 23.5 12 23.5C11.5 23.5 11 23.5 10.5 23.5C10 23.5 9.5 23.5 9 23.5C8.5 23.5 8 23.5 7.5 23.5C7 23.5 6.5 23.5 6 23.5C5.5 23.5 5 23 5 22.5C5 22 5 21.5 5 21C5 20.5 5 20 5 19.5C5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5 5 5 4.5C5 4 5 3.5 5 3C5 2.5 5.5 2 6 2C6.5 2 7 2 7.5 2C8 2 8.5 2 9 2C9.5 2 10 2 10.5 2C11 2 11.5 2 12 2C12.5 2 13 2 13.5 2C14 2 14.5 2 15 2C15.5 2 16 2 16.5 2C17 2 17.5 2 18 2C18.5 2 19 2.5 19 3C19 3.5 19 4 19 4.5C19 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 19 14.5 19 15C19 15.5 19 16 19 16.5C19 17 19 17.5 19 18C19 18.5 19 19 19 19.5C19 20 19 20.5 19 21C19 21.5 19 22 19 22.5C19 23 18.5 23.5 18 23.5C17.5 23.5 17 23.5 16.5 23.5C16 23.5 15.5 23.5 15 23.5C14.5 23.5 14 23.5 13.5 23.5C13 23.5 12.5 23.5 12 23.5C11.5 23.5 11 23.5 10.5 23.5C10 23.5 9.5 23.5 9 23.5C8.5 23.5 8 23.5 7.5 23.5C7 23.5 6.5 23.5 6 23.5C5.5 23.5 5 23 5 22.5C5 22 5 21.5 5 21C5 20.5 5 20 5 19.5C5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5 5 5 4.5C5 4 5 3.5 5 3C5 2.5 5.5 2 6 2C6.5 2 7 2 7.5 2C8 2 8.5 2 9 2C9.5 2 10 2 10.5 2C11 2 11.5 2 12 2C12.5 2 13 2 13.5 2C14 2 14.5 2 15 2C15.5 2 16 2 16.5 2C17 2 17.5 2 18 2C18.5 2 19 2.5 19 3C19 3.5 19 4 19 4.5C19 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 19 14.5 19 15C19 15.5 19 16 19 16.5C19 17 19 17.5 19 18C19 18.5 19 19 19 19.5C19 20 19 20.5 19 21C19 21.5 19 22 19 22.5C19 23 18.5 23.5 18 23.5C17.5 23.5 17 23.5 16.5 23.5C16 23.5 15.5 23.5 15 23.5C14.5 23.5 14 23.5 13.5 23.5C13 23.5 12.5 23.5 12 23.5C11.5 23.5 11 23.5 10.5 23.5C10 23.5 9.5 23.5 9 23.5C8.5 23.5 8 23.5 7.5 23.5C7 23.5 6.5 23.5 6 23.5C5.5 23.5 5 23 5 22.5C5 22 5 21.5 5 21C5 20.5 5 20 5 19.5C5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5 5 5 4.5C5 4 5 3.5 5 3C5 2.5 5.5 2 6 2C6.5 2 7 2 7.5 2C8 2 8.5 2 9 2C9.5 2 10 2 10.5 2C11 2 11.5 2 12 2C12.5 2 13 2 13.5 2C14 2 14.5 2 15 2C15.5 2 16 2 16.5 2C17 2 17.5 2 18 2C18.5 2 19 2.5 19 3C19 3.5 19 4 19 4.5C19 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 19 14.5 19 15C19 15.5 19 16 19 16.5C19 17 19 17.5 19 18C19 18.5 19 19 19 19.5C19 20 19 20.5 19 21C19 21.5 19 22 19 22.5C19 23 18.5 23.5 18 23.5C17.5 23.5 17 23.5 16.5 23.5C16 23.5 15.5 23.5 15 23.5C14.5 23.5 14 23.5 13.5 23.5C13 23.5 12.5 23.5 12 23.5C11.5 23.5 11 23.5 10.5 23.5C10 23.5 9.5 23.5 9 23.5C8.5 23.5 8 23.5 7.5 23.5C7 23.5 6.5 23.5 6 23.5C5.5 23.5 5 23 5 22.5C5 22 5 21.5 5 21C5 20.5 5 20 5 19.5C5 19 5 18.5 5 18C5 17.5 5 17 5 16.5C5 16 5 15.5 5 15C5 14.5 5 14 5 13.5C5 13 5 12.5 5 12C5 11.5 5 11 5 10.5C5 10 5 9.5 5 9C5 8.5 5 8 5 7.5C5 7 5 6.5 5 6C5 5.5 5 5 5 4.5C5 4 5 3.5 5 3C5 2.5 5.5 2 6 2C6.5 2 7 2 7.5 2C8 2 8.5 2 9 2C9.5 2 10 2 10.5 2C11 2 11.5 2 12 2C12.5 2 13 2 13.5 2C14 2 14.5 2 15 2C15.5 2 16 2 16.5 2C17 2 17.5 2 18 2C18.5 2 19 2.5 19 3C19 3.5 19 4 19 4.5C19 5 19 5.5 19 6C19 6.5 19 7 19 7.5C19 8 19 8.5 19 9C19 9.5 19 10 19 10.5C19 11 19 11.5 19 12C19 12.5 19 13 19 13.5C19 14 " fill="currentColor"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="url-form-container">
          <h2>Shorten a new URL</h2>
          <form onSubmit={handleSubmit} className="url-form">
            <div className="input-group">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="Enter your URL here..."
                required
                className="url-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !originalUrl.trim()} 
                className="shorten-btn"
              >
                {loading ? 'Shortening...' : 'Create Short Link'}
              </button>
            </div>
            <div className="alias-section">
              <button 
                type="button"
                onClick={() => setShowCustomAlias(!showCustomAlias)}
                className={`toggle-alias-btn ${showCustomAlias ? 'active' : ''}`}
                disabled={loading}
              >
                <span className="alias-btn-icon">✏️</span>
                {showCustomAlias ? 'Hide Custom Alias' : 'Customize Alias'}
              </button>
              
              {showCustomAlias && (
                <div className="alias-input-container">
                  <div className="alias-preview">
                    {window.location.origin}/
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric characters and limit length
                        if (/^[a-zA-Z0-9-]*$/.test(value) || value === '') {
                          setCustomAlias(value);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                      placeholder="my-custom-alias"
                      className="alias-input"
                      maxLength={20}
                      minLength={3}
                      title="3-20 alphanumeric characters and hyphens"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <div className="alias-hint">
                    {customAlias.length < 3 ? (
                      <span className="hint-warning">Minimum 3 characters</span>
                    ) : (
                      <span className="hint-ok">✓ Valid alias</span>
                    )}
                    <span className="char-count">{customAlias.length}/20</span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}
          
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
                  onClick={(e) => e.target.select()}
                />
                <button 
                  onClick={(e) => copyToClipboard(shortUrl, e)} 
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="redirect-btn"
                >
                  🚀 Visit
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="history-section">
          <div className="history-header">
            <h3>Your Shortened URLs</h3>
            {history.length > 0 && (
              <button 
                onClick={clearHistory} 
                className="clear-history-btn"
                title="Clear all history"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
          
          {history.length > 0 ? (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-original">
                    <div className="history-label">Original URL:</div>
                    <a 
                      href={item.original_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="original-url"
                      title={item.original_url}
                    >
                      {item.original_url.length > 50 
                        ? `${item.original_url.substring(0, 50)}...` 
                        : item.original_url}
                    </a>
                  </div>
                  <div className="history-short">
                    <div className="history-label">Short URL:</div>
                    <div className="short-url-container">
                      <input 
                        type="text" 
                        value={item.short_url} 
                        readOnly 
                        className="short-url"
                        onClick={(e) => e.target.select()}
                      />
                      <div className="button-group">
                        <button 
                          onClick={(e) => copyToClipboard(item.short_url, e)}
                          className="action-btn copy"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <a 
                          href={item.original_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn visit"
                          title="Visit URL"
                        >
                          🔗
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="history-time">
                    <div className="history-label">Created:</div>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-history">
              <p>No history yet. Shorten a URL to see it here!</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} URL Shortener</p>
      </footer>
    </div>
  )
}

export default App
