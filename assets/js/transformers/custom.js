function getCustomHTML(json) {
	if (json.status == "success") {
		let text = "<h1>Custom branded bots you have access to or are paying for</h1>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Create custom branded bot</button><br>" +
			"<br><div class='integration-container'>" +
			json.data.map(bot =>
				"<div class='integration'>" +
				"<h2>" + encode(bot.username) + "</h2>" +
				"<img src='" + encode(bot.avatar) + "?size=64' class='bot-avatar' alt='Bot avatar of " + encode(bot.username) + "'>" +
				"<div>" +
				(bot.hasAccess ?
					"<button type='button' class='createForm' disabled>Edit</button>" +
					"<button type='button' class='createForm red' disabled><ion-icon name='trash-outline'></ion-icon></button>" +
					"<br>" +
					"<button type='button' class='createForm green' onclick='startBot(\"" + bot.id + "\")'>(Re)Start</button>" +
					"<button type='button' class='createForm red' onclick='stopBot(\"" + bot.id + "\")'>Stop</button>"
				:
					"<button type='button' class='createForm red' onclick='removeYourself(\"" + bot.id + "\")'>Remove yourself from paying users</button>"
				) +
				"</div>" +
				"</div>"
			).join("") +
			"</div>"

		if (json.invited.length > 0) {
			text += "<br><br><h2>Bots you've been invited to to pay for</h2>" +
				"<div class='integration-container'>" +
				json.invited.map(bot =>
					"<div class='integration'>" +
					"<h2>" + encode(bot.username) + "</h2>" +
					"<img src='" + encode(bot.avatar) + "?size=64' class='bot-avatar' alt='Bot avatar of " + encode(bot.username) + "'>" +
					"<div>" +
					"<button type='button' class='createForm green' onclick='acceptInvite(\"" + bot.id + "\")'>Accept invite</button>" +
					"<button type='button' class='createForm red' onclick='declineInvite(\"" + bot.id + "\")'>Decline invite</button>" +
					"</div>" +
					"</div>"
				).join("") +
				"</div>"
		}

		return text
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>")
	}
}

const userList = (user, canDelete = false) => "<li><img src='" + user.avatar + "?size=32' width='32' height='32' alt='User avatar of " + encode(user.username) + "'>" +
	encode(user.username) + (canDelete ? "<ion-icon name='trash-outline' onclick='removeUser(\"" + user.id + "\")'></ion-icon>" : "") + "</li>"
let socket
let errorToast
let info = {}
let step = 1
let tokenElem

function connectWS() {
	socket = sockette("wss://api.tomatenkuchen.eu/user", {
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
			} else if (json.action == "ADDED_custom_paying") {
				if (json.status == "failed") new ToastNotification({type: "ERROR", title: json.message || "Unknown user!"}).show()
				else document.getElementById("bot-paying").innerHTML = "<ul>" + json.paying.map(u => userList(u, true)).join("") + "</ul>" + (json.payingInvited.length > 0 ?
					"<br><p>Users that can accept the invite on this page after creation:<ul>" + json.payingInvited.map(u => userList(u, true)).join("") + "</ul>": "")
			} else if (json.action == "RECEIVE_custom") {
				document.getElementById("root-container").innerHTML = getCustomHTML(json)
				reloadText()
			} else if (json.action == "RECEIVE_custom_info") {
				info = json
				if (json.status == "success") {
					document.getElementById("bot-data").removeAttribute("hidden")
					if (step == 1) document.getElementById("forward-button").removeAttribute("disabled")

					document.getElementById("bot-name").textContent = encode(json.username)
					document.getElementById("bot-invite").href = "https://discord.com/oauth2/authorize?client_id=" + json.id + "&scope=bot&permissions=1393602981110"
					document.getElementById("bot-avatar").src = encode(json.avatar) + "?size=64"
					document.getElementById("bot-access").innerHTML = json.access.map(userList).join("")
					document.getElementById("bot-paying").innerHTML = "<ul>" + json.paying.map(u => userList(u, true)).join("") + "</ul>" + (json.payingInvited.length > 0 ?
						"<br><p>Users that can accept the invite on this page after creation:<ul>" + json.payingInvited.map(u => userList(u, true)).join("") + "</ul>": "")
					document.getElementById("bot-todo").innerHTML = json.todo.map(i => "<li>" + i + "</li>").join("")
					if (step == 4 && json.todo.length == 0) {
						forward()
						document.getElementById("forward-button").removeAttribute("disabled")
					}
				} else {
					tokenElem.setCustomValidity("Invalid bot" + (info.message ? ": " + info.message : " token."))
					tokenElem.reportValidity()
				}
			}
		}
	})
}

