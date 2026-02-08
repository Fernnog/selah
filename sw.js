const CACHE_NAME = 'selah-v1-static';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './assets/js/core.js',
  './assets/js/view.js',
  './assets/js/engine.js',
  './assets/js/controller.js',
  './assets/js/fileManager.js',
  './assets/js/changelog.js',
  './img/logo.png',
  './img/favicon.ico',
  './img/android-chrome-192x192.png',
  './img/android-chrome-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 1. Instalação: Baixa e salva os arquivos no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Selah SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigos se a versão mudar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Selah SW] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Interceptação (Fetch): Serve do Cache primeiro, depois tenta Rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições do Firebase (Firestore/Auth) para não quebrar a sincronização
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com')) {
    return; // Deixa o Firebase lidar com a rede normalmente
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se está no cache, retorna do cache
      return response || fetch(event.request);
    })
  );
});
