function getTicketsHTML(guild) {
	return new Promise(resolve => {
		getTickets(guild)
			.then(json => {
				if (json.status == "success") {
					let text =
						"<h1 class='greeting'><span translation='tickets.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th>ID/Transcript</th><th translation='tickets.table.user'></th><th translation='tickets.table.otherusers'></th><th translation='tickets.table.state'></th></tr>" +
						"</thead><tbody>"

					json.data.forEach(ticket => {
						text +=
							"<tr class='ticket cmdvisible'>" +
							"<td><a href='/ticket/?id=" + encode(ticket.id) + "'>" + encode(ticket.id) + "</a></td>" +
							"<td>" + encode(ticket.owner) + "</td>" +
							"<td>" + encode(ticket.users.filter(u => u != ticket.owner).join(", ")) + "</td>" +
							"<td>" + encode(ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1)) + "</td>" +
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
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
