let rolecopy = {}

const openForm = () => {
	document.getElementById("reactionroles-reaction").value = ""
	document.getElementById("reactionroles-msg").value = ""
	openDialog(document.getElementById("create-dialog"))
}
const getReactionrolesHTML = json => {
	if (json.status == "success") {
		let channeloptions = ""
		Object.keys(json.data.channels).forEach(key => channeloptions += "<option value='" + key + "'>" + json.data.channels[key] + "</option>")
		document.getElementById("reactionroles-channel").innerHTML = channeloptions

		let roleoptions = ""
		Object.keys(json.data.roles).forEach(key => roleoptions += "<option value='" + key + "'>" + json.data.roles[key] + "</option>")
		document.getElementById("reactionroles-role").innerHTML = roleoptions
		rolecopy = json.data.roles

		let text = ""
		json.data.reactionroles.forEach(setting => {
			const type = encode(setting.type)
			const emoji = encode(setting.reaction || setting.emoji)

			text +=
				"<div>" +
				(emoji ? (isNaN(emoji) ? "<p><b>" + emoji + "</b></p>" : "<img src='https://cdn.discordapp.com/emojis/" + emoji + ".webp?size=32' alt='' crossorigin='anonymous'><br>") : "") +
				(type == "button" || type == "select" ? "<p><b>" + encode(setting.label) + "</b></p>" : "") +
				"<select class='setting' data-type='" + type + "' data-msg='" + encode(setting.msg) + "' " +
				"data-channel='' " +
				(type == "reaction" ? "data-reaction='" + encode(setting.reaction) + "' " : "") +
				(type == "button" || type == "select" ?
					"data-label='" + encode(setting.label) + "' " +
					"data-emoji='" + encode(setting.emoji) + "' "
				: "") +
				(type == "button" && setting.buttonstyle ? "data-buttonstyle='" + encode(setting.buttonstyle) + "' " : "") +
				(type == "select" && setting.selectdesc ? "data-selectdesc='" + encode(setting.selectdesc) + "' " : "") +
				(setting.content ? "data-content='" + encode(setting.content) + "' " : "") +
				"id='" + encode(setting.msg + "-" + (setting.reaction || setting.label)) + "' " +
				"name='" + encode(setting.msg) + "'>" +
				"<option value=''>- Delete this self role -</option>" +
				Object.keys(rolecopy).map(key =>
					"<option value='" + encode(key) + "'" + (setting.role == key ? " selected" : "") + ">" + encode(rolecopy[key]) + "</option>"
				) +
				"</select><br><br></div>"
		})

		if (text == "") text = "<p id='no-rr'><b translation='dashboard.rr.norr'></b></p>"
		return "<h1 class='center'><span translation='dashboard.rr.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.rr.create'></button><br><br>" + text
	}

	return (
		"<h1>An error occured while handling your request:</h1>" +
		"<h2>" + encode(json.message) + "</h2>"
	)
}

const changeTab = elem => {
	for (const tab of document.getElementsByClassName("dialog-tab")) {
		if (tab.getAttribute("data-radio") == elem.getAttribute("data-radio")) {
			tab.classList.remove("active")
			document.getElementById(tab.getAttribute("name")).setAttribute("hidden", "")

			for (const input of document.getElementById(tab.getAttribute("name")).getElementsByTagName("input")) {
				if (input.required) {
					input.required = false
					input.dataset.required = true
				}
			}
		}
	}

	elem.classList.add("active")
	document.getElementById(elem.getAttribute("name")).removeAttribute("hidden")

	for (const input of document.getElementById(elem.getAttribute("name")).getElementsByTagName("input"))
		if (input.hasAttribute("data-required")) input.required = true

	if (elem.getAttribute("data-radio") == "rrtype") for (elem of document.querySelectorAll("#rr-currentmsg .reactionrole"))
		elem.remove()
}

const params = new URLSearchParams(location.search)
let hasLoaded = false
let hasSavePopup = false
let reverting = false

const handleChange = () => {
	if (!hasLoaded) return

	if (!hasSavePopup) {
		document.body.insertAdjacentHTML("beforeend",
			"<div class='userinfo-container' id='unsaved-container' role='status'>" +
			"<h2 translation='unsaved.title'>Unsaved changes</h2>" +
			"<button type='button' onclick='saveReactionroles()' translation='unsaved.save'>Save</button>" +
			"<button type='reset' class='red' onclick='reverting=true;socket.close();connectWS(\"" + encode(params.get("guild")) + "\")' translation='unsaved.revert'>Revert</button>" +
			"</div>"
		)
		fadeIn(document.getElementById("unsaved-container"))
		reloadText()
		hasSavePopup = true
	}
}

