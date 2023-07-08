let logs = []
function getModlogsHTML(guild) {
	return new Promise(resolve => {
		getModlogs(guild)
			.then(json => {
				if (json.status == "success") {
					logs = json.data
					let text =
						"<h1 class='greeting'><span translation='modlogs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th translation='logs.logtype'></th><th translation='modlogs.user'></th><th translation='modlogs.mod'></th><th translation='modlogs.reason'></th><th translation='logs.moreinfo'></th></tr>" +
						"</thead><tbody>"

					json.data.forEach(log => {
						log.cases?.forEach(i => {
							text +=
								"<tr class='ticket cmdvisible'>" +
								"<td>" + encode(i.type.charAt(0).toUpperCase() + i.type.slice(1)) + "</td>" +
								"<td>" + encode(log.user) + "</td>" +
								"<td>" + encode(i.moderator) + "</td>" +
								"<td class='overflow'>" + encode(i.reason) + "</td>" +
								"<td><button type='button' class='categorybutton' onclick='info(\"" + encode(log.user + "-" + i.date) + "\")' translation='logs.moreinfo'></button></td>" +
								"</tr>"
						})
					})

					resolve(text + "</tbody></table>")
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

function ticketSearch() {
	const tictype = document.getElementById("ts-type").value
	const ticuser = document.getElementById("ts-userid").value
	const ticmod = document.getElementById("ts-modid").value
	const ticmessage = document.getElementById("ts-message").value

	for (const log of document.getElementById("content").getElementsByClassName("ticket")) {
		const rows = log.getElementsByTagName("td")

		let hidden = false
		if (tictype != "" && !rows[0].textContent.toLowerCase().includes(tictype.toLowerCase())) hidden = true
		if (ticuser != "" && !rows[1].textContent.toLowerCase().includes(ticuser.toLowerCase())) hidden = true
		if (ticmod != "" && !rows[2].textContent.toLowerCase().includes(ticmod.toLowerCase())) hidden = true
		if (ticmessage != "" && !rows[3].textContent.toLowerCase().includes(ticmessage.toLowerCase())) hidden = true

		if (hidden) {
			if (log.classList.contains("cmdvisible")) log.classList.toggle("cmdvisible")
			log.classList.add("hidden")
		} else {
			if (!log.classList.contains("cmdvisible")) log.classList.toggle("cmdvisible")
			log.classList.remove("hidden")
		}
	}
}

function info(id) {
	const splitted = id.split("-")
	const log = logs.find(l => l.user == splitted[0] && l.cases.find(c => c.date == parseInt(splitted[1]))).cases?.find(c => c.date == parseInt(splitted[1]))
	openDialog(document.getElementById("info-dialog"))

	let type = log.type
	if (log.type == "warning") type = "Warn"
	else if (log.type == "mute") type = "Mute"
	else if (log.type == "unmute") type = "Unmute"
	else if (log.type == "ban") type = "Ban"
	else if (log.type == "kick") type = "Kick"
	else if (log.type == "tempban") type = "Tempban"

	document.getElementById("info-dialogText").innerHTML =
		"<b><span translation='logs.logtype'></span>:</b> " + encode(type) +
		"<br><b><span translation='modlogs.user'></span>:</b> " + encode(splitted[0]) +
		"<br><b><span translation='modlogs.mod'></span>:</b> " + encode(log.moderator) +
		"<br><b><span translation='modlogs.reason'></span>:</b> " + encode(log.reason) +
		"<br><b>Modlog created:</b> " + new Date(log.date).toLocaleString() +
		(log.until ? "<br><b translation='modlogs.activeuntil'></b> " + new Date(log.until).toLocaleString() : "")
	reloadText()
}

loadFunc = () => {
	const params = new URLSearchParams(location.search)
	if (params.has("guild") && getCookie("token"))
		getModlogsHTML(params.get("guild")).then(data => {
			const encodedGuild = encode(params.get("guild"))
			document.getElementById("linksidebar").innerHTML +=
				"<div class='section middle'><p class='title' translation='dashboard.settings'></p>" +
				"<a class='tab otherlinks' href='./settings/?guild=" + encodedGuild + "'><ion-icon name='settings-outline'></ion-icon><p translation='dashboard.settings'>Settings</p></a>" +
				"<a class='tab otherlinks' href='./integrations/?guild=" + encodedGuild + "'><ion-icon name='terminal-outline'></ion-icon><p translation='dashboard.integrations'>Integrations</p></a>" +
				"<a class='tab otherlinks' href='./reactionroles/?guild=" + encodedGuild + "'><ion-icon name='happy-outline'></ion-icon><p>Reactionroles</p></a>" +
				"<a class='tab otherlinks' href='../leaderboard/?guild=" + encodedGuild + "'><ion-icon name='speedometer-outline'></ion-icon><p translation='dashboard.leaderboard'>Leaderboard</p></a>" +
				"<a class='tab otherlinks' href='../stats/?guild=" + encodedGuild + "'><ion-icon name='bar-chart-outline'></ion-icon><p translation='dashboard.stats'>Statistics</p></a>" +
				"</div>"

			document.getElementById("root-container").innerHTML = data
			reloadText()
		})
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname)
		location.href = "../"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "../../login/?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
