function getCommandsHTML() {
	return new Promise((resolve => {
		getCommands()
			.then(json => {
				if (json.status == "success") {
					let text = "";
					const categories = [];
					const categoryData = [];

					json.data.forEach(command => {
						const temp =
							"<tr class='command cmdvisible' data-category='" + command.category + "' onclick='cmdInfo(this, \"" + command.name + "\")'>" +
							"<td>" + command.name + "</td>" +
							"<td>" + command.desc + "</td>" +
							"</tr>";

						if (!categories.includes(command.category)) categories.push(command.category);
						categoryData.push([command.category, temp]);
					});

					categories.forEach(category => {
						text +=
							"<center><h2 id='" + category + "title'>" + category.charAt(0).toUpperCase() + category.slice(1) + "</h2>" +
							"<button type='button' class='categorybutton' id='" + category + "tb' onclick='toggleCategory(\"" + category + "\");' translation='commands.hide'></button>" +
							"<table cellpadding='8' cellspacing='0' class='category' id='" + category + "'>" +
							"<thead><tr><th translation='commands.name'></th><th translation='commands.description'></th></tr></thead><tbody>";

						categoryData.forEach(data => {
							if (category == data[0]) text += data[1];
						});
						text += "</tbody></table></center><br id='" + category + "br'>";
					});

					commandData = json.data;
					resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	}));
}

function getLeaderboardHTML(guild) {
	return new Promise(resolve => {
		getLeaderboard(guild)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'><span translation='leaderboard.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>";
					json.data.forEach(entry => {
						text +=
							"<div class='leaderboard" + (entry.id + "/" + entry.avatar == getCookie("avatar") ? " highlight" : "") + "'><p>" + encode(entry.place.toString()) + ". " +
							"<img class='user-image' src='https://cdn.discordapp.com/avatars/" + encode(entry.id + "/" + entry.avatar) + ".webp?size=32' loading='lazy' width='32' height='32' " +
							"alt='Avatar: " + encode(entry.user) + "' onerror='this.src=\"https://cdn.discordapp.com/embed/avatars/" + entry.id % 4 + ".png\"'>" + encode(entry.user) + " <b>" +
							encode(entry.points.toString()) + "</b> Point" + (entry.points == 1 ? "" : "s") + " (Level <b>" + encode(entry.level.toString()) + "</b>)</p></div>";
					});
					resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}

function getGiveawayHTML(giveaway) {
	return new Promise(resolve => {
		getGiveaway(giveaway)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'><span translation='giveaway.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>";

					if (json.data.ended) text += "<div class='creditsUser'><h2 translation='giveaway.ended'></h2><p>" +
						(json.data.winners.length > 0 ? "Gewonnen ha" + (json.data.winners.length == 1 ? "t" : "ben") + ": <b>" + json.data.winners.join(", ") : "Keiner hat gewonnen!") + "</b></p></div>";

					text +=
						"<h2>" + json.data.prize + "</h2>" +
						"<p>Giveaway-ID: <code>" + json.data.message + "</code></p>" +
						"<p><span translation='dashboard.channel'></span>: " + json.data.channel + "</p>" +
						"<p><span translation='giveaway.started'></span>: " + new Date(json.data.startAt).toLocaleString() + "</p>" +
						"<p><span translation='giveaway.ends'></span>: " + new Date(json.data.endAt).toLocaleString() + "</p>" +
						"<p><span translation='giveaway.hostedby'></span>: " + json.data.hostedBy + "</p>" +
						"<p><span translation='giveaway.winneramount'></span>: <b>" + json.data.winnerCount + "</b></p>" +
						"<p>" + (json.data.ended ? "" : "Aktuelle ") + "Nutzer im Giveaway: <b>" + json.data.users.length + "</b></p>";

					const reqs = json.data.requirements;
					if (reqs.roles.length > 0 || reqs.anyRoles.length > 0 || reqs.notRoles.length > 0 || reqs.minAge || reqs.minMemberAge || reqs.minLeaderboardPoints) {
						text += "<br><h3 translate='giveaway.requirements'>Bedingungen</h3>";
						if (reqs.roles.length > 0) text += "<p>Alle diese Rollen: " + reqs.roles.join(", ") + "</p>";
						if (reqs.anyRoles.length > 0) text += "<p>Irgendeine dieser Rollen: " + reqs.anyRoles.join(", ") + "</p>";
						if (reqs.notRoles.length > 0) text += "<p>Keine dieser Rollen: " + reqs.notRoles.join(", ") + "</p>";
						if (reqs.minAge) text += "<p>Mindestaccountalter: <b>" + reqs.minAge + "</b></p>";
						if (reqs.minMemberAge) text += "<p>Mindestzeit auf dem Server: <b>" + reqs.minMemberAge + "</b></p>";
						if (reqs.minLeaderboardPoints) text += "<p>Mindestleaderboardpunkte: <b>" + reqs.minLeaderboardPoints.toLocaleString("de-DE") + "</b></p>";
					}

					resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}
