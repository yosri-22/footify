# Secure proxy for real-time matches (local)

This repo is a static site. To use your provided real-time token safely, run a small proxy server locally (or deploy a server) which keeps the token on the server-side and forwards requests from the client.

What I added:
- `server.js` — small Express proxy that reads `RT_TOKEN` and `REALTIME_API_URL` from the environment and exposes `/api/matches`.
- `realtime-client.js` — minimal client script (no token) that polls `/api/matches` and emits a `realtimeMatches` event with the data.
- `.env.example` — example environment variables (do not put real tokens here in source control).
- `.gitignore` — ignores `.env` and `node_modules`.

Security note
- Never store the secret token in client-side code or commit it into the repository. Anyone with access to the client bundle can extract it.

Local run (PowerShell)
1. Install dependencies:

```powershell
cd 'c:\Users\Pc\Desktop\my website'
npm install
```

2. Configure the token and API URL for the proxy. Two options:
- Temporarily set env vars in the current PowerShell session (recommended for quick local testing):

```powershell
$env:RT_TOKEN = 'PASTE_YOUR_TOKEN_HERE'
$env:REALTIME_API_URL = 'https://api.example.com/matches'
$env:PORT = '3000'
npm start
```

- Or create a `.env` file (do not commit it):

```
RT_TOKEN=PASTE_YOUR_TOKEN_HERE
REALTIME_API_URL=https://api.example.com/matches
PORT=3000
```

3. Start the proxy:

```powershell
npm start
```

4. Update your pages to include the client script (example in `index.html` before `</body>`):

```html
<script src="/realtime-client.js"></script>
<script>
  // example listener
  window.addEventListener('realtimeMatches', (e) => {
    console.log('matches:', e.detail);
    // Render to DOM as needed
  });
</script>
```

If you want, I can automatically add the `<script src="/realtime-client.js"></script>` tag into `index.html` (or specific pages). Ask me to do that and I'll patch it in.
