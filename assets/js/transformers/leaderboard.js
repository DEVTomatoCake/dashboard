function getLeaderboardHTML(guild) {
	return new Promise(resolve => {
		getLeaderboard(guild)
			.then(json => {
				if (json.status == "success") {
					const leveling = "<h1 class='greeting'><span translation='leaderboard.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						json.level.map((entry, i) => {
							const user = json.users[entry.u]
							return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
								"<img class='user-image' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
								(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "' loading='lazy'>" +
								encode(user.name) + " <b>" + entry.points.toLocaleString() + "</b> Point" + (entry.points == 1 ? "" : "s") + " (Level <b>" + entry.level.toLocaleString() + "</b>)</p>"
						}).join("")

					const counting = "<h1 class='greeting'><span translation='leaderboard.countingtitle'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						json.counting.map((entry, i) => {
							const user = json.users[entry.u]
							return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
								"<img class='user-image' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
								(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "' loading='lazy'>" +
								encode(user.name) + " <b>" + entry.points.toLocaleString() + "</b> Point" + (entry.points == 1 ? "" : "s") +
								(entry.pointsCur ? " (Current run: <b>" + entry.pointsCur.toLocaleString() + "</b> Point" + (entry.pointsCur == 1 ? "" : "s") + ")" : "") + "</p>"
						}).join("")

					resolve({leveling, counting})
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

function changeTab(elem) {
	for (const tab of document.getElementsByClassName("dialog-tab")) {
		if (tab.getAttribute("data-radio") == elem.getAttribute("data-radio")) {
			tab.classList.remove("active")
			document.getElementById(tab.getAttribute("name")).classList.add("hidden")
		}
	}

	elem.classList.add("active")
	document.getElementById(elem.getAttribute("name")).classList.remove("hidden")
}

loadFunc = () => {
	const params = new URLSearchParams(location.search)

	if (params.has("guild")) getLeaderboardHTML(params.get("guild")).then(html => {
		document.getElementById("leveling").innerHTML = html.leveling
		document.getElementById("counting").innerHTML = html.counting
		reloadText()

		if (location.hash == "#counting") changeTab(document.querySelector(".dialog-tab[name='counting']"))
	})
	else {
		document.getElementById("content").innerHTML = "<h1 class='greeting' translation='leaderboard.missingguild'></h1>"
		reloadText()
	}
}
