function setCookie(name, value, days, global) {
	if (!getCookie("cookie-dismiss") && name != "token" && name != "user" && name != "cookie-dismiss") return console.warn("Skipping cookie " + name);
	let cookie = name + "=" + (value || "") + ';path=/;';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		cookie += "expires=" + date.toUTCString() + ";";
	}
	if (global) cookie += "domain=.tomatenkuchen.eu;";

	document.cookie = cookie;
}
function getCookie(name) {
	const cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i].trim();

		if (cookie.split("=")[0] == name) return cookie.substring(name.length + 1, cookie.length);
	}
	return undefined;
}
function deleteCookie(name) {
	document.cookie = name + '=;Max-Age=-99999999;path=/;';
	document.cookie = name + '=;Max-Age=-99999999;path=/;domain=.tomatenkuchen.eu;';
}

function redirect(url) {
	window.location = url;
}

function fadeOut(element) {
	if (!element) return;
	if (!element.style.opacity) element.style.opacity = 1;

	element.style.opacity = parseFloat(element.style.opacity) - 0.05;
	if (element.style.opacity >= 0) setTimeout(() => fadeOut(element), 25);
	else element.remove();
}
function fadeIn(element) {
	if (!element) return;
	if (!element.style.opacity) element.style.opacity = 0;

	element.style.opacity = parseFloat(element.style.opacity) + 0.05;
	if (element.style.opacity < 1) setTimeout(() => fadeIn(element), 25);
}

const encode = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

var reloadText;
function pageLoad(page = "") {
	if (!getCookie("cookie-dismiss")) {
		document.body.innerHTML += '' +
			'<div class="cookie-container" id="cookie-container">' +
			'<h2>Cookie-Information</h2>' +
			'<p translation="cookie.text">Unsere Website nutzt Cookies, um <br>bestmögliche Funktionalität bieten zu können.</p>' +
			'<button onclick="setCookie(\'cookie-dismiss\', \'true\', 60, true);fadeOut(document.getElementById(\'cookie-container\'));" translation="cookie.all">Alle akzeptieren</button>' +
			'<button onclick="fadeOut(document.getElementById(\'cookie-container\'));" translation="cookie.necessary">Nur notwendige</button>' +
			'</div>';
		setTimeout(() => fadeIn(document.getElementById('cookie-container')), 1000);
	};

	if (screen.width <= 800) {
		if (page == "commands") {
			document.getElementById("commands-container").style.paddingLeft = "0";
			document.getElementById("search-box").style.marginLeft = "10px";
		};
		if (document.getElementById("sidebar-container")) document.getElementById("sidebar-container").classList.toggle("visible");
		document.getElementById("content").style.paddingLeft = "0";
		i = 1;
	};

	const username = getCookie("user");
	if (username) {
		if (page == "main") document.getElementById("username-content").innerHTML = "Hallo, <span class='accent'>" + username + "</span>!";
		document.getElementById("username-header").innerText = username;
		document.getElementsByClassName("accdropdown-content")[0].innerHTML = '<a href="/logout" translation="global.logout">Abmelden</a><a href="/dashboard/user" translation="global.viewdataexport">Eigene Daten ansehen</a>';
		if (getCookie("avatar")) document.getElementsByClassName("account")[0].innerHTML += "<img src='https://cdn.discordapp.com/avatars/" + getCookie("avatar") + ".webp?size=32' srcset='https://cdn.discordapp.com/avatars/" + getCookie("avatar") + ".webp?size=64 2x' width='32' height='32' alt='User Avatar' onerror='document.getElementById(\'username-avatar\').style = \'display: block;\';this.style.display = \'none\';'>";
	} else document.getElementById("username-avatar").style = "display: block;";

	const theme = getCookie("theme");
	if (theme == "light") document.body.classList.replace("dark-theme", "light-theme");
	else document.getElementById("theme-toggle").checked = true;

	document.getElementById("theme-toggle").addEventListener("change", function() {
		if (document.body.classList.contains("light-theme")) {
			document.body.classList.replace("light-theme", "dark-theme");
			setCookie("theme", "dark", 60, true);
		} else {
			document.body.classList.replace("dark-theme", "light-theme");
			setCookie("theme", "light", 60, true);
		};
	});

	document.getElementById("lang-toggle").addEventListener("change", function() {
		if (document.documentElement.lang.includes("en")) reloadText("de");
		else reloadText("en");
	});
	if (reloadText) reloadText(getLanguage());
	if (getLanguage() != "de") document.getElementById("lang-toggle").checked = true;

	if ("serviceWorker" in navigator) navigator.serviceWorker.register("/serviceworker.js");
};
