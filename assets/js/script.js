function setCookie(name, value, days, global) {
	if ((!getCookie("cookie-dismiss") || getCookie("cookie-dismiss") == 1) && name != "token" && name != "user" && name != "cookie-dismiss") return

	let cookie = name + "=" + (value || "") + ";path=/;Secure;"
	if (days) {
		const date = new Date()
		date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * days)
		cookie += "expires=" + date.toUTCString() + ";"
	}
	if (global) cookie += "domain=.tomatenkuchen.eu;"

	document.cookie = cookie
}
function getCookie(name) {
	const cookies = document.cookie.split(";")

	for (const rawCookie of cookies) {
		const cookie = rawCookie.trim()
		if (cookie.split("=")[0] == name) return cookie.substring(name.length + 1, cookie.length)
	}
	return void 0
}
function deleteCookie(name) {
	document.cookie = name + "=;Max-Age=-99999999;path=/;"
	document.cookie = name + "=;Max-Age=-99999999;path=/;domain=.tomatenkuchen.eu;"
}

let loadFunc = () => {}
const encode = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")

function handleError(resolve, error) {
	if (typeof error != "string") console.error(error)
	resolve(
		"<h1>An error occured while handling your request!</h1>" +
		"<h2>" + (typeof error == "string" ? error : "Check your browser console to find out more!") + "</h2>")
}

class Footer extends HTMLElement {
	constructor() {
		super()
	}
	connectedCallback() {
		this.innerHTML =
			"<noscript><h1>This website doesn't work without JavaScript.</h1></noscript>" +
			"<footer>" +
			"<a href='/'>" +
			"<div id='mainlink'>" +
				"<img src='/assets/images/background_192.webp' width='64' height='64' alt='TomatenKuchen Logo'>" +
				"<span>TomatenKuchen</span>" +
			"</div>" +
			"</a>" +
			"<div class='links'>" +
				"<a href='/credits'>Credits</a>" +
				"<a href='/docs'>Docs</a>" +
				"<a href='/invite'>Invite Bot</a>" +
				"<a href='/discord' target='_blank' rel='noopener'>Support server</a>" +
				"<a href='/privacy'>Privacy/ToS</a>" +
			"</div>" +
			"</footer>"
	}
}
customElements.define("global-footer", Footer)

class Sidebar extends HTMLElement {
	constructor() {
		super()
	}
	connectedCallback() {
		this.innerHTML =
			"<div class='sidebar-container visible' id='sidebar-container'>" +
			"<nav class='sidebar' id='sidebar'>" +
				"<div class='hamburger' onclick='sidebar()'>" +
					"<div class='line' id='lineTop2'></div>" +
					"<div class='line' id='lineBottom2'></div>" +
				"</div>" +

				"<button type='button' onclick='location = \"/invite/\"' translation='sidebar.invite'></button>" +

				"<div id='linksidebar' class='section'>" +
					"<a href='/' title='Home' class='tab" + (this.getAttribute("page") == "main" ? " active" : "") + "'>" +
						"<ion-icon name='home-outline'></ion-icon>" +
						"<p translation='sidebar.home'></p>" +
					"</a>" +
					"<a href='/commands' title='Bot commands' class='tab" + (this.getAttribute("page") == "commands" ? " active" : "") + "'>" +
						"<ion-icon name='terminal-outline'></ion-icon>" +
						"<p translation='sidebar.commands'></p>" +
					"</a>" +
					"<a href='/dashboard' class='tab" + (this.getAttribute("page") == "dashboard" ? " active" : "") + "'>" +
						"<ion-icon name='settings-outline'></ion-icon>" +
						"<p translation='sidebar.dashboard'></p>" +
					"</a>" +
				"</div>" +

				"<div class='section bottom'>" +
					"<div class='hoverdropdown lang'>" +
						"<div class='hoverdropdown-content langselect'>" +
							"<div onclick='reloadText(\"ja\")'>" +
								"<img src='/assets/images/wikimedia_flagja.svg' width='30' height='30' alt='JA flag'>" +
								"<span>日本語</span>" +
							"</div>" +
							"<div onclick='reloadText(\"hu\")'>" +
								"<img src='/assets/images/wikimedia_flaghu.svg' width='30' height='30' alt='HU flag'>" +
								"<span>Magyar</span>" +
							"</div>" +
							"<div onclick='reloadText(\"fr\")'>" +
								"<img src='/assets/images/wikimedia_flagfr.svg' width='30' height='30' alt='FR flag'>" +
								"<span>Français</span>" +
							"</div>" +
							"<div onclick='reloadText(\"de\")'>" +
								"<img src='/assets/images/wikimedia_flagde.svg' width='30' height='30' alt='DE flag'>" +
								"<span>Deutsch</span>" +
							"</div>" +
							"<div onclick='reloadText(\"en\")'>" +
								"<img src='/assets/images/wikimedia_flagen.svg' width='30' height='30' alt='EN flag'>" +
								"<span>English</span>" +
							"</div>" +
						"</div>" +
						"<div class='text'>" +
							"<ion-icon name='language-outline'></ion-icon>" +
							"<span translation='global.language'>Language</span>" +
						"</div>" +
					"</div>" +

					"<label class='switch' data-type='theme'>" +
						"<input type='checkbox' id='theme-toggle' aria-label='Toggle theme'>" +
						"<span class='slider'></span>" +
					"</label>" +
				"</div>" +
			"</nav>" +
			"</div>"
	}
}
customElements.define("global-sidebar", Sidebar)

