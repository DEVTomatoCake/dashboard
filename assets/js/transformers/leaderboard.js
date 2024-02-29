const getLeaderboardHTML = async guild => {
	const json = await get("leaderboard/" + guild)
	if (json.status == "success") {
		const leveling = json.level.length > 0 ? "<h1 class='greeting'><span translation='leaderboard.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1><div class='flex'><div>" +
			json.level.map((entry, i) => {
				const user = json.users[entry.u]
				return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
					"<img class='user-image' crossorigin='anonymous' loading='lazy' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
					(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "'>" +
					encode(user.name) + " <b>" + assertInt(entry.points).toLocaleString() + "</b> Point" + (entry.points == 1 ? "" : "s") + " (Level <b>" + assertInt(entry.level).toLocaleString() + "</b>)</p>"
			}).join("") + "</div></div>" : void 0

		const counting = json.counting.length > 0 ? "<h1 class='greeting'><span translation='leaderboard.countingtitle'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
			json.counting.map((entry, i) => {
				const user = json.users[entry.u]
				return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
					"<img class='user-image' crossorigin='anonymous' loading='lazy' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
					(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "'>" +
					encode(user.name) + " <b>" + assertInt(entry.points).toLocaleString() + "</b> Point" + (entry.points == 1 ? "" : "s") +
					(entry.pointsCur ? " (Current run: <b>" + assertInt(entry.pointsCur).toLocaleString() + "</b> Point" + (entry.pointsCur == 1 ? "" : "s") + ")" : "") + "</p>"
			}).join("") : void 0

		const countingFail = json.countingFail.length > 0 ? "<h1 class='greeting'>Counting fail leaderboard of <span class='accent'>" + encode(json.guild) + "</span></h1>" +
			json.countingFail.map((entry, i) => {
				const user = json.users[entry.u]
				return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
					"<img class='user-image' crossorigin='anonymous' loading='lazy' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
					(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "'>" +
					encode(user.name) + " <b>" + assertInt(entry.fails).toLocaleString() + "</b> Fail" + (entry.fails == 1 ? "" : "s") + "</p>"
			}).join("") : void 0

		const botVote = json.botVote.length > 0 ? "<h1 class='greeting'>Bot vote leaderboard of <span class='accent'>" + encode(json.guild) + "</span></h1>" +
			json.botVote.map((entry, i) => {
				const user = json.users[entry.u]
				return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
					"<img class='user-image' crossorigin='anonymous' loading='lazy' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
					(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "'>" +
					encode(user.name) + " <b>" + assertInt(entry.votes).toLocaleString() + "</b> Vote" + (entry.votes == 1 ? "" : "s") + "</p>"
			}).join("") : void 0

		const serverVote = json.serverVote.length > 0 ? "<h1 class='greeting'>Server vote leaderboard of <span class='accent'>" + encode(json.guild) + "</span></h1>" +
			json.serverVote.map((entry, i) => {
				const user = json.users[entry.u]
				return "<p class='leaderboard" + (user.id + "/" + user.avatar == getCookie("avatar") ? " highlight" : "") + "'>" + (i + 1) + ". " +
					"<img class='user-image' crossorigin='anonymous' loading='lazy' alt='Avatar of " + encode(user.name) + "' src='https://cdn.discordapp.com/" +
					(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "'>" +
					encode(user.name) + " <b>" + assertInt(entry.votes).toLocaleString() + "</b> Vote" + (entry.votes == 1 ? "" : "s") + "</p>"
			}).join("") : void 0

		const levelRewards = json.levelRewards.length > 0 ? json.levelRewards.map(reward =>
			"<p>Level <b>" + assertInt(reward.lvl) + "</b></p>" +
			"<span style='border-color: #" + encode(reward.color) + ";'>" + encode(reward.role).replace(/ /g, screen.width > 600 ? "&nbsp;" : " ") + "</span>"
		).join("") : void 0

		return {
			leveling,
			counting,
			countingfail: countingFail,
			botvote: botVote,
			servervote: serverVote,
			levelRewards
		}
	} else return handleError(json.message)
}

const changeTab = elem => {
	for (const tab of document.getElementsByClassName("dialog-tab")) {
		if (tab.getAttribute("data-radio") == elem.getAttribute("data-radio")) {
			tab.classList.remove("active")
			document.getElementById(tab.getAttribute("name")).setAttribute("hidden", "")
		}
	}

	elem.classList.add("active")
	document.getElementById(elem.getAttribute("name")).removeAttribute("hidden")
}

loadFunc = async () => {
	const params = new URLSearchParams(location.search)

	if (params.has("guild")) {
		const html = await getLeaderboardHTML(params.get("guild"))

		Object.keys(html).filter(key => key != "levelRewards").forEach(key => {
			if (html[key]) document.getElementById(key).innerHTML = html[key]
			else document.getElementById("button-" + key).remove()
		})

		if (html.levelRewards) {
			const rewardElem = document.createElement("div")
			rewardElem.innerHTML = html.levelRewards
			document.querySelector("#leveling div.flex").appendChild(rewardElem)
		}
		reloadText()

		if (location.hash == "#counting") changeTab(document.getElementById("button-counting"))
		else if (location.hash == "#countingfail") changeTab(document.getElementById("button-countingfail"))
		else if (location.hash == "#botvote") changeTab(document.getElementById("button-botvote"))
		else if (location.hash == "#servervote") changeTab(document.getElementById("button-servervote"))
	} else {
		document.getElementById("content").innerHTML = "<h1 class='greeting' translation='leaderboard.missingguild'></h1>"
		reloadText()
	}
}
