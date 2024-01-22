/*! instant.page v5.2.0 - (C) 2019-2023 Alexandre Dieulot - https://instant.page/license */
// Modified by TomatoCake from https://github.com/instantpage/instant.page/blob/3525715c22373886567c3f62faf5a00e4380b566/instantpage.js

let _allowQueryString,
	_lastTouchTimestamp,
	_mouseoverTimer,
	_preloadedList = new Set()

const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111
const documentCopy = document
const locationCopy = location

init()

function init() {
	if (!documentCopy.createElement("link").relList.supports("prefetch")) {
		return
	}
	// instant.page is meant to be loaded with <script type=module>
	// (though sometimes webmasters load it as a regular script).
	// So it’s normally executed (and must not cause JavaScript errors) in:
	// - Chromium 61+
	// - Gecko in Firefox 60+
	// - WebKit in Safari 10.1+ (iOS 10.3+, macOS 10.10+)
	//
	// The check above used to check for IntersectionObserverEntry.isIntersecting
	// but module scripts support implies this compatibility — except in Safari
	// 10.1–12.0, but this prefetch check takes care of it.

	_allowQueryString = "instantAllowQueryString" in documentCopy.body.dataset

	const eventListenersOptions = {
		capture: true,
		passive: true
	}

	documentCopy.addEventListener("touchstart", touchstartListener, eventListenersOptions)
	documentCopy.addEventListener("mouseover", mouseoverListener, eventListenersOptions)
}

function touchstartListener(event) {
	_lastTouchTimestamp = performance.now()
	// Chrome on Android triggers mouseover before touchcancel, so
	// `_lastTouchTimestamp` must be assigned on touchstart to be measured
	// on mouseover.

	const anchorElement = event.target.closest("a")

	if (!isPreloadable(anchorElement)) {
		return
	}

	preload(anchorElement.href)
}

function mouseoverListener(event) {
	if (performance.now() - _lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
		return
	}

	if (!("closest" in event.target)) {
		return
	}
	const anchorElement = event.target.closest("a")

	if (!isPreloadable(anchorElement)) {
		return
	}

	anchorElement.addEventListener("mouseout", mouseoutListener, {passive: true})

	_mouseoverTimer = setTimeout(() => {
		preload(anchorElement.href)
		_mouseoverTimer = void 0
	}, 50)
}

function mouseoutListener(event) {
	if (event.relatedTarget && event.target.closest("a") == event.relatedTarget.closest("a")) {
		return
	}

	if (_mouseoverTimer) {
		clearTimeout(_mouseoverTimer)
		_mouseoverTimer = void 0
	}
}

function isPreloadable(anchorElement) {
	if (!anchorElement || !anchorElement.href) {
		return
	}

	if (anchorElement.origin != locationCopy.origin) {
		return
	}

	if (!["http:", "https:"].includes(anchorElement.protocol)) {
		return
	}

	if (anchorElement.protocol == "http:" && locationCopy.protocol == "https:") {
		return
	}

	if (!_allowQueryString && anchorElement.search && !("instant" in anchorElement.dataset)) {
		return
	}

	if (anchorElement.hash && anchorElement.pathname + anchorElement.search == locationCopy.pathname + locationCopy.search) {
		return
	}

	if ("noInstant" in anchorElement.dataset) {
		return
	}

	return true
}

function preload(url) {
	if (_preloadedList.has(url)) {
		return
	}

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

	_preloadedList.add(url)
}
