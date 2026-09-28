const CACHE_NAME='jasnal-v22';
const CORE=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
  );
});


self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client)return client.focus();
      }
      if(clients.openWindow)return clients.openWindow(target);
    })
  );
});


self.addEventListener('push',event=>{
  let data={};
  try{
    data=event.data ? event.data.json() : {};
  }catch(e){
    data={body:event.data ? event.data.text() : ''};
  }

  const title=data.title || 'FC 우리풋살';
  const options={
    body:data.body || '새 알림이 있습니다.',
    tag:data.tag || 'jasnal-push',
    data:{url:data.url || './'},
    renotify:true
  };

  event.waitUntil(self.registration.showNotification(title,options));
});
