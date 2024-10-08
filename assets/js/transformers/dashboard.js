const getGuildsHTML = async () => {
	const json = await get("guilds")
	if (json.status == "success") {
		if (json.data.length == 0) return "<h1 translation='dashboard.noservers'></h1>"
		document.querySelector("p[translation='dashboard.selectpage']").removeAttribute("hidden")
		document.getElementsByClassName("page-select")[0].removeAttribute("hidden")

		const target = localStorage.getItem("next")
		return json.data.sort((a, b) => {
			if (a.active && b.active) return 0
			if (!a.active && b.active) return 1
			return -1
		}).map(guild => {
			return "" +
				"<a class='guild-select' title='" + encode(guild.name) + "' href='/" + (guild.active ? "dashboard/settings" : "invite") +
				"?guild=" + encode(guild.id) +
				(target && target.split(target.includes("?") ? "?" : "#")[1] ?
					(target.includes("?") ? "&" : "#") + target.split(target.includes("?") ? "?" : "#")[1].replace(/[^\w&#=-]/gi, "")
				: "") + "' tabindex='0'>" +
				"<img" + (guild.active ? "" : " class='inactive'") + " alt='' width='128' height='128' src='" + encode(guild.icon) + "' crossorigin='anonymous'>" +
				"<p>" + encode(guild.name) + "</p>" +
				"</a>"
		}).join("")
	} else return handleError(json.message)
}

const changePage = elem => {
	const pages = document.getElementsByClassName("page-select")[0].children
	for (const e of pages) e.classList.remove("current")
	elem.classList.add("current")
	const target = elem.getAttribute("data-target")

	for (const link of document.getElementsByClassName("guild-select")) {
		if (link.getAttribute("href").split("/")[1].split("?")[0] == "invite") continue
		const query = link.getAttribute("href").split("?")[1]
		link.setAttribute("href", encode("/" + (target == "stats" || target == "leaderboard" ? "" : "dashboard/") + target) + (query ? "?" + query : ""))
	}
}

const login = code => {
	const params = new URLSearchParams(location.search)
	return new Promise((resolve, reject) => {
		get("auth/login?code=" + encodeURIComponent(code) + (params.get("state") ? "&dcState=" + params.get("state") : "") +
			(getCookie("clientState") ? "&state=" + getCookie("clientState") : "") + (location.host == "tomatenkuchen.com" ? "" : "&host=" + location.host), false)
			.then(d => {
				deleteCookie("clientState")
				resolve(d)
			})
			.catch(e => {
				deleteCookie("clientState")
				reject(e)
			})
	})
}

const params = new URLSearchParams(location.search)
document.addEventListener("DOMContentLoaded", async () => {
	if (getCookie("token") && (params.has("guild") || params.has("guild_id"))) {
		document.getElementById("root-container").innerHTML = "<h1>Loading server settings...</h1>"
		location.href = "/dashboard/settings?guild=" + encode(params.get("guild") || params.get("guild_id"))
	} else if (params.has("code") && params.has("state") && params.get("state").startsWith("linked-role-")) {
		document.getElementById("root-container").innerHTML = "<h1>Updating the linked role connection...</h1>"

		login(params.get("code")).then(json => {
			if (json.status == "success") {
				setCookie("user", json.user, 4)
				setCookie("avatar", json.avatar, 4)
				document.getElementById("root-container").innerHTML = "<h1>The linked role connection was updated!</h1>"
			} else {
				document.getElementById("root-container").innerHTML =
					"<h1>An error occured while handling your request:</h1>" +
					"<h2>" + encode(json.message) + "</h2>"
			}
		})
	} else if (getCookie("token")) {
		const html = await getGuildsHTML()
		document.getElementById("guilds-container").innerHTML = html
		reloadText()

		if (localStorage.getItem("next") && localStorage.getItem("next") != "/dashboard") {
			const pages = document.getElementsByClassName("page-select")[0]
			const elem = pages.querySelector("[data-target='" + localStorage.getItem("next").split("/")[2].split("?")[0] + "']") ||
				pages.querySelector("[data-target='" + localStorage.getItem("next").split("/")[1].split("?")[0] + "']")
			if (elem) changePage(elem)
			localStorage.removeItem("next")
		}
	} else if (params.has("code")) {
		document.getElementById("root-container").innerHTML = "<h1>Logging you in...</h1>"

		login(params.get("code")).then(json => {
			if (json.status == "success") {
				setCookie("token", json.token, 4)
				setCookie("user", json.user, 4)
				setCookie("avatar", json.avatar, 4)

				if (localStorage.getItem("next") && localStorage.getItem("next").startsWith("/"))
					location.href = location.origin + (localStorage.getItem("next").startsWith("/") ? "" : "/") + localStorage.getItem("next").replace(/\./g, "")
				else location.href = "/dashboard" + (params.has("guild") || params.has("guild_id") ? "/settings?guild=" + encode(params.get("guild") || params.get("guild_id")) : "")
			} else {
				document.getElementById("root-container").innerHTML =
					"<h1>An error occured while handling your request:</h1>" +
					"<h2>" + encode(json.message) + "</h2>"
			}
		})
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
})
