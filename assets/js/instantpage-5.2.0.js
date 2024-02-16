/*! instant.page v5.2.0 - (C) 2019-2023 Alexandre Dieulot - https://instant.page/license */
// Modified by TomatoCake from https://github.com/instantpage/instant.page/blob/3525715c22373886567c3f62faf5a00e4380b566/instantpage.js

let lastTouchTimestamp
const preloadTimeouts = {}
const preloadedList = new Set()

const documentCopy = document
const locationCopy = location

const eventListenersOptions = {
	capture: true,
	passive: true
}

// instant.page is meant to be loaded with <script type=module\>
// (though sometimes webmasters load it as a regular script).
// So it’s normally executed (and must not cause JavaScript errors) in:
// - Chromium 61+
// - Gecko in Firefox 60+
// - WebKit in Safari 10.1+ (iOS 10.3+, macOS 10.10+)
//
// The check above used to check for IntersectionObserverEntry.isIntersecting
// but module scripts support implies this compatibility — except in Safari
// 10.1–12.0, but this prefetch check takes care of it.
if (documentCopy.createElement("link").relList.supports("prefetch")) {
	documentCopy.addEventListener("touchstart", event => {
		lastTouchTimestamp = performance.now()
		// Chrome on Android triggers mouseover before touchcancel, so
		// `_lastTouchTimestamp` must be assigned on touchstart to be measured
		// on mouseover.

		const anchorElement = event.target.closest("a")

		if (!isPreloadable(anchorElement)) return

		preload(anchorElement.href)
	}, eventListenersOptions)

	documentCopy.addEventListener("mouseover", event => {
		if (performance.now() - lastTouchTimestamp < 1111) return

		if (!("closest" in event.target)) return
		const anchorElement = event.target.closest("a")

		if (!isPreloadable(anchorElement)) return

		if (preloadTimeouts[anchorElement.href]) return

		anchorElement.addEventListener("mouseout", mouseoutListener, {passive: true})

		preloadTimeouts[anchorElement.href] = setTimeout(() => {
			preload(anchorElement.href)
		}, 120)
	}, eventListenersOptions)
}

function mouseoutListener(event) {
	if (event.relatedTarget && event.target.closest("a") == event.relatedTarget.closest("a")) {
		return
	}

	if (preloadTimeouts[event.target.href]) {
		clearTimeout(preloadTimeouts[event.target.href])
		delete preloadTimeouts[event.target.href]
	}
}

function isPreloadable(anchorElement) {
	if (!anchorElement || !anchorElement.href) return

	if (anchorElement.origin != locationCopy.origin) return

	if (!["http:", "https:"].includes(anchorElement.protocol)) return

	if (anchorElement.protocol == "http:" && locationCopy.protocol == "https:") return

	if (anchorElement.hash && anchorElement.pathname + anchorElement.search == locationCopy.pathname + locationCopy.search) return

	if ("noInstant" in anchorElement.dataset) return

	if (preloadedList.has(anchorElement.href)) return

	return true
}

function preload(url) {
	if (preloadedList.has(url)) return

	const linkElement = documentCopy.createElement("link")
	linkElement.rel = "prefetch"
	linkElement.href = url

	linkElement.fetchPriority = "high"
	// By default, a prefetch is loaded with a low priority.
	// When there’s a fair chance that this prefetch is going to be used in the
	// near term (= after a touch/mouse event), giving it a high priority helps
	// make the page load faster in case there are other resources loading.
	// Prioritizing it implicitly means deprioritizing every other resource
	// that’s loading on the page. Due to HTML documents usually being much
	// smaller than other resources (notably images and JavaScript), and
	// prefetches happening once the initial page is sufficiently loaded,
	// this theft of bandwidth should rarely be detrimental.

	linkElement.as = "document"
	// as=document is Chromium-only and allows cross-origin prefetches to be
	// usable for navigation. They call it “restrictive prefetch” and intend
	// to remove it: https://crbug.com/1352371
	//
	// This document from the Chrome team dated 2022-08-10
	// https://docs.google.com/document/d/1x232KJUIwIf-k08vpNfV85sVCRHkAxldfuIA5KOqi6M
	// claims (I haven’t tested) that data- and battery-saver modes as well as
	// the setting to disable preloading do not disable restrictive prefetch,
	// unlike regular prefetch. That’s good for prefetching on a touch/mouse
	// event, but might be bad when prefetching every link in the viewport.

	documentCopy.head.appendChild(linkElement)

	preloadedList.add(url)
}
