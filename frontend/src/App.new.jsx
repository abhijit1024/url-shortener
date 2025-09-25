import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentLinks, setRecentLinks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  // Toggle dark/light mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load recent links from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem('recentLinks');
    if (savedLinks) {
      setRecentLinks(JSON.parse(savedLinks));
    }
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://url-shortener-n0rj.onrender.com';

  const showToastMessage = (message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setShowToast(false), duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      if (!originalUrl) {
        throw new Error('Please enter a URL to shorten');
      }

      let processedUrl = originalUrl;
      if (!/^https?:\/\//i.test(originalUrl)) {
        processedUrl = 'https://' + originalUrl;
      }

      const response = await fetch(`${API_BASE_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_url: processedUrl,
          custom_alias: customAlias || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to shorten URL');
      }

      const data = await response.json();
      setShortUrl(data.short_url);
      
      // Update recent links
      const newLink = {
        original: originalUrl,
        short: data.short_url,
        date: new Date().toISOString(),
      };
      
      setRecentLinks(prev => {
        const updated = [newLink, ...prev].slice(0, 5);
        localStorage.setItem('recentLinks', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while shortening the URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToastMessage('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToastMessage('Failed to copy. Please try again.');
    }
  };

  const handleRedirect = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="theme-toggle"
        aria-label="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <h1>URL Shortener</h1>
      
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            disabled={loading}
          />
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="Custom alias (optional)"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {shortUrl && (
        <div className="result">
          <p>Short URL:</p>
          <div className="short-url">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
            <div className="actions">
              <button onClick={copyToClipboard} title="Copy to clipboard">
                📋
              </button>
              <button onClick={handleRedirect} title="Open in new tab">
                🔗
              </button>
            </div>
          </div>
        </div>
      )}

      {recentLinks.length > 0 && (
        <div className="recent-links">
          <h3>Recent Links</h3>
          <div className="links-list">
            {recentLinks.map((link, index) => (
              <div key={index} className="link-item">
                <div className="link-info">
                  <div className="original-url">{link.original}</div>
                  <a href={link.short} target="_blank" rel="noopener noreferrer" className="short-url">
                    {link.short}
                  </a>
                </div>
                <div className="link-actions">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(link.short);
                      showToastMessage('Link copied to clipboard!');
                    }}
                    title="Copy"
                  >
                    📋
                  </button>
                  <button 
                    onClick={() => window.open(link.short, '_blank')}
                    title="Open"
                  >
                    🔗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showToast && (
        <div className={`toast ${showToast ? 'show' : ''}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
