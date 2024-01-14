let commandData = []

const getCommandsHTML = () => {
	return new Promise((resolve => {
		get("commands?lang=" + getLanguage(), false)
			.then(json => {
				if (json.status == "success") {
					commandData = json.data
					let text = ""
					const categories = []
					const categoryData = []

					json.data.filter(cmd => cmd.category != "owner").forEach(cmd => {
						const temp =
							"<tr class='command cmdvisible' data-category='" + encode(cmd.category) +
							"' onclick='cmdInfo(this, \"" + encode(cmd.name) + "\")'>" +
							"<td>" + encode(cmd.name) + "</td>" +
							"<td>" + encode(cmd.desc) + "</td>" +
							"</tr>"

						if (!categories.includes(cmd.category)) categories.push(cmd.category)
						categoryData.push([cmd.category, temp])
					})

					categories.forEach(category => {
						text +=
							"<h2 id='" + encode(category) + "_title' class='center'>" + encode(category.charAt(0).toUpperCase() + category.slice(1)) + "</h2>" +
							"<button type='button' id='" + encode(category) + "_tb' onclick='toggleCategory(\"" +
							encode(category) + "\")' translation='commands.hide'></button>" +
							"<table cellpadding='8' cellspacing='0' class='category' id='" + encode(category) + "'>" +
							"<thead><tr><th translation='commands.name'></th><th translation='commands.description'></th></tr></thead><tbody>"

						categoryData.forEach(data => {
							if (category == data[0]) text += data[1]
						})
						text += "</tbody></table><br id='" + encode(category) + "_br'>"
					})

					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	}))
}

const cmdSearch = search => {
	for (const elem of document.querySelector("#linksidebar .section.middle").getElementsByClassName("tab")) elem.classList.remove("active")

	const input = search || document.getElementById("cmd-search").value.toLowerCase()
	if (search) {
		document.getElementById("cmd-search").value = ""

		document.getElementById("tab-" + input).classList.add("active")
		if (screen.width <= 800) sidebar()
	}

	const categories = {}
	const filtered = new Set(commandData.filter(c =>
		c.category != "owner" && (
			c.category.toLowerCase().includes(input) ||
			(!search && (c.name.toLowerCase().includes(input) || c.desc.toLowerCase().includes(input)))
		)
	))

	for (const cmd of document.getElementById("commands-container").getElementsByClassName("command")) {
		const cat = cmd.getAttribute("data-category")
		categories[cat] = categories[cat] || false

		if (filtered.has(commandData.find(c => c.name == cmd.querySelector("td").textContent))) {
			cmd.classList.add("cmdvisible")
			cmd.removeAttribute("hidden")
			categories[cat] = true
		} else {
			cmd.classList.remove("cmdvisible")
			cmd.setAttribute("hidden", "")
		}
	}

	for (const category of document.getElementById("commands-container").getElementsByClassName("category")) {
		if (categories[category.id]) {
			category.removeAttribute("hidden")
			document.getElementById(category.id + "_tb").removeAttribute("hidden")
			document.getElementById(category.id + "_title").removeAttribute("hidden")
			document.getElementById(category.id + "_br").removeAttribute("hidden")
		} else {
			category.setAttribute("hidden", "")
			document.getElementById(category.id + "_tb").setAttribute("hidden", "")
			document.getElementById(category.id + "_title").setAttribute("hidden", "")
			document.getElementById(category.id + "_br").setAttribute("hidden", "")
		}
		if (search) document.getElementById(category.id + "_tb").setAttribute("hidden", "")
	}

	if (filtered.size == 0) document.getElementById("no-cmds-found").removeAttribute("hidden")
	else document.getElementById("no-cmds-found").setAttribute("hidden", "")
}

const cmdInfo = (elem, cmd) => {
	const info = elem.querySelector(".cmd-info")
	if (info) info.remove()
	else {
		const command = commandData.find(c => c.name == cmd)
		let html = "<div class='cmd-info'>" +
			"<p><span translation='commands.category'></span>: " + encode(command.category.charAt(0).toUpperCase() + command.category.slice(1)) + "</p>" +
			"<p><span translation='commands.usage'></span>: " + encode(command.usage) + "</p>"

		if (command.aliases.length > 0) html += "<p><span translation='commands.aliases'></span> " + encode(command.aliases.join(", ")) + "</p>"
		if (command.options) html += "<p><span translation='commands.args'></span><ul>" + command.options.map(o => (
			"<li>" + encode(o.name) +
			(o.required ? "<span class='red-text'>*</span>" : "") +
			(o.type.startsWith("SUB_COMMAND") ? "" : " <small>" + encode(o.type) + "</small>") +
			": " + encode(o.desc) + "</li>" +
			(o.options ? "<ul>" + o.options.map(o2 => (
				"<li>" + encode(o2.name) +
				(o2.required ? "<span class='red-text'>*</span>" : "") +
				(o2.type.startsWith("SUB_COMMAND") ? "" : " <small>" + encode(o2.type) + "</small>") +
				": " + encode(o2.desc) + "</li>"
			)).join("") + "</ul>" : "")
		)).join("") + "</ul></p>"

		elem.querySelector("td:nth-child(2)").innerHTML += html + "</div>"
		reloadText()
	}
}

const toggleCategory = category => {
	const toModify = document.getElementById(category)

	if (toModify.hasAttribute("hidden")) {
		toModify.removeAttribute("hidden")
		document.getElementById(category + "_tb").setAttribute("translation", "commands.hide")
	} else {
		toModify.setAttribute("hidden", "")
		document.getElementById(category + "_tb").setAttribute("translation", "commands.show")
	}
	reloadText()
}

loadFunc = () => {
	getCommandsHTML().then(html => {
		document.getElementById("linksidebar").innerHTML +=
			"<div class='section middle'><p class='title' translation='commands.categories'></p>" +
			"<div class='tab' id='tab-ticket' onclick='cmdSearch(\"ticket\", true)'><ion-icon name='ticket-outline'></ion-icon><p>Ticket</p></div>" +
			"<div class='tab' id='tab-fun' onclick='cmdSearch(\"fun\", true)'><ion-icon name='happy-outline'></ion-icon><p>Fun</p></div>" +
			"<div class='tab' id='tab-suggest' onclick='cmdSearch(\"suggest\", true)'><ion-icon name='bulb-outline'></ion-icon><p translation='user.suggestions'></p></div>" +
			"<div class='tab' id='tab-economy' onclick='cmdSearch(\"economy\", true)'><ion-icon name='card-outline'></ion-icon><p>Economy</p></div>" +
			"<div class='tab' id='tab-moderation' onclick='cmdSearch(\"moderation\", true)'><ion-icon name='shield-half-outline'></ion-icon><p>Moderation</p></div>" +
			"<div class='tab' id='tab-info' onclick='cmdSearch(\"info\", true)'><ion-icon name='information-outline'></ion-icon><p>Info</p></div>" +
			"<div class='tab' id='tab-admin' onclick='cmdSearch(\"admin\", true)'><ion-icon name='settings-outline'></ion-icon><p>Admin</p></div>" +
			"</div>"

		document.getElementById("commands-container").innerHTML = html
		reloadText()
	})
}
