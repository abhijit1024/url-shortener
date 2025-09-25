import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Explicitly set the API base URL to use port 8001
const API_BASE_URL = 'http://localhost:8001';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentLinks, setRecentLinks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const toastTimer = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedLinks = localStorage.getItem('recentLinks');
    if (savedLinks) {
      setRecentLinks(JSON.parse(savedLinks));
    }
  }, []);

  const showToastMessage = (message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    
    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    setAlreadyExists(false);
    setExpiresAt('');

    try {
      if (!originalUrl) {
        throw new Error('Please enter a URL to shorten');
      }

      // Basic URL validation
      let processedUrl = originalUrl.trim();
      if (!/^https?:\/\//i.test(processedUrl)) {
        processedUrl = 'https://' + processedUrl;
      }

      // Prepare request body
      const requestBody = {
        original_url: processedUrl,
      };

      // Add optional fields if provided
      if (customAlias) {
        requestBody.custom_alias = customAlias.trim();
      }
      if (expiresInDays) {
        requestBody.expires_in_days = parseInt(expiresInDays, 10);
      }

      // Get auth token (if available)
      const token = localStorage.getItem('authToken');
      
      // Log request details
      console.log('Making request to:', `${API_BASE_URL}/shorten`);
      console.log('Request body:', requestBody);
      
      // Make API request
      try {
        const response = await fetch(`${API_BASE_URL}/shorten`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to shorten URL');
        }
        
        // Handle successful response
        setShortUrl(data.short_url);
        setAlreadyExists(data.already_exists || false);
        
        if (data.expires_at) {
          setExpiresAt(new Date(data.expires_at).toLocaleString());
        }

        // Update recent links if it's a new URL
        if (!data.already_exists) {
          const newLink = {
            original: requestBody.original_url,
            short: data.short_url,
            date: new Date().toISOString(),
            expires_at: data.expires_at,
          };

          setRecentLinks((prev) => {
            const updated = [newLink, ...prev].slice(0, 5);
            localStorage.setItem('recentLinks', JSON.stringify(updated));
            return updated;
          });
        }
        
        return data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while shortening the URL');
      showToastMessage(err.message || 'An error occurred', 5000);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const handleRedirect = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            URL Shortener
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL to shorten
              </label>
              <input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="button"
              onClick={toggleAdvanced}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 focus:outline-none"
            >
              {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            </button>

            {showAdvanced && (
              <div className="space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom alias (optional)
                  </label>
                  <input
                    id="customAlias"
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-link"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    pattern="[a-zA-Z0-9_-]{3,20}"
                    title="3-20 characters, letters, numbers, underscores, or hyphens"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    3-20 characters, letters, numbers, underscores, or hyphens
                  </p>
                </div>

                <div>
                  <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires in (days, optional)
                  </label>
                  <input
                    id="expiresInDays"
                    type="number"
                    min="1"
                    max="365"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    placeholder="Leave empty for no expiration"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty for no expiration (max 1 year)
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Shortening...
                </span>
              ) : (
                'Shorten URL'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        {shortUrl && (
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 p-4 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  {alreadyExists ? 'Found existing short URL:' : 'Your shortened URL:'}
                </p>
                <div className="flex items-center">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-mono text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {shortUrl}
                  </a>
                </div>
                
                {expiresAt && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Expires: {expiresAt}
                  </p>
                )}
                
                {alreadyExists && (
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    This URL was already shortened before.
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button
                  onClick={handleRedirect}
                  className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Open in new tab"
                >
                  ↗️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Links */}
        {recentLinks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recently Shortened
            </h2>
            
            <div className="space-y-3">
              {recentLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
                  <div className="min-w-0">
                    <a 
                      href={link.short} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      title={link.original}
                    >
                      {link.short.replace(/^https?:\/\//, '')}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1" title={link.original}>
                      {link.original.length > 50 ? link.original.substring(0, 50) + '...' : link.original}
                    </p>
                    {link.expires_at && (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Expires: {new Date(link.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(link.short);
                        showToastMessage('Link copied to clipboard!');
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                    <a
                      href={link.short}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      title="Open in new tab"
                    >
                      ↗️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-4 right-4 transition-all duration-300 transform ${
        showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)}
            className="ml-4 text-gray-300 hover:text-white focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
