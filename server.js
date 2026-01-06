require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve static files from project root so the site is available at /
// But protect dashboard.html
app.get('/dashboard.html', basicAuth({ users: { 'superdmin': 'password' } }), (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.use(express.static(path.join(__dirname)));

// Simple proxy endpoint for real-time matches.
// The real API base URL should be set in REALTIME_API_URL
// The secret token is read from process.env.RT_TOKEN and never stored in the repo.
app.get('/api/matches', async (req, res) => {
  try {
    const apiUrl = process.env.REALTIME_API_URL;
    const token = process.env.RT_TOKEN;
    if (!apiUrl) return res.status(500).json({ error: 'REALTIME_API_URL not configured' });
    if (!token) return res.status(500).json({ error: 'RT_TOKEN not configured' });

    const resp = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: req.query
    });

    return res.json(resp.data);
  } catch (err) {
    console.error('Upstream request failed:', err?.message || err);
    const status = err?.response?.status || 502;
    const data = err?.response?.data || { error: 'upstream error' };
    return res.status(status).json(data);
  }
});

// Proxy endpoint for trending news
app.get('/api/trending', async (req, res) => {
  try {
    // Prefer an explicit trending endpoint if provided, otherwise try REALTIME_API_URL + /trending
    const trendingUrl = process.env.REALTIME_TRENDING_URL || (process.env.REALTIME_API_URL ? `${process.env.REALTIME_API_URL.replace(/\/$/, '')}/trending` : null);
    const token = process.env.RT_TOKEN;
    
    // If no upstream URL is configured, return empty array (graceful fallback)
    if (!trendingUrl) {
      console.warn('REALTIME_TRENDING_URL not configured; returning empty trending data');
      return res.json([]);
    }
    
    if (!token) return res.status(500).json({ error: 'RT_TOKEN not configured' });

    const resp = await axios.get(trendingUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: req.query
    });

    return res.json(resp.data);
  } catch (err) {
    console.error('Upstream trending request failed:', err?.message || err);
    // Fallback to manual trending
    try {
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      return res.json(data.trending || []);
    } catch (e) {
      return res.json([]);
    }
  }
});

// Proxy endpoint for breaking news
app.get('/api/breaking-news', async (req, res) => {
  try {
    const breakingUrl = process.env.REALTIME_BREAKING_NEWS_URL || (process.env.REALTIME_API_URL ? `${process.env.REALTIME_API_URL.replace(/\/$/, '')}/breaking` : null);
    const newsApiKey = process.env.NEWS_API_KEY;
    const token = process.env.RT_TOKEN;
    
    // Try custom endpoint first
    if (breakingUrl && token) {
      try {
        const resp = await axios.get(breakingUrl, {
          headers: { Authorization: `Bearer ${token}` },
          params: req.query
        });
        return res.json(resp.data);
      } catch (err) {
        console.error('Upstream breaking news request failed:', err?.message || err);
        // Fall through to NewsAPI if available
      }
    }
    
    // Fallback to NewsAPI if key is available
    if (newsApiKey) {
      const q = req.query.q || 'sports breaking';
      const sortBy = req.query.sortBy || 'publishedAt';
      const resp = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q,
          sortBy,
          apiKey: newsApiKey
        }
      });
      return res.json(resp.data.articles || []);
    }
    
    console.warn('Neither REALTIME_BREAKING_NEWS_URL nor NEWS_API_KEY configured');
    return res.json([]);
  } catch (err) {
    console.error('Breaking news request failed:', err?.message || err);
    // Fallback to manual breaking
    try {
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      return res.json(data.breaking || []);
    } catch (e) {
      return res.json([]);
    }
  }
});

// Proxy endpoint for articles
app.get('/api/articles', async (req, res) => {
  try {
    const articlesUrl = process.env.REALTIME_ARTICLES_URL || (process.env.REALTIME_API_URL ? `${process.env.REALTIME_API_URL.replace(/\/$/, '')}/articles` : null);
    const newsApiKey = process.env.NEWS_API_KEY;
    const token = process.env.RT_TOKEN;
    
    // Try custom endpoint first
    if (articlesUrl && token) {
      try {
        const resp = await axios.get(articlesUrl, {
          headers: { Authorization: `Bearer ${token}` },
          params: req.query
        });
        return res.json(resp.data);
      } catch (err) {
        console.error('Upstream articles request failed:', err?.message || err);
        // Fall through to NewsAPI if available
      }
    }
    
    // Fallback to NewsAPI if key is available
    if (newsApiKey) {
      const q = req.query.q || 'sports';
      const sortBy = req.query.sortBy || 'publishedAt';
      const resp = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q,
          sortBy,
          apiKey: newsApiKey
        }
      });
      return res.json(resp.data.articles || []);
    }
    
    console.warn('Neither REALTIME_ARTICLES_URL nor NEWS_API_KEY configured');
    return res.json([]);
  } catch (err) {
    console.error('Articles request failed:', err?.message || err);
    // Fallback to manual articles
    try {
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      return res.json(data.articles || []);
    } catch (e) {
      return res.json([]);
    }
  }
});

// Proxy endpoint for videos
app.get('/api/videos', async (req, res) => {
  try {
    const videosUrl = process.env.REALTIME_VIDEOS_URL || (process.env.REALTIME_API_URL ? `${process.env.REALTIME_API_URL.replace(/\/$/, '')}/videos` : null);
    const token = process.env.RT_TOKEN;
    
    if (!videosUrl) {
      console.warn('REALTIME_VIDEOS_URL not configured; returning empty videos');
      return res.json([]);
    }
    
    if (!token) return res.status(500).json({ error: 'RT_TOKEN not configured' });

    const resp = await axios.get(videosUrl, {
      headers: { Authorization: `Bearer ${token}` },
      params: req.query
    });

    return res.json(resp.data);
  } catch (err) {
    console.error('Upstream videos request failed:', err?.message || err);
    // Fallback to manual videos
    try {
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      return res.json(data.videos || []);
    } catch (e) {
      return res.json([]);
    }
  }
});

// Dashboard routes for manual data management
app.get('/api/manual/:type', (req, res) => {
  try {
    const type = req.params.type;
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.json(data[type] || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/manual/:type', (req, res) => {
  try {
    const type = req.params.type;
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    data[type] = req.body;
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
