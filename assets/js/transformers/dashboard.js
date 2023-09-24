function getGuildsHTML() {
	return new Promise(resolve => {
		getGuilds()
			.then(json => {
				if (json.status == "success") {
					const target = localStorage.getItem("next")
					let text = ""
					json.data.sort((a, b) => {
						if (a.active && b.active) return 0
						if (!a.active && b.active) return 1
						return -1
					}).forEach(guild => {
						text +=
							"<a class='guild-select' title='" + encode(guild.name) + "' href='/" + (guild.active ? "dashboard/settings" : "invite") + "?guild=" + guild.id +
							(target && target.split("?")[1] ? "&" + target.split("?")[1].replace(/[^\w=-]/gi, "") : "") + "'>" +
							"<img" + (guild.active ? "" : " class='inactive'") + " alt='" + encode(guild.name) + " Server icon' width='128' height='128' src='" + encode(guild.icon) + "'>" +
							"<p>" + encode(guild.name) + "</p>" +
							"</a>"
					})

					if (text == "") resolve("<h1 translation='dashboard.noservers'></h1>")
					else resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

function changePage(elem) {
	const pages = document.getElementsByClassName("page-select")[0].children
	for (let i = 0; i < pages.length; i++) pages[i].classList.remove("current")
	elem.classList.add("current")
	const target = elem.getAttribute("data-target")

	for (const link of document.getElementsByClassName("guild-select")) {
		if (link.getAttribute("href").split("/")[1] == "invite") continue
		const query = link.getAttribute("href").split("?")[1]
		link.setAttribute("href", encode("/" + (target == "stats" || target == "leaderboard" ? "" : "dashboard/") + target) + (query ? "?" + query : ""))
	}
}

const params = new URLSearchParams(location.search)
loadFunc = () => {
	if (getCookie("token") && (params.has("guild") || params.has("guild_id"))) {
		document.getElementById("root-container").innerHTML = "<h1>Loading server settings...</h1>"
		location.href = "./dashboard/settings?guild=" + encode(params.get("guild") || params.get("guild_id"))
	} else if (params.has("code") && params.has("state") && params.get("state").startsWith("linked-role-")) {
		document.getElementById("root-container").innerHTML = "<h1>Updating the linked role connection...</h1>"

		login(params.get("code")).then(json => {
			if (json.status == "success") {
				setCookie("user", json.user, 4)
				setCookie("avatar", json.avatar, 4)
				document.getElementById("root-container").innerHTML = "<h1>The linked role connection was updated!</h1>"
			} else {
				document.getElementById("root-container").innerHTML =
					"<h1>An error occured while handling your request!</h1>" +
					"<h2>" + json.message + "</h2>"
			}
		})
	} else if (getCookie("token")) {
		getGuildsHTML().then(html => {
			document.getElementById("guilds-container").innerHTML = html
			reloadText()

			if (localStorage.getItem("next") && localStorage.getItem("next") != "/dashboard") {
				const pages = document.getElementsByClassName("page-select")[0]
				const elem = pages.querySelector("[data-target='" + localStorage.getItem("next").split("/")[2].split("?")[0] + "']") ||
					pages.querySelector("[data-target='" + localStorage.getItem("next").split("/")[1].split("?")[0] + "']")
				if (elem) changePage(elem)
				localStorage.removeItem("next")
			}
		})
	} else if (params.has("code")) {
		document.getElementById("root-container").innerHTML = "<h1>Logging you in...</h1>"

		login(params.get("code")).then(json => {
			if (json.status == "success") {
				setCookie("token", json.token, 4)
				setCookie("user", json.user, 4)
				setCookie("avatar", json.avatar, 4)

				if (localStorage.getItem("next") && localStorage.getItem("next").startsWith("/")) location.href = location.protocol + "//" + location.host + "/" + localStorage.getItem("next").replace("/", "")
				else location.href = location.protocol + "//" + location.host + "/dashboard" +
					(params.has("guild") || params.has("guild_id") ? "/settings?guild=" + encode(params.get("guild") || params.get("guild_id")) : "")
			} else {
				document.getElementById("root-container").innerHTML =
					"<h1>An error occured while handling your request!</h1>" +
					"<h2>" + json.message + "</h2>"
			}
		})
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
