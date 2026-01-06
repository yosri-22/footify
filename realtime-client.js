// Minimal client script to fetch real-time matches from the secure proxy
// Place this file in the site root and include it from your pages with:
// <script src="/realtime-client.js"></script>

(function () {
  async function fetchMatches() {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      // Broadcast the data so your page can listen for it
      window.dispatchEvent(new CustomEvent('realtimeMatches', { detail: data }));
      console.log('Realtime matches:', data);
    } catch (err) {
      console.error('Failed to fetch realtime matches:', err);
    }
  }

  async function fetchTrending() {
    try {
      const res = await fetch('/api/trending');
      if (!res.ok) {
        const errText = await res.text();
        console.error(`/api/trending returned ${res.status}:`, errText);
        throw new Error(`Network response was not ok (${res.status})`);
      }
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('trendingNews', { detail: data }));
      console.log('Trending news:', data);
    } catch (err) {
      console.error('Failed to fetch trending news:', err);
      // Gracefully continue even if trending fails
    }
  }

  async function fetchBreakingNews() {
    try {
      const res = await fetch('/api/breaking-news');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('breakingNews', { detail: data }));
      console.log('Breaking news:', data);
    } catch (err) {
      console.error('Failed to fetch breaking news:', err);
    }
  }

  async function fetchArticles() {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('articlesData', { detail: data }));
      console.log('Articles:', data);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    }
  }

  async function fetchVideos() {
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('videosData', { detail: data }));
      console.log('Videos:', data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
  }

  // Poll every 15 seconds (adjust as needed)
  const POLL_INTERVAL = 15000;
  setInterval(() => { 
    fetchMatches(); 
    fetchTrending(); 
    fetchBreakingNews();
    fetchArticles();
    fetchVideos();
  }, POLL_INTERVAL);
  // Run once at load
  fetchMatches();
  fetchTrending();
  fetchBreakingNews();
  fetchArticles();
  fetchVideos();

})();
