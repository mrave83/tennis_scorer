const CACHE_VERSION = "v2";
const CACHE_NAME = "tennis-scorer-" + CACHE_VERSION;
const ASSETS_TO_CACHE = ["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png"];
self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(ASSETS_TO_CACHE); }));
  self.skipWaiting();
});
self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf("tennis-scorer-")===0&&k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(function(cached){
    if (cached) return cached;
    return fetch(e.request).then(function(resp){
      if (resp && resp.status===200 && resp.type==="basic") {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(e.request, clone); });
      }
      return resp;
    }).catch(function(){ if (e.request.mode==="navigate") return caches.match("./index.html"); });
  }));
});
