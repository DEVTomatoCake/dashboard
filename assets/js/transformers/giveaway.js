function getGiveawayHTML(giveaway) {
	return new Promise(resolve => {
		getGiveaway(giveaway)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'><span translation='giveaway.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>"

					if (json.data.ended) text += "<h2 translation='giveaway.ended'></h2><p>" +
						(json.data.winners.length > 0 ?
							"Gewonnen ha" + (json.data.winners.length == 1 ? "t" : "ben") + " (<b>" + json.data.winnerLength + "</b>):<br>" +
							(json.data.winners.map(user =>
								"<img class='user-image' crossorigin='anonymous' loading='lazy' src='https://cdn.discordapp.com/" +
								(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "' " +
								"alt='Avatar: " + encode(user.name) + "'> " + encode(user.name) + "<br>"
							)).join("")
						: "<span translation='giveaway.nowinner'></span>") + "</b></p><br><br><br>"

					text +=
						"<h2>" + json.data.prize + "</h2>" +
						"<p>Giveaway-ID: <code>" + json.data.message + "</code></p>" +
						"<p><span translation='dashboard.channel'></span>: " + json.data.channel + "</p>" +
						"<p><span translation='giveaway.started'></span>: " + new Date(json.data.startAt).toLocaleString() + "</p>" +
						"<p><span translation='giveaway.ends'></span>: " + new Date(json.data.endAt).toLocaleString() + "</p>" +
						"<p><span translation='giveaway.hostedby'></span>: " + json.data.hostedBy + "</p>" +
						"<p><span translation='giveaway.winneramount'></span>: <b>" + json.data.winnerCount + "</b></p>" +
						"<p><span translation='giveaway.users'></span> (<b>" + json.data.userLength + "</b>):</p>" +
						(json.data.users.map(user =>
							"<img class='user-image' crossorigin='anonymous' loading='lazy' src='https://cdn.discordapp.com/" +
							(user.avatar ? "avatars/" + encode(user.id + "/" + user.avatar) + ".webp?size=32" : "embed/avatars/" + (user.id >>> 22) % 6 + ".png") + "' " +
							"alt='Avatar: " + encode(user.name) + "'> " + encode(user.name) + "<br>"
						)).join("")

					const reqs = json.data.requirements
					if (reqs.roles || reqs.anyRoles || reqs.notRoles || reqs.minAge || reqs.minMemberAge || reqs.minLeaderboardPoints) {
						text += "<br><h3 translate='giveaway.requirements'></h3>"
						if (reqs.roles) text += "<p><span translation='giveaway.thoseroles'></span>: " + reqs.roles.join(", ") + "</p>"
						if (reqs.anyRoles) text += "<p><span translation='giveaway.anyrole'></span>: " + reqs.anyRoles.join(", ") + "</p>"
						if (reqs.notRoles) text += "<p><span translation='giveaway.notrole'></span>: " + reqs.notRoles.join(", ") + "</p>"
						if (reqs.minAge) text += "<p><span translation='giveaway.minaccage'></span>: <b>" + reqs.minAge + "</b></p>"
						if (reqs.minMemberAge) text += "<p><span translation='giveaway.minmemberage'></span>: <b>" + reqs.minMemberAge + "</b></p>"
						if (reqs.minLeaderboardPoints) text += "<p><span translation='giveaway.minleaderboardpoints'></span>: <b>" + reqs.minLeaderboardPoints.toLocaleString() + "</b></p>"
					}

					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

const params = new URLSearchParams(location.search)
loadFunc = () => {
	if (params.has("id")) getGiveawayHTML(params.get("id")).then(html => {
		document.getElementById("root-container").innerHTML = html
		reloadText()
	})
	else {
		document.getElementById("root-container").innerHTML = "<h1 class='greeting' translation='leaderboard.missingguild'></h1>"
		reloadText()
	}
}
