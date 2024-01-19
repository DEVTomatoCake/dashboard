let tickets = []

const info = id => {
	const ticket = tickets.find(l => l.id == id)
	openDialog(document.getElementById("info-dialog"))

	document.getElementById("info-dialogText").innerHTML =
		"<b>ID:</b> " + encode(ticket.id) +
		(ticket.ticketid ? "<br><b>Ticket ID:</b> " + assertInt(ticket.ticketid) : "") +
		"<br><br><b>Creator:</b> " + (ticket.username ? encode(ticket.username) + " <small>(" : "") + encode(ticket.owner) + (ticket.username ? "</small>)" : "") +
		(ticket.users ? "<br><b>Users:</b> " + ticket.users.map(u => encode(u)).join(", ") : "") +
		"<br><br><b>Current state:</b> " + encode(ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1)) +
		"<br><b>Created at:</b> " + new Date(ticket.createdAt).toLocaleString() +
		(ticket.closedAt ? "<br><b>Closed at:</b> " + new Date(ticket.closedAt).toLocaleString() : "") +
		(ticket.deletedAt ? "<br><b>Deleted at:</b> " + new Date(ticket.deletedAt).toLocaleString() : "")
	reloadText()
}

const ticketTable = data =>
	data.map(ticket =>
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
	).join("")

const sortTable = prop => {
	if (document.getElementById("sort-" + prop).classList.contains("asc")) document.getElementById("sort-" + prop).classList.remove("asc")
	else document.getElementById("sort-" + prop).classList.add("asc")

	document.getElementById("table-sortable").innerHTML = ticketTable(tickets.sort((a, b) => {
		const aValue = prop == "createdAt" ? new Date(a[prop]).getTime() : a[prop]
		const bValue = prop == "createdAt" ? new Date(b[prop]).getTime() : b[prop]
		if (!aValue || !bValue) return 0

		if (typeof aValue == "string") {
			if (document.getElementById("sort-" + prop).classList.contains("asc")) return aValue.localeCompare(bValue)
			return bValue.localeCompare(aValue)
		}
		if (document.getElementById("sort-" + prop).classList.contains("asc")) return bValue - aValue
		return aValue - bValue
	}))
	reloadText()
}

const getTicketsHTML = async guild => {
	const json = await get("tickets/" + guild)
	if (json.status == "success") {
		tickets = json.data

		return "<h1 class='greeting'><span translation='tickets.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
			"<table cellpadding='8' cellspacing='0'><thead>" +
			"<tr>" +
			"<th id='sort-ticketid' class='sortable' onclick='sortTable(\"ticketid\")'>ID & Transcript <ion-icon name='filter-outline'></ion-icon></th>" +
			"<th translation='tickets.table.user'></th>" +
			"<th id='sort-createdAt' class='sortable' onclick='sortTable(\"createdAt\")'>Creation date <ion-icon name='filter-outline'></ion-icon></th>" +
			"<th id='sort-state' class='sortable' onclick='sortTable(\"state\")'><span translation='tickets.table.state'></span> <ion-icon name='filter-outline'></ion-icon></th>" +
			"<th translation='logs.actions'></th>" +
			"</tr>" +
			"</thead><tbody id='table-sortable'>" +
			ticketTable(tickets) +
			"</tbody></table>"
	} else return handleError(json.message)
}

async function ticketSearch() {
	const ticid = document.getElementById("ts-id").value
	const ticuserid = document.getElementById("ts-userid").value
	const ticcontent = document.getElementById("ts-content").value
	const ticstate = document.getElementById("ts-state").value

	let includeContent = []
	if (ticcontent != "" && ticcontent.length > 2) {
		const params = new URLSearchParams(location.search)
		includeContent = (await get("ticketsearch/" + params.get("guild") + "?search=" + encodeURIComponent(ticcontent))).data
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
			tic.setAttribute("hidden", "")
		} else {
			if (!tic.classList.contains("cmdvisible")) tic.classList.toggle("cmdvisible")
			tic.removeAttribute("hidden")
		}
	}
}

loadFunc = async () => {
	const params = new URLSearchParams(location.search)
	if (params.has("guild") && getCookie("token")) {
		const html = await getTicketsHTML(params.get("guild"))
		document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", params.get("guild"))
		document.getElementById("root-container").innerHTML = html
		reloadText()
	} else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname + location.search + location.hash)
		location.href = "/dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
