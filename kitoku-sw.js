const KITOKU_CACHE = 'kitoku-pwa-v6-academy-travel-pdf';
const KITOKU_CORE = [
  './index.html',
  './top.html',
  './kyusei_v2.html',
  './academy.html',
  './academy_pdf_00.html',
  './academy_pdf_01.html',
  './academy_pdf_start_01.html',
  './academy_pdf_start_02.html',
  './academy_pdf_start_03.html',
  './academy_pdf_app_setup.html',
  './academy_pdf_guide_family.html',
  './academy_pdf_guide_travel.html',
  './kitoku-manifest.json',
  './kitoku-icon-180.png',
  './kitoku-icon-192.png',
  './kitoku-icon-512.png',
  './kitoku_academy_00.pdf',
  './kitoku_academy_01.pdf',
  './kitoku_academy_start_01.pdf',
  './kitoku_academy_start_02.pdf',
  './kitoku_academy_start_03.pdf',
  './kitoku_academy_app_setup.pdf',
  './kitoku_academy_guide_family.pdf',
  './kitoku_academy_guide_travel.pdf',
  './academy_pages/start01/page-1.png',
  './academy_pages/start01/page-2.png',
  './academy_pages/start01/page-3.png',
  './academy_pages/start01/page-4.png',
  './academy_pages/start01/page-5.png',
  './academy_pages/start02/page-1.png',
  './academy_pages/start02/page-2.png',
  './academy_pages/start02/page-3.png',
  './academy_pages/start02/page-4.png',
  './academy_pages/start02/page-5.png',
  './academy_pages/start02/page-6.png',
  './academy_pages/start02/page-7.png',
  './academy_pages/start02/page-8.png',
  './academy_pages/start02/page-9.png',
  './academy_pages/start03/page-1.png',
  './academy_pages/start03/page-2.png',
  './academy_pages/start03/page-3.png',
  './academy_pages/start03/page-4.png',
  './academy_pages/start03/page-5.png',
  './academy_pages/start03/page-6.png',
  './academy_pages/start03/page-7.png',
  './academy_pages/app_setup/page-1.png',
  './academy_pages/app_setup/page-2.png',
  './academy_pages/app_setup/page-3.png',
  './academy_pages/app_setup/page-4.png',
  './academy_pages/guide_family/page-1.png',
  './academy_pages/guide_family/page-2.png',
  './academy_pages/guide_family/page-3.png',
  './academy_pages/guide_family/page-4.png',
  './academy_pages/guide_family/page-5.png',
  './academy_pages/guide_family/page-6.png',
  './academy_pages/guide_family/page-7.png',
  './academy_pages/guide_travel/page-1.png',
  './academy_pages/guide_travel/page-2.png',
  './academy_pages/guide_travel/page-3.png',
  './academy_pages/guide_travel/page-4.png',
  './academy_pages/guide_travel/page-5.png',
  './academy_pages/guide_travel/page-6.png',
  './academy_pages/guide_travel/page-7.png',
  './academy_pages/guide_travel/page-8.png',
  './academy_pages/00/page-1.png',
  './academy_pages/00/page-2.png',
  './academy_pages/00/page-3.png',
  './academy_pages/00/page-4.png',
  './academy_pages/00/page-5.png',
  './academy_pages/00/page-6.png',
  './academy_pages/00/page-7.png',
  './academy_pages/00/page-8.png',
  './academy_pages/00/page-9.png',
  './academy_pages/00/page-10.png',
  './academy_pages/00/page-11.png',
  './academy_pages/00/page-12.png',
  './academy_pages/00/page-13.png',
  './academy_pages/01/page-1.png',
  './academy_pages/01/page-2.png',
  './academy_pages/01/page-3.png',
  './academy_pages/01/page-4.png',
  './academy_pages/01/page-5.png',
  './academy_pages/01/page-6.png',
  './academy_pages/01/page-7.png',
  './academy_pages/01/page-8.png',
  './academy_pages/01/page-9.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(KITOKU_CACHE).then(cache => cache.addAll(KITOKU_CORE)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== KITOKU_CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(KITOKU_CACHE).then(cache => cache.put(event.request, copy)).catch(() => null);
      return response;
    }).catch(() => caches.match(event.request))
  );
});
