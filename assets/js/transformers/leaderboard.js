function getLeaderboardHTML(guild) {
	return new Promise(resolve => {
		getLeaderboard(guild)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'><span translation='leaderboard.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>"
					json.data.forEach(entry => {
						text +=
							"<div class='leaderboard" + (entry.id + "/" + entry.avatar == getCookie("avatar") ? " highlight" : "") + "'><p>" + encode("" + entry.place) + ". " +
							"<img class='user-image' src='https://cdn.discordapp.com/avatars/" + encode(entry.id + "/" + entry.avatar) + ".webp?size=32' loading='lazy' " +
							"alt='Avatar: " + encode(entry.user) + "' onerror='this.src=\"https://cdn.discordapp.com/embed/avatars/" + entry.id % 4 + ".png\"'>" + encode(entry.user) + " <b>" +
							entry.points.toLocaleString() + "</b> Point" + (entry.points == 1 ? "" : "s") + " (Level <b>" + entry.level.toLocaleString() + "</b>)</p></div>"
					})
					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

loadFunc = () => {
	const rootContainer = document.getElementById("root-container")
	const params = new URLSearchParams(location.search)

	if (params.has("guild")) getLeaderboardHTML(params.get("guild")).then(html => {
		rootContainer.innerHTML = html
		reloadText()
	})
	else {
		rootContainer.innerHTML = "<h1 class='greeting' translation='leaderboard.missingguild'></h1>"
		reloadText()
	}
}
