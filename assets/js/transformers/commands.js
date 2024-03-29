let commandData = []

const getCommandsHTML = async () => {
	const json = await get("commands?lang=" + getLanguage(), false)
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

		return text
	} else return handleError(json.message)
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

const cmdInfo = (elem, command) => {
	const info = elem.querySelector(".cmd-info")
	if (info) info.remove()
	else {
		const cmd = commandData.find(c => c.name == command)
		let html = "<div class='cmd-info'>" +
			"<p><span translation='commands.category'></span>: " + encode(cmd.category.charAt(0).toUpperCase() + cmd.category.slice(1)) + "</p>" +
			"<p><span translation='commands.usage'></span>: " + encode(cmd.usage) + "</p>"

		if (cmd.aliases.length > 0) html += "<p><span translation='commands.aliases'></span> " + encode(cmd.aliases.join(", ")) + "</p>"
		if (cmd.options) html += "<p><span translation='commands.args'></span><ul>" + cmd.options.map(o => (
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

loadFunc = async () => {
	const html = await getCommandsHTML()
	document.getElementById("linksidebar").innerHTML +=
		"<div class='section middle'><p class='title' translation='commands.categories'></p>" +
		"<div class='tab' id='tab-ticket' tabindex='0'><ion-icon name='ticket-outline'></ion-icon><p>Ticket</p></div>" +
		"<div class='tab' id='tab-fun' tabindex='0'><ion-icon name='happy-outline'></ion-icon><p>Fun</p></div>" +
		"<div class='tab' id='tab-suggest' tabindex='0'><ion-icon name='bulb-outline'></ion-icon><p translation='user.suggestions'></p></div>" +
		"<div class='tab' id='tab-economy' tabindex='0'><ion-icon name='card-outline'></ion-icon><p>Economy</p></div>" +
		"<div class='tab' id='tab-moderation' tabindex='0'><ion-icon name='shield-half-outline'></ion-icon><p>Moderation</p></div>" +
		"<div class='tab' id='tab-info' tabindex='0'><ion-icon name='information-outline'></ion-icon><p>Info</p></div>" +
		"<div class='tab' id='tab-admin' tabindex='0'><ion-icon name='settings-outline'></ion-icon><p>Admin</p></div>" +
		"</div>"

	handleClickAndEnter("tab-ticket", cmdSearch, "ticket", true)
	handleClickAndEnter("tab-fun", cmdSearch, "fun", true)
	handleClickAndEnter("tab-suggest", cmdSearch, "suggest", true)
	handleClickAndEnter("tab-economy", cmdSearch, "economy", true)
	handleClickAndEnter("tab-moderation", cmdSearch, "moderation", true)
	handleClickAndEnter("tab-info", cmdSearch, "info", true)
	handleClickAndEnter("tab-admin", cmdSearch, "admin", true)

	document.getElementById("commands-container").innerHTML = html
	reloadText()
}