const clearInputs = (clearTabs = false) => {
	document.getElementById("reactionroles-reaction").value = ""
	document.getElementById("reactionroles-buttonlabel").value = ""
	document.getElementById("reactionroles-buttonemoji").value = ""
	document.getElementById("reactionroles-selectlabel").value = ""
	document.getElementById("reactionroles-selectdesc").value = ""
	document.getElementById("reactionroles-selectemoji").value = ""

	if (clearTabs) for (const elem of document.querySelectorAll("#rr-currentmsg .reactionrole")) elem.remove()
}
const addRR = event => {
	event.preventDefault()
	if (!document.getElementById("reactionroles-buttonlabel") || document.getElementById("reactionroles-buttonlabel").length > 80)
		return new ToastNotification({type: "ERROR", title: "You must enter a 1-80 character long button label!", timeout: 10}).show()

	const type = document.querySelector("span[data-radio='rrtype'].active").getAttribute("name")
	const emoji = document.getElementById("reactionroles-reaction").value || document.getElementById("reactionroles-buttonemoji").value || document.getElementById("reactionroles-selectemoji").value
	const msg = document.querySelector("span[data-radio='existingornew'].active").getAttribute("name") == "newmsg" ? "createnew_" + Math.random().toString(36).slice(2) : document.getElementById("reactionroles-msg").value

	document.getElementById("reactionroles-buttonlabel").required = false
	document.getElementById("reactionroles-buttonlabel").dataset.required = false

	const newelem = document.createElement("div")
	newelem.classList.add("reactionrole")
	newelem.innerHTML =
		(emoji ? (isNaN(emoji) ? "<p><b>" + encode(emoji) + "</b></p>" : "<img src='https://cdn.discordapp.com/emojis/" + encode(emoji) + ".webp?size=32' alt='' crossorigin='anonymous'><br>") : "") +
		(type == "button" || type == "select" ? "<p><b>" + encode(document.getElementById("reactionroles-" + type + "label").value) + "</b></p>" : "") +
		"<select class='setting' data-type='" + encode(type) + "' data-msg='" + encode(msg) + "' " +
		"data-channel='" + encode(document.getElementById("reactionroles-channel").value) + "' " +
		(type == "reaction" ? "data-reaction='" + encode(document.getElementById("reactionroles-reaction").value) + "' " : "") +
		(type == "button" || type == "select" ?
			"data-label='" + encode(document.getElementById("reactionroles-" + type + "label").value) + "' " +
			"data-emoji='" + encode(document.getElementById("reactionroles-" + type + "emoji").value) + "' "
		: "") +
		(type == "button" ? "data-buttonstyle='" + encode(document.getElementById("reactionroles-buttonstyle").value) + "' " : "") +
		(type == "select" ? "data-selectdesc='" + encode(document.getElementById("reactionroles-selectdesc").value) + "' " : "") +
		(
			document.querySelector("span[data-radio='existingornew'].active").getAttribute("name") == "newmsg" ?
			"data-content='" + encode(document.getElementById("reactionroles-content").value) + "' " : ""
		) +
		"id='" + encode(msg) + "-" +
		encode(
			document.getElementById("reactionroles-reaction").value ||
			document.getElementById("reactionroles-buttonlabel").value ||
			document.getElementById("reactionroles-selectlabel").value
		) +
		"' name='" + encode(msg) + "'>" +
		Object.keys(rolecopy).map(key =>
			"<option value='" + encode(key) + "'" +
			(document.getElementById("reactionroles-role").value == key ? " selected" : "") + ">" + encode(rolecopy[key]) + "</option>"
		) +
		"</select><ion-icon name='trash-outline' onclick='this.parentElement.remove()'></ion-icon><br><br>"

	document.getElementById("rr-currentmsg").appendChild(newelem)
	clearInputs()
}

let guildName = ""
const pickerData = {}
const cEmoPic = (elem, onlyNameReplace) => emojiPicker(elem.parentElement, pickerData.emojis, guildName, onlyNameReplace)

let socket
let saving = false
let savingToast
let errorToast

