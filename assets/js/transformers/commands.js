let commandData = []

const getCommandsHTML = () => {
	return new Promise((resolve => {
		getCommands()
			.then(json => {
				if (json.status == "success") {
					let text = "<center>"
					const categories = []
					const categoryData = []

					json.data.forEach(command => {
						const temp =
							"<tr class='command cmdvisible' data-category='" + encode(command.category) +
							"' onclick='cmdInfo(this, \"" + encode(command.name) + "\")'>" +
							"<td>" + encode(command.name) + "</td>" +
							"<td>" + encode(command.desc) + "</td>" +
							"</tr>"

						if (!categories.includes(command.category)) categories.push(command.category)
						categoryData.push([command.category, temp])
					})

					categories.forEach(category => {
						text +=
							"<h2 id='" + encode(category) + "title' class='center'>" + encode(category.charAt(0).toUpperCase() + category.slice(1)) + "</h2>" +
							"<button type='button' id='" + encode(category) + "tb' onclick='toggleCategory(\"" +
							encode(category) + "\")' translation='commands.hide'></button>" +
							"<table cellpadding='8' cellspacing='0' class='category' id='" + encode(category) + "'>" +
							"<thead><tr><th translation='commands.name'></th><th translation='commands.description'></th></tr></thead><tbody>"

						categoryData.forEach(data => {
							if (category == data[0]) text += data[1]
						})
						text += "</tbody></table><br id='" + encode(category) + "br'>"
					})

					commandData = json.data
					resolve(text + "</center>")
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	}))
}

const cmdSearch = (search = "", onlyCategories = false) => {
	if (search) document.getElementById("cmd-search").value = ""
	else search = document.getElementById("cmd-search").value.toLowerCase()

	const categories = {}
	const filtered = new Set(commandData.filter(c =>
		c.category != "owner" &&
		(
			c.category.toLowerCase().includes(search) ||
			(!onlyCategories && (c.name.toLowerCase().includes(search) || c.desc.toLowerCase().includes(search)))
		)
	))

	for (const cmd of document.getElementById("commands-container").getElementsByClassName("command")) {
		const cat = cmd.getAttribute("data-category")
		if (!categories[cat] && categories[cat] != false) categories[cat] = false

		if (filtered.has(commandData.find(c => c.name == cmd.querySelector("td").innerText))) {
			cmd.classList.add("cmdvisible")
			cmd.classList.remove("hidden")
			categories[cat] = true
		} else {
			cmd.classList.remove("cmdvisible")
			cmd.classList.add("hidden")
		}
	}

	for (const category of document.getElementById("commands-container").getElementsByClassName("category")) {
		if (categories[category.id]) {
			category.classList.remove("hidden")
			document.getElementById(category.id + "tb").classList.remove("hidden")
			document.getElementById(category.id + "title").classList.remove("hidden")
			document.getElementById(category.id + "br").classList.remove("hidden")
		} else {
			category.classList.add("hidden")
			document.getElementById(category.id + "tb").classList.add("hidden")
			document.getElementById(category.id + "title").classList.add("hidden")
			document.getElementById(category.id + "br").classList.add("hidden")
		}
	}
}

const cmdInfo = (elem, cmd) => {
	const info = elem.querySelector(".cmd-info")
	if (info) info.remove()
	else {
		const command = commandData.find(c => c.name == cmd)
		let html = "<div class='cmd-info'>" +
			"<p><span translation='commands.category'></span>: " + encode(command.category) + "</p>" +
			"<p><span translation='commands.usage'></span>: " + encode(command.usage) + "</p>"

		if (command.aliases[0] != command.name) html += "<p><span translation='commands.aliases'></span> " + encode(command.aliases.join(", ")) + "</p>"
		if (command.options) html += "<p><span translation='commands.args'></span> " + command.options.map(o => (
			"<span title='" + encode(o.desc) + "'>" + encode(o.name) +
			(o.required || o.type.startsWith("SUB_COMMAND") ? "<span class='red-text'>*</span>" : "") + " <small>" + encode(o.type) + "</small></span>"
		)).join(", ") + "</p>"

		elem.querySelector("td:nth-child(2)").innerHTML += html + "</div>"
		reloadText()
	}
}

const toggleCategory = category => {
	const toModify = document.getElementById(category)

	if (toModify.classList.contains("hidden")) {
		toModify.classList.remove("hidden")
		document.getElementById(category + "tb").setAttribute("translation", "commands.hide")
	} else {
		toModify.classList.add("hidden")
		document.getElementById(category + "tb").setAttribute("translation", "commands.show")
	}
	reloadText()
}

loadFunc = () => {
	getCommandsHTML().then(html => {
		document.getElementById("linksidebar").innerHTML +=
			"<div class='section middle'><p class='title' translation='commands.categories'></p>" +
			"<div class='tab' onclick='cmdSearch(\"ticket\", true)'><ion-icon name='ticket-outline'></ion-icon><p>Ticket</p></div>" +
			"<div class='tab' onclick='cmdSearch(\"fun\", true)'><ion-icon name='happy-outline'></ion-icon><p>Fun</p></div>" +
			"<div class='tab' onclick='cmdSearch(\"suggest\", true)'><ion-icon name='chatbox-ellipses-outline'></ion-icon><p translation='user.suggestions'></p></div>" +
			"<div class='tab' onclick='cmdSearch(\"economy\", true)'><ion-icon name='card-outline'></ion-icon><p>Economy</p></div>" +
			"<div class='tab' onclick='cmdSearch(\"moderation\", true)'><ion-icon name='shield-half-outline'></ion-icon><p>Moderation</p></div>" +
			"<div class='tab' onclick='cmdSearch(\"info\", true)'><ion-icon name='information-outline'></ion-icon><p>Info</p></div>" +
			"<div class='tab' onclick='cmdSearch(\"admin\", true)'><ion-icon name='settings-outline'></ion-icon><p>Admin</p></div>" +
			"</div>"

		document.getElementById("commands-container").innerHTML = html
		reloadText()
	})
}
