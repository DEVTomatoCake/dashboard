let bots = []
function getCustomHTML(json) {
	if (json.status == "success") {
		bots = json.bots
		return "<h1>Your custom bots</h1>" +
			"<p>This list includes all custom bots you have access to.</p><br>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Create a custom bot</button><br>" +
			"<br><div class='integration-container'>" +
			json.bots.map(bot =>
				"<div id='bot-" + encode(bot.id) + "' class='integration'>" +
				"<div>" +
				"<div class='flex'>" +
				"<img src='" + encode(bot.avatar) + "?size=64' class='bot-avatar' alt='Bot avatar of " + encode(bot.username) + "' loading='lazy' crossorigin='anonymous'>" +
				"<h2>" + encode(bot.username) + "</h2>" +
				"</div>" +
				"<p>Credit cost per day: <b>" + (bot.cost == 0 ? "Free" : bot.cost.toLocaleString()) + "</b></p>" +
				"<p>Current balance (<b>" + assertInt(bot.donations) + "</b> total donations): <b>" + bot.balance.toLocaleString() + "</b></p>" +
				"</div>" +
				"<div>" +
				(bot.hasAccess ?
					"<button type='button' class='createForm' onclick='editDialog(\"" + encode(bot.id) + "\")'><ion-icon name='build-outline'></ion-icon>Edit</button>" +
					"<button type='button' class='createForm red' onclick='deleteBot(\"" + encode(bot.id) + "\")'><ion-icon name='trash-outline'></ion-icon>Delete</button>" +
					"<br>" +
					"<button type='button' class='createForm green' id='startbutton-" + encode(bot.id) + "' onclick='startBot(\"" + encode(bot.id) + "\")'><ion-icon name='caret-up-outline'></ion-icon>Start/Restart</button>" +
					"<button type='button' class='createForm red' id='stopbutton-" + encode(bot.id) + "' onclick='stopBot(\"" + encode(bot.id) + "\")'" +
					(bot.online ? "" : " disabled title='Bot is offline already'") + "><ion-icon name='caret-down-outline'></ion-icon>Stop</button>"
				: "") +
				"</div>" +
				"</div>"
			).join("") +
			"</div>"
	}

	return (
		"<h1>An error occured while handling your request:</h1>" +
		"<h2>" + encode(json.message) + "</h2>"
	)
}

let socket
let errorToast
let step = 1
let info = {}
let tokenElem

const refresh = (force = false, save = false) => {
	socket.send({action: "GET_custom_info", botToken: tokenElem.value, force, save})
	if (step == 2) {
		document.getElementById("forward-button").setAttribute("disabled", "")
		setTimeout(() => {
			document.getElementById("forward-button").removeAttribute("disabled")
		}, 10000)
	}
	if (save) document.getElementById("create-dialog").setAttribute("hidden", "")
}

const forward = () => {
	document.getElementById("step" + step).setAttribute("hidden", "")
	step++
	if (step == 2 && info.todo.length == 0) step++
	document.getElementById("step" + step).removeAttribute("hidden")

	if (step >= 2) {
		document.getElementById("forward-button").textContent = step == 2 ? "Refresh" : "Create bot"
		document.getElementById("forward-button").onclick = () => refresh(true, step == 3)
	} else {
		document.getElementById("forward-button").textContent = "Next"
		document.getElementById("forward-button").onclick = forward
	}
	document.getElementById("back-button").removeAttribute("hidden")
	document.getElementById("setup-progress").value = step
}
const back = () => {
	if (step <= 1) return
	document.getElementById("step" + step).setAttribute("hidden", "")
	step--
	if (step == 2 && info.todo.length == 0) step--
	document.getElementById("step" + step).removeAttribute("hidden")

	document.getElementById("forward-button").removeAttribute("hidden")
	document.getElementById("forward-button").textContent = "Next"
	document.getElementById("forward-button").onclick = forward
	if (step == 1) document.getElementById("back-button").setAttribute("hidden", "")
	document.getElementById("setup-progress").value = step
}

function connectWS() {
	socket = sockette("wss://api.tomatenkuchen.com/user", {
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
				action: "GET_custom",
				token: getCookie("token")
			})
		},
		onMessage: json => {
			if (json.action == "NOTIFY") new ToastNotification(json).show()
			else if (json.action == "SAVED_custom") {
				new ToastNotification({type: "SUCCESS", title: "Custom bot " + json.username + " saved!", timeout: 10}).show()
				socket.send({status: "success", action: "GET_custom"})
			} else if (json.action == "RECEIVE_DELETE_custom") {
				new ToastNotification({type: json.status == "success" ? "SUCCESS" : "ERROR", title: json.message, timeout: 15}).show()
				if (json.status == "success") document.getElementById("bot-" + json.bot).remove()
			} else if (json.action == "RECEIVE_custom") {
				document.getElementById("root-container").innerHTML = getCustomHTML(json)
				reloadText()
			} else if (json.action == "RECEIVE_custom_info") {
				info = json
				if (json.status == "success") {
					tokenElem.setCustomValidity("")
					document.getElementById("bot-data").removeAttribute("hidden")
					if (step == 1) document.getElementById("forward-button").removeAttribute("disabled")

					document.getElementById("bot-name").textContent = encode(json.username)
					document.getElementById("bot-invite").href = "https://tomatenkuchen.com/invite?bot=" + json.id
					document.getElementById("bot-avatar").src = encode(json.avatar) + "?size=64"
					document.getElementById("bot-todo").innerHTML = json.todo.map(i => "<li>" + i + "</li>").join("")
					if (json.info.length > 0) document.getElementById("bot-todo-info").innerHTML = json.info.map(i => "<li>" + i + "</li>").join("")

					if (step == 2 && json.todo.length == 0) {
						forward()
						document.getElementById("forward-button").removeAttribute("disabled")
					}
				} else tokenElem.setCustomValidity(json.message)
				tokenElem.reportValidity()
			}
		}
	})
}