let sideState = 0
function sidebar() {
	sideState++

	document.getElementById("lineTop2").classList.add("rotated1")
	document.getElementById("lineBottom2").classList.add("rotated2")

	document.getElementById("lineTop1").classList.add("rotated1")
	document.getElementById("lineBottom1").classList.add("rotated2")

	if (sideState % 2 == 0) {
		setTimeout(() => {
			document.getElementById("content").classList.remove("no-padding")
			document.getElementById("sidebar-container").classList.toggle("visible")
		}, 300)
	} else {
		document.getElementById("content").classList.add("no-padding")

		document.getElementById("lineTop2").classList.remove("rotated1")
		document.getElementById("lineBottom2").classList.remove("rotated2")

		document.getElementById("lineTop1").classList.remove("rotated1")
		document.getElementById("lineBottom1").classList.remove("rotated2")

		setTimeout(() => {
			document.getElementById("sidebar-container").classList.toggle("visible")
		}, 100)
	}
}

function fadeOut(elem) {
	if (!elem) return
	if (!elem.style.opacity) elem.style.opacity = 1

	elem.style.opacity = parseFloat(elem.style.opacity) - 0.05
	if (elem.style.opacity >= 0) setTimeout(() => fadeOut(elem), 25)
	else elem.remove()
}
function fadeIn(elem) {
	if (!elem) return
	if (!elem.style.opacity) elem.style.opacity = 0

	elem.style.opacity = parseFloat(elem.style.opacity) + 0.05
	if (elem.style.opacity < 1) setTimeout(() => fadeIn(elem), 25)
}

function openDialog(dialog) {
	dialog.classList.remove("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => dialog.classList.add("hidden")
	window.onclick = event => {
		if (event.target == dialog) dialog.classList.add("hidden")
	}
}

function pageLoad(page = "") {
	if (!getCookie("cookie-dismiss")) {
		document.body.innerHTML +=
			"<div class='userinfo-container' id='cookie-container'>" +
			"<h2 translation='cookie.title'>Cookie information</h2>" +
			"<p translation='cookie.text'>Our website uses cookies to provide <br>the best possible user experience.</p>" +
			"<button type='button' onclick='setCookie(\"cookie-dismiss\", 2, 365, true);fadeOut(this.parentElement)' translation='cookie.all'>Accept all</button>" +
			"<button type='button' onclick='setCookie(\"cookie-dismiss\", 1, 365, true);fadeOut(this.parentElement)' translation='cookie.necessary'>Only essential</button>" +
			"</div>"
		setTimeout(() => fadeIn(document.getElementById("cookie-container")), 1000)
	}

	if (screen.width <= 800) {
		if (document.getElementById("sidebar-container")) document.getElementById("sidebar-container").classList.toggle("visible")
		document.getElementById("content").classList.add("no-padding")
		sideState = 1
	}

	if (getCookie("theme") == "light") document.body.classList.replace("dark-theme", "light-theme")
	else if (!getCookie("theme") && window.matchMedia("(prefers-color-scheme: light)").matches) {
		document.body.classList.replace("dark-theme", "light-theme")
		setCookie("theme", "light", 365, true)
	} else document.getElementById("theme-toggle").checked = true

	const username = getCookie("user")
	if (username) {
		if (page == "main") document.getElementById("username-content").innerHTML = "Hey, <span class='accent'>" + username + "</span>!"
		document.getElementById("username-header").removeAttribute("translation")
		document.getElementById("username-header").textContent = username
		document.getElementsByClassName("account")[0].removeAttribute("onclick")

		document.querySelector(".hoverdropdown-content:not(.langselect)").innerHTML =
			"<a href='/logout' translation='global.logout'>Logout</a><a href='/user' translation='global.yourprofile'>Your profile</a>" +
			"<a href='/dashboard/dataexport' translation='global.viewdataexport'>View own data</a><a href='/dashboard/custom'>Custom branding</a>"

		if (getCookie("avatar")) document.getElementsByClassName("account")[0].innerHTML +=
			"<img src='https://cdn.discordapp.com/avatars/" + getCookie("avatar") + ".webp?size=32' srcset='https://cdn.discordapp.com/avatars/" + getCookie("avatar") +
			".webp?size=64 2x' width='32' height='32' alt='User Avatar' onerror='document.getElementById(\"username-avatar\").classList.add(\"visible\");this.classList.add(\"hidden\")'>"
	} else document.getElementById("username-avatar").classList.add("visible")

	document.getElementById("theme-toggle").addEventListener("change", () => {
		if (document.body.classList.contains("light-theme")) {
			document.body.classList.replace("light-theme", "dark-theme")
			setCookie("theme", "dark", 365, true)
		} else {
			document.body.classList.replace("dark-theme", "light-theme")
			setCookie("theme", "light", 365, true)
		}
		document.querySelectorAll("emoji-picker").forEach(picker => {
			picker.classList.toggle("light")
		})
	})

	loadFunc()
	reloadText()
	if ("serviceWorker" in navigator) navigator.serviceWorker.register("/serviceworker.js")
}
