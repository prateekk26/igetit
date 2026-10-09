// I Get It service worker: makes the app installable and shows reminders. No offline caching of the app itself (every
// deploy is fresh); only a one-page "You're offline" for opening the site with no connection, which showed the browser's
// own error page before (UX review 9 Oct).
const OFFLINE = 'igetit-offline-v1'
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(OFFLINE).then((c) => c.add('/offline.html')).catch(() => {})) })
self.addEventListener('activate', (e) => e.waitUntil(Promise.all([self.clients.claim(), caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== OFFLINE).map((k) => caches.delete(k))))])))
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return   // everything else goes to the network as before
  e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html').then((r) => r || Response.error())))
})
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data && e.data.text() } }
  e.waitUntil(self.registration.showNotification(d.title || 'I Get It', { body: d.body || 'Your next chapter is ready.', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: d.url || '/' } }))
})
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/'
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) { c.navigate(url); return c.focus() }
    return self.clients.openWindow(url)
  }))
})
