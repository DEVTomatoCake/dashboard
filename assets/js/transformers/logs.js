let logs = []
function getLogsHTML(guild) {
	return new Promise(resolve => {
		getLogs(guild)
			.then(json => {
				if (json.status == "success") {
					logs = json.data
					let text =
						"<h1 class='greeting'><span translation='logs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th>ID</th><th translation='logs.logtype'></th><th translation='logs.logmessage'></th><th translation='logs.amount'></th><th translation='logs.actions'></th></tr>" +
						"</thead><tbody>"

					json.data.forEach(log => {
						text +=
							"<tr class='ticket cmdvisible'>" +
							"<td>" + encode(log.id) + "</td>" +
							"<td>" + encode(log.type) + "</td>" +
							"<td class='overflow'>" + encode(log.message) + "</td>" +
							"<td>" + assertInt(log.count).toLocaleString() + "</td>" +
							"<td>" +
								"<button type='button' onclick='info(\"" + encode(log.id) + "\")' translation='logs.moreinfo'></button>" +
								((log.lastDate || log.date) < Date.now() - 1000 * 60 * 60 * 24 * 3 ? "<button type='button' class='red' " +
								"onclick='confirmDelete(this, \"" + encode(log.id) + "\")' translation='logs.delete'></button>" : "") +
							"</td>" +
							"</tr>"
					})

					resolve(text + "</tbody></table>")
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

const params = new URLSearchParams(location.search)
const confirmDelete = (elem, log) => {
	const c = confirm("Do you really want to delete the log \"" + log + "\"?")
	if (c) {
		deleteLog(params.get("guild"), log)
		elem.parentElement.parentElement.remove()
	}
}

function ticketSearch() {
	const ticid = document.getElementById("ts-id").value
	const tictype = document.getElementById("ts-type").value
	const ticmessage = document.getElementById("ts-message").value

	for (const log of document.getElementById("content").getElementsByClassName("ticket")) {
		const rows = log.getElementsByTagName("td")

		let hidden = false
		if (ticid != "" && !rows[0].textContent.toLowerCase().includes(ticid.toLowerCase())) hidden = true
		if (tictype != "" && !rows[1].textContent.toLowerCase().includes(tictype.toLowerCase())) hidden = true
		if (ticmessage != "" && !rows[2].textContent.toLowerCase().includes(ticmessage.toLowerCase())) hidden = true

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
	const log = logs.find(l => l.id == id)
	openDialog(document.getElementById("info-dialog"))

	document.getElementById("info-dialogText").innerHTML =
		"<b><span translation='logs.logid'></span>:</b> " + log.id +
		"<br><b><span translation='logs.logtype'></span>:</b> " + log.type +
		"<br><b><span translation='logs.logmessage'></span>:</b> " + log.message +
		"<br><b><span translation='logs.amount'></span>:</b> " + log.count.toLocaleString() +
		"<br><b translation='logs.firstoccured'></b> " + new Date(log.date).toLocaleString() +
		(log.lastDate ? "<br><b translation='logs.lastoccured'></b> " + new Date(log.lastDate).toLocaleString() : "") +
		"<br><b>Log raw data:</b><pre>" + encode(JSON.stringify(log.data, null, "\t")) + "</pre>"
	reloadText()
}

loadFunc = () => {
	if (params.has("guild") && getCookie("token"))
		getLogsHTML(params.get("guild")).then(data => {
			const encodedGuild = encode(params.get("guild"))
			document.getElementById("linksidebar").innerHTML +=
				"<div class='section middle'><p class='title' translation='dashboard.settings'></p>" +
				"<a class='tab otherlinks' href='./settings?guild=" + encodedGuild + "'><ion-icon name='settings-outline'></ion-icon><p translation='dashboard.settings'>Settings</p></a>" +
				"<a class='tab otherlinks' href='./integrations?guild=" + encodedGuild + "'><ion-icon name='terminal-outline'></ion-icon><p translation='dashboard.integrations'>Integrations</p></a>" +
				"<a class='tab otherlinks' href='./reactionroles?guild=" + encodedGuild + "'><ion-icon name='happy-outline'></ion-icon><p>Reactionroles</p></a>" +
				"<a class='tab otherlinks' href='../leaderboard?guild=" + encodedGuild + "'><ion-icon name='speedometer-outline'></ion-icon><p translation='dashboard.leaderboard'>Leaderboard</p></a>" +
				"<a class='tab otherlinks' href='../stats?guild=" + encodedGuild + "'><ion-icon name='bar-chart-outline'></ion-icon><p translation='dashboard.stats'>Statistics</p></a>" +
				"</div>"

			document.getElementById("root-container").innerHTML = data
			reloadText()
		})
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname)
		location.href = "../dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
