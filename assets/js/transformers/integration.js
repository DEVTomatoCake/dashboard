function getIntegrationsHTML(json, guild) {
	if (json.status == "success") {
		let text = ""

		if (json.integrations.some(i => i.guild == guild))
			text +=
				"<br><br><h2 translation='integration.thisserver'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild == guild).map(handleIntegration).join("") +
				"</div>"
		else text += "<div class='integration-container'></div>"

		if (json.integrations.some(i => i.guild != guild && i.isOwner))
			text +=
				"<br><br><h2 translation='integration.yours'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild != guild && i.isOwner).map(handleIntegration).join("") +
				"</div>"

		if (json.integrations.some(i => i.guild != guild && !i.isOwner))
			text +=
				"<br><br><h2 translation='integration.otherpublic'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild != guild && !i.isOwner).map(handleIntegration).join("") +
				"</div>"

		if (text == "<div class='integration-container'></div>") text += "<p id='no-integrations'><b translation='integration.none'></b></p>"
		return "<h1 class='center'><span translation='integration.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='createDialog()' translation='integration.create'></button>" + text + "</div>"
	}

	return (
		"<h1>An error occured while handling your request:</h1>" +
		"<h2>" + encode(json.message) + "</h2>"
	)
}

function handleChange(id) {
	if (id == "integration-sync") {
		const inputs = document.querySelectorAll(".action textarea, .action input")
		const triggers = document.querySelectorAll(".action channel-picker.action-trigger")
		if (document.getElementById("integration-sync").getAttribute("data-selected") == "auto" || document.getElementById("integration-sync").getAttribute("data-selected") == "safe") {
			for (const elem of inputs) elem.setAttribute("readonly", "")
			for (const elem of triggers) elem.classList.add("disabled")
		} else {
			for (const elem of inputs) elem.removeAttribute("readonly")
			for (const elem of triggers) elem.classList.remove("disabled")
		}
	}
}

const params = new URLSearchParams(location.search)
function createDialog() {
	document.getElementById("create-dialog").removeAttribute("data-edit")
	document.getElementById("integration-name").value = params.get("guild") + "-" + Math.random().toString(36).slice(9)
	document.getElementById("integration-name").removeAttribute("readonly")
	document.getElementById("integration-short").value = ""
	document.getElementById("integration-public").checked = false
	document.getElementById("integration-disabled").checked = false
	document.getElementById("actions-container").innerHTML = ""
	document.getElementById("integration-input").value = ""
	document.getElementById("integration-env").value = ""
	document.getElementById("integration-use-container").setAttribute("hidden", "")
	document.getElementById("integration-submit").setAttribute("translation", "integration.create")

	addAction()
	openDialog(document.getElementById("create-dialog"))
	reloadText()
}

function addAction(trigger = "command") {
	const newElem = document.getElementById("actions-template").content.cloneNode(true)
	newElem.id = "actions-" + Math.random().toString(36).slice(2)
	const wrapper = document.createElement("div")
	wrapper.classList.add("action")
	wrapper.appendChild(newElem)
	document.getElementById("actions-container").appendChild(wrapper)

	const triggerElem = wrapper.querySelector("channel-picker .picker div[data-id='" + trigger + "']")
	triggerElem.classList.add("selected")
	wrapper.querySelector("channel-picker .list").innerHTML += "<div>" + triggerElem.innerHTML + "</div>"
	wrapper.querySelector("channel-picker").setAttribute("data-selected", triggerElem.getAttribute("data-id"))

	return wrapper
}

