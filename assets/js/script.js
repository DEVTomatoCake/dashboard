function setCookie(name, value, days, global) {
	if ((!getCookie("cookie-dismiss") || getCookie("cookie-dismiss") == 1) && name != "token" && name != "user" && name != "cookie-dismiss") return;
	let cookie = name + "=" + (value || "") + ";path=/;";
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
		const cookie = cookies[i].trim();
		if (cookie.split("=")[0] == name) return cookie.substring(name.length + 1, cookie.length);
	}
	return void 0;
}
function deleteCookie(name) {
	document.cookie = name + "=;Max-Age=-99999999;path=/;";
	document.cookie = name + "=;Max-Age=-99999999;path=/;domain=.tomatenkuchen.eu;";
}

const redirect = url => window.location = url;
const encode = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

let sideState = 0;
function sidebar() {
	sideState++;

	document.getElementById("lineTop2").style.transform = "rotate(45deg)";
	document.getElementById("lineTop2").style.top = "5px";
	document.getElementById("lineBottom2").style.transform = "rotate(-45deg)";
	document.getElementById("lineBottom2").style.bottom = "5px";

	document.getElementById("lineTop1").style.transform = "rotate(45deg)";
	document.getElementById("lineTop1").style.top = "5px";
	document.getElementById("lineBottom1").style.transform = "rotate(-45deg)";
	document.getElementById("lineBottom1").style.bottom = "5px";

	if (sideState % 2 == 0) {
		setTimeout(() => {
			document.getElementById("content").style.paddingLeft = "300px";
			document.getElementById("sidebar-container").classList.toggle("visible");
		}, 300);
	} else {
		document.getElementById("content").style.paddingLeft = "0";

		document.getElementById("lineTop2").style.transform = "rotate(0)";
		document.getElementById("lineTop2").style.top = "0";
		document.getElementById("lineBottom2").style.transform = "rotate(0)";
		document.getElementById("lineBottom2").style.bottom = "0";

		document.getElementById("lineTop1").style.transform = "rotate(0)";
		document.getElementById("lineTop1").style.top = "0";
		document.getElementById("lineBottom1").style.transform = "rotate(0)";
		document.getElementById("lineBottom1").style.bottom = "0";

		setTimeout(() => {
			document.getElementById("sidebar-container").classList.toggle("visible");
		}, 100);
	}
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

function openDialog(dialog) {
	dialog.style.display = "block";
	dialog.getElementsByClassName("close")[0].onclick = function() {
		dialog.style.display = "none";
	};
	window.onclick = function(event) {
		if (event.target == dialog) dialog.style.display = "none";
	};
}

var reloadText;
function pageLoad(page = "") {
	if (!getCookie("cookie-dismiss")) {
		document.body.innerHTML +=
			"<div class='cookie-container' id='cookie-container'>" +
			"<h2 translation='cookie.title'>Cookie information</h2>" +
			"<p translation='cookie.text'>Unsere Website nutzt Cookies, um <br>bestmögliche Funktionalität bieten zu können.</p>" +
			"<button type='button' onclick='setCookie(\"cookie-dismiss\", 2, 365, true);fadeOut(this.parentElement);' translation='cookie.all'>Accept all</button>" +
			"<button type='button' onclick='setCookie(\"cookie-dismiss\", 1, 365, true);fadeOut(this.parentElement);' translation='cookie.necessary'>Only essential</button>" +
			"</div>";
		setTimeout(() => fadeIn(document.getElementById("cookie-container")), 1000);
	}

	if (screen.width <= 800) {
		if (page == "commands") document.getElementById("search-box").style.marginLeft = "10px";
		if (document.getElementById("sidebar-container")) document.getElementById("sidebar-container").classList.toggle("visible");
		document.getElementById("content").style.paddingLeft = "0";
		sideState = 1;
	}

	const username = getCookie("user");
	if (username) {
		if (page == "main") document.getElementById("username-content").innerHTML = "Hallo, <span class='accent'>" + username + "</span>!";
		document.getElementById("username-header").innerText = username;
		document.getElementsByClassName("accdropdown-content")[0].innerHTML = '<a href="/logout/" translation="global.logout">Abmelden</a><a href="/dashboard/user/" translation="global.viewdataexport">Eigene Daten ansehen</a>';
		if (getCookie("avatar")) document.getElementsByClassName("account")[0].innerHTML += "<img src='https://cdn.discordapp.com/avatars/" + getCookie("avatar") + ".webp?size=32' srcset='https://cdn.discordapp.com/avatars/" + getCookie("avatar") + ".webp?size=64 2x' width='32' height='32' alt='User Avatar' onerror='document.getElementById(\"username-avatar\").style = \"display: block;\";this.style.display = \"none\";'>";
	} else document.getElementById("username-avatar").style = "display: block;";

	if (getCookie("theme") == "light") document.body.classList.replace("dark-theme", "light-theme");
	else if (!getCookie("theme") && window.matchMedia("(prefers-color-scheme: light)").matches) {
		document.body.classList.replace("dark-theme", "light-theme");
		setCookie("theme", "light", 365, true);
	} else document.getElementById("theme-toggle").checked = true;

	document.getElementById("theme-toggle").addEventListener("change", () => {
		if (document.body.classList.contains("light-theme")) {
			document.body.classList.replace("light-theme", "dark-theme");
			setCookie("theme", "dark", 365, true);
		} else {
			document.body.classList.replace("dark-theme", "light-theme");
			setCookie("theme", "light", 365, true);
		}
		document.querySelectorAll("emoji-picker").forEach(picker => {
			picker.classList.toggle("light");
		});
	});

	document.getElementById("lang-toggle").addEventListener("change", () => {
		if (document.documentElement.lang.includes("en")) reloadText("de");
		else reloadText("en");
	});
	if (reloadText) reloadText(getLanguage());
	if (getLanguage() != "de") document.getElementById("lang-toggle").checked = true;

	if ("serviceWorker" in navigator) navigator.serviceWorker.register("/serviceworker.js");
}
