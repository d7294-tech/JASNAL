const CACHE_NAME='jasnal-v34';
const CORE=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  const isNavigation=event.request.mode==='navigate';
  const isAppShell=
    isNavigation ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/manifest.webmanifest') ||
    url.pathname.endsWith('/sw.js');

  // 앱 본체는 항상 네트워크를 먼저 확인하고 브라우저 HTTP 캐시도 우회.
  if(isAppShell){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          if(response && response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(async ()=>{
          return (await caches.match(event.request))
            || (await caches.match('./index.html'))
            || Response.error();
        })
    );
    return;
  }

  // 동일 출처 정적 리소스도 network-first로 최신 파일 우선.
  event.respondWith(
    fetch(event.request,{cache:'no-cache'})
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(async ()=>{
        return (await caches.match(event.request))
          || (await caches.match('./index.html'))
          || Response.error();
      })
  );
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client){
          if('navigate' in client)client.navigate(target).catch(()=>{});
          return client.focus();
        }
      }
      if(clients.openWindow)return clients.openWindow(target);
    })
  );
});