let guildName = ""
let integrations = []
let pickerData = {}
function integrationInfo(integrationName) {
	openDialog(document.getElementById("info-dialog"))
	const integration = integrations.find(e => e.name == integrationName)
	if (!integration) return alert("Unknown integration \"" + integrationName + "\"!")

	document.getElementById("info-container").innerHTML =
		"<h1><span translation='integration.infotitle'></span> <b>" + encode(integrationName) + "</b></h1>" +
		(integration.verified ? " <ion-icon name='checkmark-circle-outline' title='Verified integration'></ion-icon>" : "") +
		(integration.unsynced ? " <ion-icon name='refresh-outline' title='Has unsynced changes'></ion-icon>" : "") +
		(integration.short ? "<p>" + encode(integration.short) + "</p><br>" : "") +
		"<p><span translation='integration.owner'></span> <b>" + encode(integration.owner) + "</b></p>" +
		"<p><span translation='integration.public'></span>: " + (integration.public ? "✅" : "❌") + "</p>" +
		"<p><span>Disabled on the creating server</span>: " + (integration.disabled ? "✅" : "❌") + "</p>" +
		(integration.uses ? "<p><span translation='integration.usedby'></span> <b>" + assertInt(integration.uses) + "</b></p>" : "") +
		(integration.source ? "<p>Source: <b>" + encode(integration.source) + "</b></p>" : "") +
		"<p><span translation='tickets.created'></span>: " + new Date(integration.created).toLocaleString() + "</p>" +
		"<p><span translation='integration.lastupdate'></span> " + new Date(integration.lastUpdate).toLocaleString() + "</p><br><h2 translation='integration.actions'></h2>" +
		integration.actions.map((action, i) => (
			"<p><span translation='integration.trigger'></span>: " + encode(pickerData["action-trigger"][action.trigger].split("<br>")[0]) + "</p>" +
			"<p>Name: <b>" + encode(action.name) + "</b></p>" +
			(action.args && action.args[0] ? "<p>Argument: " + encode(action.args[0]) + "</p>" : "") +
			"<br><textarea class='code' id='info-content" + i + "' rows='" + (Math.round(action.content.split("\n").length * 1.2) + 2) + "' readonly>" + encode(action.content) + "</textarea>"
		)).join("<br><br>") +
		(integration.guild == params.get("guild") ? "" :
			"<br><br><button type='button' class='createForm' onclick='integrationUse(\"" + encode(integrationName) + "\")'><span translation='integration.use'></span> <b>" +
			encode(guildName) + "</b></button>"
		)
	reloadText()
}

function integrationUse(integrationName) {
	document.getElementById("info-dialog").setAttribute("hidden", "")
	openDialog(document.getElementById("create-dialog"))
	const integration = integrations.find(e => e.name == integrationName)
	if (!integration) return alert("Unknown integration \"" + integrationName + "\"!")

	document.getElementById("create-title").innerHTML = "<span translation='integration.createsource'></span> <b>" + encode(integration.name) + "</b>" +
		(integration.guild == params.get("guild") && integration.unsynced ? "<br><br><button type='button' class='createForm red' onclick='socket.send({status:\"success\"," +
			"action:\"SYNC_integration\",name:\"" + encode(integrationName) + "\"})this.remove()'>Sync integration from original</button>" : "")
	document.getElementById("integration-name").value = params.get("guild") + "-" + encode(integration.name)
	document.getElementById("integration-short").value = encode(integration.short)
	document.getElementById("integration-public").checked = false
	document.getElementById("integration-disabled").checked = false
	document.getElementById("integration-use-container").removeAttribute("hidden")
	document.getElementById("integration-submit").onclick = () => createIntegration(integrationName)
	if (integration.input && integration.input.length > 0) {
		document.getElementById("integration-use-inputtext").innerHTML = "<br><p>Variable inputs</p>"
		document.getElementById("integration-use-input").innerHTML = integration.input.map(e => {
			const randomId = Math.random().toString(36).slice(2)
			return "<label for='use-input-" + randomId + "'>" + encode(e.split("")[1]) + "</label>" +
				"<input type='text' maxlength='200' id='use-input-" + randomId + "' value='" + (encode(e.split("")[2]) || "") + "' name='" + encode(e.split("")[0]) + "' data-desc='" + encode(e.split("")[1]) + "'>"
		}).join("<br>")
	} else {
		document.getElementById("integration-use-inputtext").innerHTML = ""
		document.getElementById("integration-use-input").innerHTML = ""
	}

	document.getElementById("actions-container").innerHTML = ""
	integration.actions.forEach(action => {
		const newElem = addAction(action.trigger)
		newElem.querySelector(".action-name").value = action.name
		newElem.querySelector(".action-args1").value = action.args && action.args[0] ? action.args[0] : ""
		newElem.querySelector(".action-content").value = action.content
		newElem.querySelector(".action-content").rows = Math.round(action.content.split("\n").length * 1.2) + 2
		handleChange("integration-sync")
	})
	reloadText()
}

