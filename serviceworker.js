self.addEventListener("install", event => {
	console.log("Service worker installed")

	event.waitUntil((async () => {
		const cache = await caches.open("offline")
		await cache.addAll(["/offline"])
	})())
})
self.addEventListener("activate", event => {
	console.log("Service worker activated")

	event.waitUntil((async () => {
		if ("navigationPreload" in self.registration) await self.registration.navigationPreload.enable()
	})())

	self.clients.claim()
})
self.addEventListener("fetch", event => {
	if (event.request.method == "GET" && event.request.mode == "navigate") {
		console.log(event.request)
		console.log("Handling fetch event for", event.request.url)
		event.respondWith((async () => {
			try {
				const preloadResponse = await event.preloadResponse
       			if (preloadResponse) return preloadResponse

				const response = await fetch(event.request)
				return response
			} catch (e) {
				console.warn("Cannot fetch, serving offline page", e)

				const cache = await caches.open("offline")
				const cachedResponse = await cache.match("/offline")
				return cachedResponse
			}
		})())
	}
})
