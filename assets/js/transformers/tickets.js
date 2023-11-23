let tickets = []

const info = id => {
	const ticket = tickets.find(l => l.id == id)
	openDialog(document.getElementById("info-dialog"))

	document.getElementById("info-dialogText").innerHTML =
		"<b>Ticket ID:</b> " + encode(ticket.id) +
		(ticket.ticketid ? "<br><b>Ticket ID:</b> " + assertInt(ticket.ticketid) : "") +
		"<br><br><b>Creator:</b> " + (ticket.username ? encode(ticket.username) + " <small>(" : "") + encode(ticket.owner) + (ticket.username ? "</small>)" : "") +
		(ticket.users ? "<br><b>Users:</b> " + ticket.users.map(u => encode(u)).join(", ") : "") +
		"<br><br><b>Current state:</b> " + encode(ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1)) +
		"<br><b>Created at:</b> " + new Date(ticket.createdAt).toLocaleString() +
		(ticket.closedAt ? "<br><b>Closed at:</b> " + new Date(ticket.closedAt).toLocaleString() : "") +
		(ticket.deletedAt ? "<br><b>Deleted at:</b> " + new Date(ticket.deletedAt).toLocaleString() : "")
	reloadText()
}

function getTicketsHTML(guild) {
	return new Promise(resolve => {
		getTickets(guild)
			.then(json => {
				if (json.status == "success") {
					let text =
						"<h1 class='greeting'><span translation='tickets.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th>ID & Transcript</th><th translation='tickets.table.user'></th><th>Creation date</th><th translation='tickets.table.state'></th><th translation='logs.actions'></th></tr>" +
						"</thead><tbody>"

					tickets = json.data
					json.data.forEach(ticket => {
						text +=
							"<tr class='ticket cmdvisible'>" +
							"<td><a href='/ticket?id=" + encode(ticket.id) + "'>" + (ticket.ticketid ? assertInt(ticket.ticketid) : encode(ticket.id)) + "</a></td>" +
							"<td>" + (ticket.username ? encode(ticket.username) + "<br><small>(" : "") + encode(ticket.owner) + (ticket.username ? "</small>)" : "") + "</td>" +
							"<td title='" + new Date(ticket.createdAt).toLocaleString() + "'>" + new Date(ticket.createdAt).toLocaleDateString() + "</td>" +
							"<td" + (ticket.deletedAt || ticket.closedAt ? " title='" + new Date(ticket.deletedAt || ticket.closedAt).toLocaleString() + "'" : "") + ">" +
								encode(ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1)) +
								(ticket.deletedAt || ticket.closedAt ? " (" + new Date(ticket.deletedAt || ticket.closedAt).toLocaleDateString() + ")" : "") +
							"</td>" +
							"<td>" +
								"<button type='button' onclick='info(\"" + encode(ticket.id) + "\")' translation='logs.moreinfo'></button>" +
							"</td>" +
							"</tr>"
					})

					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

async function ticketSearch() {
	const ticid = document.getElementById("ts-id").value
	const ticuserid = document.getElementById("ts-userid").value
	const ticcontent = document.getElementById("ts-content").value
	const ticstate = document.getElementById("ts-state").value

	let includeContent = []
	if (ticcontent != "" && ticcontent.length > 2) {
		const params = new URLSearchParams(location.search)
		includeContent = (await searchTickets(params.get("guild"), ticcontent)).data
	}

	for (const tic of document.getElementById("content").getElementsByClassName("ticket")) {
		const rows = tic.getElementsByTagName("td")

		let hidden = false
		if (ticid != "" && !rows[0].textContent.toLowerCase().includes(ticid.toLowerCase())) hidden = true
		if (ticcontent != "" && !includeContent.includes(rows[0].textContent.toLowerCase())) hidden = true
		if (ticuserid != "" && !rows[1].textContent.toLowerCase().includes(ticuserid.toLowerCase())) hidden = true
		if (ticstate != "all" && !rows[3].textContent.toLowerCase().includes(ticstate.toLowerCase())) hidden = true

		if (hidden) {
			if (tic.classList.contains("cmdvisible")) tic.classList.toggle("cmdvisible")
			tic.classList.add("hidden")
		} else {
			if (!tic.classList.contains("cmdvisible")) tic.classList.toggle("cmdvisible")
			tic.classList.remove("hidden")
		}
	}
}

loadFunc = () => {
	const params = new URLSearchParams(location.search)
	if (params.has("guild") && getCookie("token"))
		getTicketsHTML(params.get("guild")).then(data => {
			document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", params.get("guild"))
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