function integrationEdit(integrationName) {
	openDialog(document.getElementById("create-dialog"))
	const integration = integrations.find(e => e.name == integrationName)

	document.getElementById("create-dialog").setAttribute("data-edit", "")
	document.getElementById("create-title").innerHTML = "<span translation='integration.edittitle'></span> <b>" + encode(integrationName) + "</b>"
	document.getElementById("integration-name").value = integrationName
	document.getElementById("integration-name").setAttribute("readonly", "")
	document.getElementById("integration-short").value = integration.short || ""
	document.getElementById("integration-public").checked = integration.public
	document.getElementById("integration-disabled").checked = integration.disabled
	document.getElementById("integration-input").value = integration.input ? integration.input.join("\n") : ""
	document.getElementById("integration-input").rows = (integration.input ? integration.input.length : 0) + 2
	document.getElementById("integration-env").value = integration.env ? integration.env.join("\n") : ""
	document.getElementById("integration-env").rows = (integration.env ? integration.env.length : 0) + 2
	document.getElementById("integration-use-container").setAttribute("hidden", "")
	document.getElementById("integration-submit").setAttribute("translation", "integration.editsave")

	document.getElementById("actions-container").innerHTML = ""
	integration.actions.forEach(action => {
		const newElem = addAction(action.trigger)
		newElem.querySelector(".action-name").value = action.name
		newElem.querySelector(".action-args1").value = action.args && action.args[0] ? action.args[0] : ""
		newElem.querySelector(".action-content").value = action.content
		newElem.querySelector(".action-content").rows = Math.round(action.content.split("\n").length * 1.2) + 2
	})
	reloadText()
}

let socket
function integrationDelete(elem, integration = "") {
	const confirmed = confirm("Are you sure you want to delete the integration \"" + integration + "\"? This cannot be undone!")
	if (confirmed) {
		elem.parentElement.parentElement.remove()
		integrations = integrations.filter(int => int.name != integration)
		socket.send({status: "success", action: "DELETE_integration", name: integration})
	}
}

function nameExists(elem) {
	if (integrations.some(int => int.name == elem.value)) elem.setCustomValidity("Name already exists.")
	else elem.setCustomValidity("")
	elem.reportValidity()
}

function handleIntegration(integration) {
	return "<div class='integration'>" +
		"<div class='flex'>" +
			(integration.image ? "<img class='integration-image' crossorigin='anonymous' src='" + encode(integration.image) + "' alt='Integration image of " + encode(integration.name) + "' loading='lazy'>" : "") +
			"<h3>" + encode(integration.name) + "</h3>" +
			(integration.verified ? " <ion-icon name='checkmark-circle-outline' title='Verified integration'></ion-icon>" : "") +
			(integration.unsynced ? " <ion-icon name='refresh-outline' title='Has unsynced changes'></ion-icon>" : "") +
			(integration.disabled ? " <ion-icon name='close-circle-outline' title='Disabled on the creating server'></ion-icon>" : "") +
		"</div>" +
		(integration.short ? "<p>" + encode(integration.short.substring(0, 100)) + "</p>" : "") +
		"<br>" +
		(integration.isOwner ? "" : "<p><span translation='integration.owner'></span> " + encode(integration.owner) + "</p>") +
		"<p><span translation='integration.public'></span>: " + (integration.public ? "✅" : "❌") + "</p>" +
		"<p><span translation='integration.lastupdate'></span> " + new Date(integration.lastUpdate).toLocaleDateString() + "</p>" +
		"<div class='flex'>" +
			"<button onclick='integrationInfo(\"" + encode(integration.name) + "\")' translation='integration.viewuse'></button>" +
			(integration.guild == params.get("guild") ? "<button onclick='integrationEdit(\"" + encode(integration.name) + "\")'><span translation='integration.edit'></span> <ion-icon name='build-outline'></ion-icon></button>" : "") +
			(integration.guild == params.get("guild") ? "<button class='red' onclick='integrationDelete(this, \"" + encode(integration.name) + "\")'><ion-icon name='trash-outline'></ion-icon></button>" : "") +
		"</div>" +
		"</div>"
}

let saving = false
let savingToast
let errorToast

