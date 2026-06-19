const CACHE_NAME = 'alien-claw-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js?v=3'
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.map(k=>{ if(k!==CACHE_NAME) return caches.delete(k); }))).then(()=> self.clients.claim()));
});

self.addEventListener('fetch', (e)=>{
  // Serve cached assets first, but allow versioned app.js bypass
  const url = new URL(e.request.url);
  if(url.pathname === '/app.js' || url.pathname === '/app.js/'){
    // don't serve stale unversioned app.js; try network first
    e.respondWith(fetch(e.request).catch(()=> caches.match('/app.js?v=3')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
