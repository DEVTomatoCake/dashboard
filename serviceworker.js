const version = 3

self.addEventListener("install", event => {
	event.waitUntil((async () => {
		(await caches.keys()).forEach(cacheName => {
			if (cacheName != "static" + version && cacheName != "fallback" + version) caches.delete(cacheName)
		})

		const staticCache = await caches.open("static" + version)
		staticCache.addAll([
			"/offline",
			"/assets/fonts/gfonts_bevietmanpro_latin.woff2",
			"/assets/images/favicon.ico",
			"/assets/images/buttonroles.webp",
			"/assets/images/autoupdate.webp",
			"/assets/images/integrations.webp",
			"/assets/images/tomato_ban.webp",
			"/assets/images/tomato_empty_160.webp",
			"/assets/images/wikimedia_flagde.svg",
			"/assets/images/wikimedia_flagen.svg",
			"/assets/images/wikimedia_flagfr.svg",
			"/assets/images/wikimedia_flaghu.svg",
			"/assets/images/wikimedia_flagja.svg"
		])

		const fallbackCache = await caches.open("fallback" + version)
		fallbackCache.addAll([
			"/assets/style.css",
			"/assets/js/script.js",
			"/assets/js/language.js",
			"/assets/lang/en.json",

			"/",
			"/credits",
			"/custom",
			"/privacy",
			"/legal",
			"/invite",
			"/commands",
			"/manifest.json"
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
			const preloadResponse = await event.preloadResponse
			if (preloadResponse) return preloadResponse

			const static = await caches.open("static" + version)
			const assetResponse = await static.match(event.request)
			if (assetResponse) return assetResponse

			const fallback = await caches.open("fallback" + version)
			try {
				const response = await fetch(event.request)
				if (url.href.startsWith("https://cdn.jsdelivr.net/npm/ionicons@")) static.put(event.request, response.clone())
				else if (url.host != "static.cloudflareinsights.com" && url.host != "sus.tomatenkuchen.com" && !url.search.includes("guild=") && !url.search.includes("token="))
					fallback.put(event.request, response.clone())
				return response
			} catch (e) {
				console.warn("Cannot fetch " + event.request.url + ", serving from cache", e)
				return await fallback.match(event.request) || await caches.match("/offline")
			}
		})())
	}
})
