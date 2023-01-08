self.addEventListener("install", event => {
	event.waitUntil((async () => {
		const cache = await caches.open("offline")
		await cache.addAll(["/offline", "/", "/assets/style.css", "/assets/js/script.js"])
	})())
})
self.addEventListener("activate", event => {
	event.waitUntil((async () => {
		if ("navigationPreload" in self.registration) await self.registration.navigationPreload.enable()
	})())

	self.clients.claim()
})

self.addEventListener("fetch", event => {
	if (event.request.method == "GET" && event.request.mode == "navigate") {
	  	event.respondWith((async () => {
			try {
				const preloadResponse = await event.preloadResponse
       			if (preloadResponse) return preloadResponse

				const response = await fetch(event.request)
				cache.put(event.request, response.clone())
				return response
			} catch (e) {
				console.warn("Cannot fetch, serving from cache", e)

				const cache = await caches.open("offline")
				var cachedResponse = await cache.match(event.request.url)
				if (!cachedResponse) return cachedResponse = await caches.match("/offline")
				return cachedResponse
			}
		})())
	}
})
