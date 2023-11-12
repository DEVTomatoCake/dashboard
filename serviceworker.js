self.addEventListener("install", event => {
	event.waitUntil((async () => {
		const cache = await caches.open("IYjo3M")
		await cache.addAll([
			"/offline",
			"/assets/style.css",
			"/assets/js/script.js",
			"/assets/js/language.js",

			"/",
			"/credits",
			"/privacy",
			"/legal",
			"/invite",
			"/commands",
			"/manifest.json",
			"/assets/fonts/gfonts_bevietmanpro_latin.woff2",
			"/assets/images/favicon.ico",
			"/assets/images/buttonroles.webp",
			"/assets/images/tomato_ban.webp",
			"/assets/images/tomato_empty.webp",
			"/assets/images/wikimedia_flagde.svg",
			"/assets/images/wikimedia_flagen.svg",
			"/assets/images/wikimedia_flagfr.svg",
			"/assets/images/wikimedia_flaghu.svg",
			"/assets/images/wikimedia_flagja.svg"
		])
	})())
})

self.addEventListener("activate", event => {
	event.waitUntil((async () => {
		if ("navigationPreload" in self.registration) await self.registration.navigationPreload.enable()
	})())

	self.clients.claim()
})

self.addEventListener("fetch", event => {
	const url = new URL(event.request.url)
	if (event.request.method == "GET" && url.protocol == "https:" && (event.request.mode == "navigate" || event.request.mode == "no-cors" || event.request.mode == "cors")) {
		event.respondWith((async () => {
			const cache = await caches.open("IYjo3M")

			try {
				const preloadResponse = await event.preloadResponse
				if (preloadResponse) return preloadResponse

				const response = await fetch(event.request)
				if (url.host != "static.cloudflareinsights.com" && url.host != "sus.tomatenkuchen.com" && !url.search.includes("guild=")) cache.add(event.request, response.clone())
				return response
			} catch (e) {
				console.warn("Cannot fetch " + event.request.url + ", serving from cache", e)

				const cachedResponse = await cache.match(event.request)
				if (!cachedResponse) return await caches.match("/offline")
				return cachedResponse
			}
		})())
	}
})
