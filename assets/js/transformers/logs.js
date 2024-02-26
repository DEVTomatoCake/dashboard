let logs = []
const getLogsHTML = async guild => {
	const json = await get("logs/" + guild)
	if (json.status == "success") {
		let text = "<h1 class='greeting'><span translation='logs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>"
		if (json.data.length == 0) {
			document.getElementsByClassName("ticketsearch-container")[0].style.display = "none"
			return text + "<p>There are no logs for this server!</p>"
		}

		text +=
			"<table cellpadding='8' cellspacing='0'><thead>" +
			"<tr><th>ID and details</th><th translation='logs.logtype'></th><th translation='logs.logmessage'></th><th translation='logs.amount'></th><th>Last occurred</th></tr>" +
			"</thead><tbody>"

		logs = json.data
		logs.forEach(log => {
			text +=
				"<tr class='ticket cmdvisible'>" +
				"<td><button type='button' onclick='info(\"" + encode(log.id) + "\")'>" + encode(log.id) + "</button></td>" +
				"<td>" + encode(log.type) + "</td>" +
				"<td class='overflow'>" + encode(log.message) + "</td>" +
				"<td>" + (log.source == "dashboard" ? "" : assertInt(log.count).toLocaleString()) + "</td>" +
				"<td>" +
					"<p>" + new Date(log.lastDate || log.date).toLocaleString() + "</p>" +
					((log.lastDate || log.date) < Date.now() - 1000 * 60 * 60 * 24 * 3 ? "<button type='button' class='red' " +
					"onclick='confirmDelete(\"" + encode(log.id) + "\", this)' translation='logs.delete'></button>" : "") +
				"</td>" +
				"</tr>"
		})

		return text + "</tbody></table>"
	} else return handleError(json.message)
}

const params = new URLSearchParams(location.search)
const confirmDelete = (log, elem) => {
	if (confirm("Do you really want to delete the log \"" + log + "\"?")) {
		get("logs/" + params.get("guild") + "/" + log, true, "DELETE")
		new ToastNotification({type: "SUCCESS", title: "The log <code>" + encode(log) + "</code> was deleted successfully!", timeout: 10}).show()

		if (elem) elem.parentElement.parentElement.remove()
		else document.getElementById("info-dialog").setAttribute("hidden", "")
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
			log.setAttribute("hidden", "")
		} else {
			if (!log.classList.contains("cmdvisible")) log.classList.toggle("cmdvisible")
			log.removeAttribute("hidden")
		}
	}
}

const info = id => {
	const log = logs.find(l => l.id == id)
	openDialog(document.getElementById("info-dialog"))

	document.getElementById("info-dialogText").innerHTML =
		"<b><span translation='logs.logid'></span>:</b> <code>" + encode(log.id) + "</code>" +
		((log.lastDate || log.date) < Date.now() - 1000 * 60 * 60 * 24 * 3 ? " <button type='button' class='red' " +
			"onclick='confirmDelete(\"" + encode(log.id) + "\")' translation='logs.delete'></button>" : "") +
		"<br><b><span translation='logs.logtype'></span>:</b> " + encode(log.type) +
		"<br><b><span translation='logs.logmessage'></span>:</b> " + encode(log.message) +
		(log.source == "dashboard" ? "" : "<br><b><span translation='logs.amount'></span>:</b> " + log.count.toLocaleString()) +
		"<br><b translation='logs.firstoccured'></b> " + new Date(log.date).toLocaleString() +
		(log.lastDate ? "<br><b translation='logs.lastoccured'></b> " + new Date(log.lastDate).toLocaleString() : "") +
		"<br><b>Log raw data:</b><pre>" + encode(JSON.stringify(log.data, null, "\t")) + "</pre>"
	reloadText()
}

loadFunc = () => {
	if (params.has("guild") && getCookie("token"))
		getLogsHTML(params.get("guild")).then(data => {
			document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", params.get("guild"))
			document.getElementById("root-container").innerHTML = data
			reloadText()
		})
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname + location.search + location.hash)
		location.href = "/dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