const createDialog = () => {
	step = 2
	back()
	openDialog(document.getElementById("create-dialog"))

	document.getElementById("custom-token").value = ""
	document.getElementById("custom-invite").value = ""
	document.getElementById("step3").setAttribute("hidden", "")
}

let editingBot = {}
const editDialog = (botId = "") => {
	openDialog(document.getElementById("edit-dialog"))
	editingBot = bots.find(b => b.id == botId)

	if (editingBot.canStatus) {
		document.getElementById("upgrade-status").setAttribute("checked", "")
		document.getElementById("status-container").removeAttribute("hidden")
	} else {
		document.getElementById("upgrade-status").removeAttribute("checked")
		document.getElementById("status-container").setAttribute("hidden", "")
	}
}

const statusEmoji = {
	online: "🟢",
	idle: "🟡",
	dnd: "🔴",
	offline: "⚫"
}
const statusActivity = {
	custom: "Custom",
	playing: "Playing",
	streaming: "Streaming",
	listening: "Listening",
	watching: "Watching",
	competing: "Competing"
}
const addStatus = () => {
	if (!document.getElementById("status-text").value) return new ToastNotification({type: "ERROR", timeout: 10, title: "You must set a status text!"}).show()
	if (document.getElementById("status-activity").value == "streaming" && !document.getElementById("status-text").value.includes("twitch.tv/"))
		return new ToastNotification({
			type: "ERROR", timeout: 10, title: "You must include a twitch.tv/<user> url in the Status text when using the Streaming activity!",
			tag: "The first occurrence of it won't be shown in the status later."
		}).show()

	socket.send({
		action: "ADD_custom_status", bot: editingBot.id,
		text: document.getElementById("status-text").value, status: document.getElementById("status-status").value, activity: document.getElementById("status-activity").value
	})

	document.getElementById("status-list").innerHTML +=
		"<div><br>" +
		"<p>" + encode(statusEmoji[document.getElementById("status-status").value] + " " + statusActivity[document.getElementById("status-activity").value] +": " +
		document.getElementById("status-text").value) + "</p>" +
		"<ion-icon name='trash-outline' onclick='removeStatus(this)'></ion-icon>" +
		"</div>"
	document.getElementById("status-text").value = ""
}
const removeStatus = elem => {
	socket.send({action: "REMOVE_custom_status", bot: editingBot.id, text: elem.parentElement.querySelector("p").textContent})
	elem.parentElement.remove()
}

const toggleStatus = () => {
	socket.send({action: "TOGGLE_custom_status", bot: editingBot.id, enabled: document.getElementById("upgrade-status").checked})
	document.getElementById("status-container").toggleAttribute("hidden")
}
const toggleOtherBot = () => {
	socket.send({action: "TOGGLE_custom_otherbot", bot: editingBot.id, enabled: document.getElementById("upgrade-respondotherbot").checked})
}

const startBot = bot => {
	socket.send({action: "START_custom", bot})
	document.getElementById("startbutton-" + bot).setAttribute("disabled", "")
	document.getElementById("stopbutton-" + bot).setAttribute("disabled", "")

	setTimeout(() => {
		document.getElementById("startbutton-" + bot).removeAttribute("disabled")
		document.getElementById("stopbutton-" + bot).removeAttribute("disabled")
	}, 20000)
}
const stopBot = bot => {
	socket.send({action: "STOP_custom", bot})
	document.getElementById("startbutton-" + bot).setAttribute("disabled", "")
	document.getElementById("stopbutton-" + bot).setAttribute("disabled", "")

	setTimeout(() => {
		document.getElementById("startbutton-" + bot).removeAttribute("disabled")
	}, 20000)
}

const deleteBot = bot => {
	const confirmed = confirm("Are you sure you permanently want to delete the bot " + encode(bot) + "? There's no going back and ALL data will be lost immediately!")
	if (confirmed) socket.send({action: "DELETE_custom", bot})
}

let lastChange = 0
let lastChangeTimeout
function tokenChange() {
	if (lastChange + 1800 > Date.now()) {
		clearTimeout(lastChangeTimeout)
		lastChangeTimeout = setTimeout(tokenChange, 1800)
		return
	}
	lastChange = Date.now()

	step = 1
	document.getElementById("bot-data").setAttribute("hidden", "")
	document.getElementById("back-button").setAttribute("hidden", "")
	document.getElementById("forward-button").setAttribute("disabled", "")

	const value = tokenElem.value
	if (value.length >= 50 && value.length <= 90 && /^[-\w]{20,}\.[-\w]{5,}\.[-\w]{25,}$/.test(value)) refresh()
}

loadFunc = () => {
	tokenElem = document.getElementById("custom-token")

	if (getCookie("token")) connectWS()
	else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
