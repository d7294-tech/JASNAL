const CACHE_NAME='jasnal-v39';
const CORE=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const appShell=event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/manifest.webmanifest')||url.pathname.endsWith('/sw.js');
  event.respondWith(
    fetch(event.request,{cache:appShell?'no-store':'no-cache'})
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(async()=>((await caches.match(event.request))||(await caches.match('./index.html'))||Response.error()))
  );
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client){
        if('navigate' in client)client.navigate(target).catch(()=>{});
        return client.focus();
      }
    }
    if(clients.openWindow)return clients.openWindow(target);
  }));
});
