let logs = []
const getModlogsHTML = async guild => {
	const json = await get("modlogs/" + guild)
	if (json.status == "success") {
		let text = "<h1 class='greeting'><span translation='modlogs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>"
		if (json.data.length == 0) {
			document.getElementsByClassName("ticketsearch-container")[0].style.display = "none"
			return text + "<p>There are no logs for this server!</p>"
		}

		logs = json.data
		text +=
			"<table cellpadding='8' cellspacing='0'><thead>" +
			"<tr><th translation='logs.logtype'></th><th translation='modlogs.user'></th><th translation='modlogs.mod'></th><th translation='modlogs.reason'></th>" +
			"<th translation='logs.actions'></th></tr>" +
			"</thead><tbody>"

		json.data.forEach(log => {
			if (log.cases) text += log.cases.map(i =>
				"<tr class='ticket cmdvisible'>" +
				"<td>" + encode(i.type) + "</td>" +
				"<td>" + encode(log.userName || "") + " <br><small>(" + encode(log.userId) + ")</small></td>" +
				"<td>" + encode(i.modName || "") + " <br><small>(" + encode(i.modId) + ")</small></td>" +
				"<td class='overflow'>" + encode(i.reason) + "</td>" +
				"<td><button type='button' onclick='info(\"" + encode(log.userId) + "\",\"" + assertInt(i.date) + "\")' translation='logs.moreinfo'></button></td>" +
				"</tr>"
			).join("")
		})

		return text + "</tbody></table>"
	} else return handleError(json.message)
}

const ticketSearch = () => {
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
			log.setAttribute("hidden", "")
		} else {
			if (!log.classList.contains("cmdvisible")) log.classList.toggle("cmdvisible")
			log.removeAttribute("hidden")
		}
	}
}

const info = (user, date) => {
	const log = logs.find(l => l.userId == user && l.cases.find(c => c.date == parseInt(date)))
	const entry = log.cases?.find(c => c.date == parseInt(date))
	openDialog(document.getElementById("info-dialog"))

	document.getElementById("info-dialogText").innerHTML =
		"<b><span translation='logs.logtype'></span>:</b> " + encode(entry.type) +
		"<br><b><span translation='modlogs.user'></span>:</b> " + encode(log.userName || "") + " <small>(" + encode(log.userId) + ")</small>" +
		"<br><b><span translation='modlogs.mod'></span>:</b> " + encode(entry.modName || "") + " <small>(" + encode(entry.modId) + ")</small>" +
		"<br><b><span translation='modlogs.reason'></span>:</b> " + encode(entry.reason) +
		"<br><b>Modlog created:</b> " + new Date(entry.date).toLocaleString() +
		(log.until ? "<br><b translation='modlogs.activeuntil'></b> " + new Date(entry.until).toLocaleString() : "")
	reloadText()
}

loadFunc = () => {
	const params = new URLSearchParams(location.search)
	if (params.has("guild") && getCookie("token"))
		getModlogsHTML(params.get("guild")).then(data => {
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
