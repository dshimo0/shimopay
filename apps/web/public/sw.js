/* Only same-origin application shell/assets are cached. Never JSON-RPC, API, or third-party responses. */
const CACHE='shimopay-shell-v3';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/demo','/app','/app/merchant','/icon.svg','/manifest.webmanifest'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_ASSETS')event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(event.data.urls.filter(url=>new URL(url,self.location.origin).origin===self.location.origin&&new URL(url,self.location.origin).pathname.startsWith('/_next/static/')).map(url=>cache.add(url).catch(()=>{})))));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.endsWith('.json'))return;
 const shell=event.request.mode==='navigate'&&(url.pathname==='/'||url.pathname==='/demo'||url.pathname==='/app'||url.pathname==='/app/merchant');
 const asset=url.pathname.startsWith('/_next/static/')||['/icon.svg','/manifest.webmanifest'].includes(url.pathname);
 if(!shell&&!asset)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
   // Refresh the HTML while online so a new build never boots old chunk URLs.
   // Offline navigation still uses the last successfully loaded shell.
   if(shell){
     try{
       const response=await fetch(event.request);
       if(response.ok){await cache.put(event.request,response.clone());return response;}
       const cached=await cache.match(event.request,{ignoreSearch:true});
       return cached??response;
     }catch(error){
       const cached=await cache.match(event.request,{ignoreSearch:true});
       if(cached)return cached;
       throw error;
     }
   }
   const cached=await cache.match(event.request,{ignoreSearch:shell});
   if(cached)return cached;
   const response=await fetch(event.request);
   if(response.ok)await cache.put(event.request,response.clone());
   return response;
 }));
});