function connectWS(guild) {
	socket = sockette("wss://api.tomatenkuchen.com", {
		onClose: () => {
			errorToast = new ToastNotification({type: "ERROR", title: "Lost connection, retrying...", timeout: 30}).show()
		},
		onOpen: event => {
			console.log("Connected!", event)
			if (errorToast) {
				errorToast.setType("SUCCESS")
				setTimeout(() => {
					errorToast.close()
				}, 1000)
			}
			socket.send({
				status: "success",
				action: "GET_integrations",
				guild,
				lang: getLanguage(),
				token: getCookie("token")
			})
			socket.send({
				status: "success",
				action: "GET_emojis",
				guild,
				token: getCookie("token")
			})
		},
		onMessage: json => {
			if (json.action == "NOTIFY") new ToastNotification(json).show()
			else if (json.action == "RECEIVE_integrations") {
				document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", guild)
				document.getElementById("root-container").innerHTML = getIntegrationsHTML(json, guild)
				reloadText()
				guildName = json.name
				integrations = json.integrations

				pickerData = {
					...pickerData,
					"integration-sync": json.sync,
					"action-trigger": json.triggers
				}

				const item = ["integration-sync", "safe"]
				const pickerNode = document.createElement("channel-picker")
				pickerNode.setAttribute("id", item[0])
				pickerNode.setAttribute("type", item[0])
				pickerNode.setAttribute("tabindex", "0")
				pickerNode.setAttribute("data-unsafe", "1")
				document.querySelector("label[for='" + item[0] + "']").parentNode.insertBefore(pickerNode, document.querySelector("label[for='" + item[0] + "']").nextSibling)

				const elem = document.querySelector("#" + item[0] + " .picker div[data-id='" + item[1] + "']")
				elem.classList.add("selected")
				document.querySelector("#" + item[0] + " .list").innerHTML += "<div>" + elem.innerHTML + "</div>"
				document.getElementById(item[0]).setAttribute("data-selected", elem.getAttribute("data-id"))

				if (params.has("info") || params.has("use"))
					setTimeout(() => {
						if (params.has("info")) integrationInfo(params.get("info"))
						else integrationUse(params.get("use"))
					}, 250)
			} else if (json.action == "SAVED_integration") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("The integration was saved!")
			} else if (json.action == "RECEIVE_emojis") {
				pickerData = {
					...pickerData,
					emojis: json.emojis,
					roles: json.roles
				}
			}
		}
	})
}

function createIntegration(sourceId = "") {
	if (!params.has("guild") || saving) return
	saving = true

	const name = encode(document.getElementById("integration-name").value)
	if (!name) return alert("Enter a name for the integration!")
	if (!/^[a-z0-9_-]+$/g.test(name)) return alert("The name can only contain lowercase letters, numbers, underscores and dashes!")
	if (name.length > 32) return alert("The name can be at most 32 characters long!")

	document.getElementById("create-dialog").setAttribute("hidden", "")
	if (document.getElementById("no-integrations")) document.getElementById("no-integrations").remove()

	let input = []
	if (sourceId) {
		const children = document.getElementById("integration-use-input").children
		for (const elem of children) input.push(elem.getAttribute("name") + "" + elem.getAttribute("data-desc") + "" + elem.value)
	} else input = document.getElementById("integration-input").value.split("\n").map(e => e.trim()).filter(e => e)

	const data = {
		edit: document.getElementById("create-dialog").hasAttribute("data-edit"),
		guild: params.get("guild"),
		owner: getCookie("user") || "You",
		isOwner: true,
		created: Date.now(),
		lastUpdate: Date.now(),
		name,
		short: document.getElementById("integration-short").value,
		public: document.getElementById("integration-public").checked,
		disabled: document.getElementById("integration-disabled").checked,
		actions: [],
		input,
		env: document.getElementById("integration-env").value.split("\n").map(e => e.trim()).filter(e => e)
	}
	if (sourceId) {
		data.source = sourceId
		data.sync = document.getElementById("integration-sync").getAttribute("data-selected")
	}

	const actions = document.getElementById("actions-container").getElementsByClassName("action")
	for (let j = 0; j < actions.length; j++) {
		const action = actions.item(j)
		data.actions.push({
			name: action.querySelector(".action-name").value,
			args: action.querySelector(".action-args1").value ? [action.querySelector(".action-args1").value] : [],
			trigger: action.querySelector(".action-trigger").getAttribute("data-selected"),
			content: action.querySelector(".action-content").value
		})
	}
	integrations = integrations.filter(int => int.name != data.name)
	integrations.push(data)

	if (!data.edit) {
		const div = document.createElement("div")
		div.innerHTML = handleIntegration(data)
		document.getElementsByClassName("integration-container")[0].appendChild(div)
		reloadText()
	}

	socket.send({
		status: "success",
		action: "SAVE_integration",
		data
	})

	savingToast = new ToastNotification({type: "LOADING", title: "Saving integration \"" + encode(name) + "\"...", timeout: 7}).show()
}

loadFunc = () => {
	if (params.has("guild") && getCookie("token")) connectWS(encode(params.get("guild")))
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname + location.search)
		location.href = "/dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