function createDialog() {
	step = 2
	back()
	openDialog(document.getElementById("create-dialog"))

	document.getElementById("custom-token").value = ""
	document.getElementById("step3").setAttribute("hidden", "")
	document.getElementById("step4").setAttribute("hidden", "")
	document.getElementById("step5").setAttribute("hidden", "")
}

const refresh = (force = false, save = false) => {
	socket.send({action: "GET_custom_info", botToken: tokenElem.value, force, save})
	if (step == 4) {
		document.getElementById("forward-button").setAttribute("disabled", "")
		setTimeout(() => {
			document.getElementById("forward-button").removeAttribute("disabled")
		}, 10000)
	}
	if (save) document.getElementById("create-dialog").classList.add("hidden")
}

const addUser = () => {
	socket.send({action: "ADD_custom_paying", botToken: tokenElem.value, user: document.getElementById("custom-invite").value})
	document.getElementById("custom-invite").value = ""
}
const removeUser = user => socket.send({action: "REMOVE_custom_paying", botToken: tokenElem.value, user})

const startBot = bot => socket.send({action: "START_custom", bot})
const stopBot = bot => socket.send({action: "STOP_custom", bot})
const removeYourself = bot => {
	const confirmed = confirm("Are you sure you want to remove yourself from the paying users of the bot " + encode(bot) + "?")
	if (confirmed) socket.send({action: "REMOVE_custom_paying_yourself", bot})
}
const deleteBot = bot => {
	const confirmed = confirm("Are you sure you permanently want to delete the bot " + encode(bot) + "?")
	if (confirmed) socket.send({action: "DELETE_custom", bot})
}
const acceptInvite = bot => socket.send({action: "ACCEPT_invite", bot})
const declineInvite = bot => socket.send({action: "DECLINE_invite", bot})

function back() {
	if (step <= 1) return
	document.getElementById("step" + step).setAttribute("hidden", "")
	step--
	if (step == 4 && info.todo.length == 0) step--
	document.getElementById("step" + step).removeAttribute("hidden")

	document.getElementById("forward-button").removeAttribute("hidden")
	document.getElementById("forward-button").textContent = "Next"
	document.getElementById("forward-button").onclick = forward
	if (step == 1) document.getElementById("back-button").setAttribute("hidden", "")
}
function forward() {
	document.getElementById("step" + step).setAttribute("hidden", "")
	step++
	if (step == 4 && info.todo.length == 0) step++
	document.getElementById("step" + step).removeAttribute("hidden")

	if (step >= 4) {
		document.getElementById("forward-button").textContent = step == 4 ? "Refresh" : "Create bot"
		document.getElementById("forward-button").onclick = () => refresh(true, step == 5)
	} else {
		document.getElementById("forward-button").textContent = "Next"
		document.getElementById("forward-button").onclick = forward
	}
	document.getElementById("back-button").removeAttribute("hidden")
}

function tokenChange() {
	step = 1
	document.getElementById("bot-data").setAttribute("hidden", "")
	document.getElementById("back-button").setAttribute("hidden", "")
	document.getElementById("forward-button").setAttribute("disabled", "")

	const value = tokenElem.value
	if (value.length >= 50 && value.length <= 90 && /^[-a-z0-9_]{20,}\.[-a-z0-9_]{5,}\.[-a-z0-9_]{25,}$/i.test(value)) refresh()
}

loadFunc = () => {
	tokenElem = document.getElementById("custom-token")

	if (getCookie("token")) connectWS()
	else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "../../login/?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