const connectWS = guild => {
	if (hasSavePopup) {
		fadeOut(document.getElementById("unsaved-container"))
		hasSavePopup = false
	}
	hasLoaded = false

	socket = sockette("wss://api.tomatenkuchen.com", {
		onClose: () => {
			if (reverting) reverting = false
			else errorToast = new ToastNotification({type: "ERROR", title: "Lost connection, retrying...", timeout: 30}).show()

			if (hasSavePopup) {
				fadeOut(document.getElementById("unsaved-container"))
				hasSavePopup = false
			}
			hasLoaded = false
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
				action: "GET_reactionroles",
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
			else if (json.action == "RECEIVE_reactionroles") {
				document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", guild)
				document.getElementById("root-container").innerHTML = "<div class='settingsContent'>" + getReactionrolesHTML(json) + "</div>"

				for (const elem of document.querySelectorAll("select.setting")) elem.onchange = () => handleChange()
				hasLoaded = true

				reloadText()
				guildName = json.name
			} else if (json.action == "SAVED_reactionroles") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("Saved reactionroles!")
			} else if (json.action == "GETRES_rr_message") {
				const elem = document.getElementById("reactionroles-msg")
				if (json.found) {
					elem.classList.remove("invalid")
					elem.setCustomValidity("")
				} else {
					elem.classList.add("invalid")
					elem.setCustomValidity("This message ID does not exist in the selected channel.")
				}
				elem.reportValidity()
			} else if (json.action == "RECEIVE_emojis") pickerData.emojis = json.emojis
		}
	})
}

let lastChange = 0
let lastChangeTimeout
const verifyMsg = () => {
	const elem = document.getElementById("reactionroles-msg")
	if (!elem.value || !/^[0-9]{17,21}$/.test(elem.value) || !document.getElementById("reactionroles-channel").value) return

	if (lastChange + 2100 > Date.now()) {
		clearTimeout(lastChangeTimeout)
		lastChangeTimeout = setTimeout(verifyMsg, 2100)
		return
	}
	lastChange = Date.now()

	socket.send({
		status: "success",
		action: "GET_rr_message",
		channel: document.getElementById("reactionroles-channel").value,
		msg: elem.value
	})
}

const saveReactionroles = () => {
	if (!params.has("guild") || saving) return
	saving = true

	const items = {}
	for (const item of document.querySelectorAll(".settingsContent .setting")) {
		const type = item.getAttribute("data-type")
		if (!items[item.name]) items[item.name] = []
		items[item.name].push({
			type,
			channel: item.getAttribute("data-channel"),
			msg: item.getAttribute("data-msg").trim(),
			role: item.value,
			content: item.getAttribute("data-content") || null,
			reaction: type == "reaction" ? item.getAttribute("data-reaction") : null,
			label: type == "button" || type == "select" ? item.getAttribute("data-label")?.trim() : null,
			emoji: type == "button" || type == "select" ? item.getAttribute("data-emoji")?.trim() : null,
			buttonstyle: type == "button" ? item.getAttribute("data-buttonstyle") : null,
			selectdesc: type == "select" ? item.getAttribute("data-selectdesc")?.trim() : null
		})
	}

	socket.send({
		status: "success",
		action: "SAVE_reactionroles",
		data: items
	})

	savingToast = new ToastNotification({type: "LOADING", title: "Saving reactionroles...", timeout: 7}).show()
}

document.addEventListener("keydown", event => {
	if ((event.metaKey || (event.ctrlKey && !event.altKey)) && event.key == "s") {
		event.preventDefault()
		saveReactionroles()
	}
})

document.addEventListener("DOMContentLoaded", () => {
	let amountnew = 0
	document.getElementById("create-form").addEventListener("submit", e => {
		e.preventDefault()
		if (document.getElementsByClassName("reactionrole").length == 0)
			return new ToastNotification({type: "ERROR", title: "You must add at least one reactionrole using the button above!", timeout: 10}).show()

		document.getElementById("create-dialog").setAttribute("hidden", "")
		if (document.getElementById("no-rr")) document.getElementById("no-rr").remove()

		const newmsg = document.querySelector("span[data-radio='existingornew'].active").getAttribute("name") == "newmsg"
		if (newmsg) amountnew++

		const div = document.createElement("div")
		let html = ""
		for (const elem of document.getElementsByClassName("reactionrole")) html += newmsg ? elem.innerHTML.replace(/createnew_[a-z0-9]+/g, "createnew_" + amountnew) : elem.innerHTML

		div.innerHTML = html
		document.getElementsByClassName("settingsContent")[0].appendChild(div)
		saveReactionroles()
	})

	if (params.has("guild") && getCookie("token")) connectWS(encode(params.get("guild")))
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname + location.search + location.hash)
		location.href = "/dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
})
