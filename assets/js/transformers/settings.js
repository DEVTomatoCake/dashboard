let settingsData = {}
let selectData = {}
let queue = []

const params = new URLSearchParams(location.search)
let saving = false
let savingToast
let errorToast

const friendlyCat = {
	ticket: "Tickets",
	level: "Leaderboard<br>& level",
	stats: "Statistics",
	boost: "Boost messages",
	autonick: "Role nicknames",
	voting: "Vote messages",
	customrole: "Custom roles"
}

let guildName = ""
const pickerData = {}
let socket

function getSettingsHTML(json) {
	if (json.status == "success") {
		let text = ""
		const categories = []
		const categoryData = []

		json.data.forEach(setting => {
			let temp = "<label for='" + setting.key + "'>" + setting.desc + "</label>" +
				(setting.docs ? " <a href='https://docs.tomatenkuchen.com/" + (getLanguage() == "de" ? "de/" : "") + setting.docs + "' target='_blank' rel='noopener'><small>Docs</small></a>" : "") + "<br>"

			if (setting.possible || typeof setting.value == "object") {
				let possible = setting.possible
				if (typeof possible == "string") possible = json.constant[possible]
				else if (typeof possible == "object") {
					Object.keys(possible).filter(key => key != "").sort((a, b) => b.pos - a.pos).forEach(key => {
						if (typeof possible[key] == "string" && json.constant[possible[key]]) possible[key] = json.constant[possible[key]]
					})
				}

				selectData[setting.key] = setting
				if (typeof setting.type == "string" && Array.isArray(setting.value) && (setting.type == "role" || setting.type.endsWith("channel"))) {
					temp += "<channel-picker id='" + setting.key + "' data-multi='1' type='" + setting.type + "'></channel-picker>"
					queue.push(() => {
						if (selectData[setting.key].value.length == 0) document.getElementById(setting.key).querySelector(".list").innerHTML = "<div class='element'><ion-icon name='build-outline'></ion-icon></div>"
						else {
							selectData[setting.key].value.forEach(v => {
								const elem = document.getElementById(setting.key).querySelector(".picker div[data-id='" + v + "']")
								if (!elem) return
								elem.classList.toggle("selected")
								document.getElementById(setting.key).querySelector(".list").innerHTML += "<div>" + elem.innerHTML + "</div>"
							})
						}
					})
				} else if (typeof setting.value == "object") {
					temp += "<div id='" + setting.key + "' class='advancedsetting'>"
					if (Array.isArray(setting.value)) temp += "<button class='createForm' onclick='addItem(\"" + setting.key + "\", void 0, \"\", this.parentElement)' translation='dashboard.add'>Add</button>"

					if (setting.value.length > 0 && typeof setting.value[0] == "object") temp += Object.keys(setting.value).map(i => addItem(setting.key, i, setting.value[i], void 0, true)).join("")
					else if (setting.value.length > 0) temp += setting.value.map(i => addItem(setting.key, i)).join("")
					else if (Object.keys(setting.value).length > 0) {
						setting.org = "object"
						setting.value = [setting.value]
						temp += addItem(setting.key, void 0, setting.value[0], void 0, true)
					}
					temp += "</div><br>"
				} else if (setting.type == "role" || setting.type.endsWith("channel")) {
					temp += "<channel-picker id='" + setting.key + "' type='" + setting.type + "'></channel-picker>"
					queue.push(() => updateSelected(document.getElementById(setting.key).querySelector(".picker .element"), setting.value))
				} else {
					temp += "<select class='setting' id='" + setting.key + "'>"
					Object.keys(possible).forEach(key => {
						if (setting.type == "bool") temp += "<option value='" + key + "'" + ((setting.value && key == "true") || (!setting.value && key != "true") ? " selected" : "") + ">" + possible[key] + "</option>"
						else temp += "<option value='" + key + "'" + (setting.value == key ? " selected" : "") + ">" + possible[key] + "</option>"
					})
					temp += "</select><br>"
				}
			} else {
				if (setting.type == "int" || setting.type == "number") temp +=
					"<input type='number' min='" + (setting.min || 0) + "' max='" + (setting.max || 10000) + "' step='" + (setting.step || 1) + "' class='setting' id='" + setting.key +
					"' value='" + (setting.type == "number" ? parseFloat(setting.value) : parseInt(setting.value)) + "'>"
				else if (setting.type == "time" || setting.type == "singlestring") {
					temp += "<input type='text' class='setting' id='" + setting.key + "' value='" + setting.value.replace(/[<>&"']/g, "") + "'>"
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value)
				} else if (setting.type == "emoji") {
					temp += "<div><input class='setting' id='" + setting.key + "' value='" + setting.value.replace(/[<>&"']/g, "") + "' onclick='cEmoPic(this, true)' readonly></div>"
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value)
				} else {
					temp += "<div class='emoji-container'><textarea class='setting' rows='" + (setting.value.split("\n").length + 1) + "' id='" + setting.key + "'>" + setting.value.replace(/[<>&"']/g, "") + "</textarea>" +
						"<ion-icon name='at-outline' title='Rolepicker' onclick='cMenPic(this)'></ion-icon>" +
						"<ion-icon name='happy-outline' title='Emojipicker' onclick='cEmoPic(this)'></ion-icon></div>"
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value)
				}
				temp += "<br>"
			}
			if (!categories.includes(setting.category)) categories.push(setting.category)
			categoryData.push([setting.category, temp + "<br>"])
		})

		categories.forEach(category => {
			text += "<div id='setcat-" + category + "' class='settingdiv'><h2 id='" + category + "'>" + (friendlyCat[category] || category.charAt(0).toUpperCase() + category.slice(1)) + "</h2><br>"
			categoryData.forEach(data => {
				if (category == data[0]) text += data[1]
			})
			text += "</div>"
		})

		return {
			html: "<h1 class='center'><span translation='dashboard.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" + text,
			categories
		}
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>")
	}
}

function settingsTab(tab) {
	for (const elem of document.querySelectorAll(".tab.small.active")) elem.classList.remove("active")
	document.getElementById("settings-tab-" + tab).classList.add("active")

	for (const elem of document.getElementsByClassName("settingdiv")) elem.classList.add("hidden")
	document.getElementById("setcat-" + tab).classList.remove("hidden")

	document.getElementById("root-container").scrollIntoView()
	if (screen.width <= 800) sidebar()
}

let changed = []
let hasLoaded = false
let hasSavePopup = false
function handleChange(id) {
	if (!hasLoaded) return
	if (!changed.includes(id.split("_")[0])) changed.push(id.split("_")[0])

	if (!hasSavePopup) {
		document.body.insertAdjacentHTML("beforeend",
			"<div class='userinfo-container unsaved-container' id='unsaved-container'>" +
			"<h2 translation='unsaved.title'>Unsaved changes</h2>" +
			"<button type='button' onclick='saveSettings()' translation='unsaved.save'>Save</button>" +
			"<button type='button' class='red' onclick='connectWS(\"" + encode(params.get("guild")) + "\")' translation='unsaved.revert'>Revert</button>" +
			"</div>"
		)
		fadeIn(document.getElementById("unsaved-container"))
		reloadText()
		hasSavePopup = true
	}
}

function connectWS(guild) {
	if (hasSavePopup) {
		fadeOut(document.getElementById("unsaved-container"))
		hasSavePopup = false
		changed = []
	}
	hasLoaded = false

	socket = sockette("wss://api.tomatenkuchen.com", {
		onClose: () => {
			errorToast = new ToastNotification({type: "ERROR", title: "Lost connection, retrying...", timeout: 30}).show()

			if (hasSavePopup) {
				fadeOut(document.getElementById("unsaved-container"))
				hasSavePopup = false
				changed = []
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
				action: "GET_settings",
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
			else if (json.action == "RECEIVE_settings") {
				settingsData = json.data
				pickerData.role = json.constant.role
				pickerData.textchannel = json.constant.textchannel
				pickerData.leveltextchannel = {here: "Current channel", ...pickerData.textchannel}
				pickerData.voicechannel = json.constant.voicechannel
				pickerData.categorychannel = json.constant.categorychannel
				pickerData.announcementchannel = json.data.find(setting => setting.type == "announcementchannel").possible
				const rendered = getSettingsHTML(json)

				let sidebarHTML =
					"<div class='section middle'><p class='title' translation='dashboard.settings'></p>" +
					"<a class='tab otherlinks' href='./integrations?guild=" + guild + "'><ion-icon name='terminal-outline'></ion-icon><p translation='dashboard.integrations'>Integrations</p></a>" +
					"<a class='tab otherlinks' href='./reactionroles?guild=" + guild + "'><ion-icon name='happy-outline'></ion-icon><p>Reactionroles</p></a>" +
					"<a class='tab otherlinks' href='../leaderboard?guild=" + guild + "'><ion-icon name='speedometer-outline'></ion-icon><p translation='dashboard.leaderboard'>Leaderboard</p></a>" +
					"<a class='tab otherlinks' href='../stats?guild=" + guild + "'><ion-icon name='bar-chart-outline'></ion-icon><p translation='dashboard.stats'>Statistics</p></a>" +
					"<hr>"

				rendered.categories.forEach(category => {
					sidebarHTML += "<div class='tab small' id='settings-tab-" + category + "' onclick='settingsTab(\"" + category + "\")'><ion-icon name='settings-outline'></ion-icon><p>" +
						(friendlyCat[category] || category.charAt(0).toUpperCase() + category.slice(1)) + "</p></div>"
				})

				document.getElementById("linksidebar").innerHTML =
					"<a href='/' title='Home' class='tab'>" +
						"<ion-icon name='home-outline'></ion-icon>" +
						"<p translation='sidebar.home'></p>" +
					"</a>" +
					"<a href='/commands' title='Bot commands' class='tab'>" +
						"<ion-icon name='terminal-outline'></ion-icon>" +
						"<p translation='sidebar.commands'></p>" +
					"</a>" +
					"<a href='/dashboard' class='tab active'>" +
						"<ion-icon name='settings-outline'></ion-icon>" +
						"<p translation='sidebar.dashboard'></p>" +
					"</a>" +
					sidebarHTML + "</div>"

				document.getElementById("root-container").innerHTML = "<div class='settingsContent'>" + rendered.html + "</div>"
				queue.forEach(f => f())
				queue = []
				if (location.hash != "") document.getElementById(location.hash.slice(1)).scrollIntoViewIfNeeded(true)
				reloadText()
				guildName = json.name
				for (const elem of document.querySelectorAll("input.setting, textarea.setting, select.setting")) elem.onchange = () => handleChange(elem.id)
				hasLoaded = true
			} else if (json.action == "SAVED_settings") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("Saved settings!")
			} else if (json.action == "RECEIVE_emojis") {
				pickerData.emojis = json.emojis
				pickerData.roles = json.roles
			}
		}
	})
}

const cMenPic = elem => mentionPicker(elem.parentElement, pickerData.roles)
const cEmoPic = (elem, onlyNameReplace) => emojiPicker(elem.parentElement, pickerData.emojis, guildName, onlyNameReplace)

function addItem(settingKey, key = Math.random().toString(36).slice(4), value, parent, noDefault = false) {
	const setting = selectData[settingKey]
	if (parent && setting.key == "rssUpdate")
		value = {
			author: "{author}",
			title: "{title}",
			description: "{content}",
			image: "{image}",
			footer: "{domain}"
		}

	let possible = setting.possible || {}
	if (typeof setting.possible == "string") possible = pickerData[possible]
	else if (typeof setting.possible == "object") {
		Object.keys(setting.possible).filter(possibleKey => possibleKey != "").forEach(possibleKey => {
			if (typeof setting.possible[possibleKey] == "string" && pickerData[setting.possible[possibleKey]]) possible[possibleKey] = pickerData[setting.possible[possibleKey]]
		})
	}

	if (parent && Array.isArray(setting.value) && parent.childElementCount > setting.max) return new ToastNotification({type: "ERROR", title: "Maximum amount (" + setting.max + ") reached!"}).show()

	let html = "<div class='setgroup'>"
	if (typeof setting.type == "object" && Array.isArray(setting.value)) {
		html += possible[key] ? "<label for='" + setting.key + "_" + key + "'>" + possible[key].name + "</label><br>" : ""
		Object.keys(setting.type).forEach(setKey => {
			html += "<div><label for='" + setting.key + "_" + setKey + "_" + key + "'>" + setKey + "</label><br>"
			if (setting.type[setKey] == "int" || setting.type[setKey] == "number" || setting.type[setKey].type == "int" || setting.type[setKey].type == "number") html +=
				"<input type='number' min='" + (setting.type[setKey].min || 0) + "' max='" + (setting.type[setKey].max || 10000) + "' step='" + (setting.type[setKey].step || 1) +
				"' class='settingcopy' id='" + setting.key + "_" + setKey + "_" + key +
				"' value='" + (parent || noDefault ? (value[setKey] ?? "") : (setting.type[setKey] == "number" ? parseFloat(value[setKey] ?? key) : parseInt(value[setKey] ?? key))) + "'><br>"
			else if (setting.type[setKey] == "role" || setting.type[setKey].endsWith("channel")) {
				html += "<channel-picker id='" + setting.key + "_" + setKey + "_" + key + "' type='" + setting.type[setKey] + "'></channel-picker>"
				queue.push(() => updateSelected(document.getElementById(setting.key + "_" + setKey + "_" + key).querySelector(".picker .element"), value[setKey]))
			} else if (typeof setting.type[setKey] == "string" && possible[setKey] && Object.keys(possible[setKey]).length > 0) {
				html += "<select class='settingcopy' id='" + setting.key + "_" + setKey + "_" + key + "'>"
				Object.keys(possible[setKey]).forEach(posKey => {
					if (setting.type[setKey] == "bool") html += "<option value='" + posKey + "'" + ((value[setKey] && key == "true") || (!value[setKey] && key != "true") ? " selected" : "") + ">" + possible[setKey][posKey] + "</option>"
					else if (typeof possible[setKey][posKey] == "string") html += "<option value='" + posKey + "'" + (value[setKey] == posKey ? " selected" : "") + ">" + possible[setKey][posKey] + "</option>"
					else html += "<option value='" + posKey + "'" + (value[setKey] == posKey ? " selected" : "") + ">" + possible[setKey][posKey].name + "</option>"
				})
				html += "</select><br>"
			} else if (setting.type[setKey] == "time" || setting.type[setKey] == "singlestring") {
				html += "<input type='text' class='setting' id='" + setting.key + "_" + setKey + "_" + key + "' value='" +
					(parent || noDefault ? (value[setKey] ?? "") : (value[setKey] ?? key).replace(/[<>&"']/g, "")) + "'><br>"
				if (/[<>&"']/.test(value[setKey] ?? key)) queue.push(() => document.getElementById(setting.key + "_" + setKey + "_" + key).value = value[setKey] ?? key)
			} else {
				html += "<div class='emoji-container'><textarea class='setting' rows='" + ((value[setKey] ?? key).split("\n").length + 1) + "' id='" + setting.key + "_" + setKey + "_" + key + "' aria-label='Value for " + setting.key + "'>" +
					(parent || noDefault ? (value[setKey] ?? "") : (value[setKey] ?? key).replace(/[<>&"']/g, "")) + "</textarea>" +
					"<ion-icon name='at-outline' title='Rolepicker' onclick='cMenPic(this)'></ion-icon>" +
					"<ion-icon name='happy-outline' title='Emojipicker' onclick='cEmoPic(this)'></ion-icon></div>"
				if (/[<>&"']/.test(value[setKey] ?? key)) queue.push(() => document.getElementById(setting.key + "_" + setKey + "_" + key).value = value[setKey] ?? key)
			}
			html += "</div>"
		})
	} else {
		let type = setting.type
		if (type[key]) type = type[key]

		if (!parent && !Array.isArray(setting.value)) html += "<label for='" + setting.key + "_" + key + "'>" + key + "</label><br>"
		if (type == "int" || type == "number") html +=
			"<input type='number' min='" + (setting.min || 0) + "' max='" + (setting.max || 10000) + "' step='" + (setting.step || 1) + "' class='settingcopy' id='" + setting.key + "_" + key +
			"' value='" + (parent || noDefault ? "" : (type == "number" ? parseFloat(value ?? key) : parseInt(value ?? key))) + "'><br>"
		else if (type == "role" || type.endsWith("channel")) {
			html += "<channel-picker id='" + setting.key + "_" + key + "' type='" + type + "'></channel-picker>"
			queue.push(() => updateSelected(document.getElementById(setting.key + "_" + key).querySelector(".picker .element"), value))
		} else if (typeof type == "string" && possible[key] && Object.keys(possible[key]).length > 0) {
			html += "<select class='settingcopy' id='" + setting.key + "_" + key + "'>"
			Object.keys(possible[key]).forEach(posKey => {
				if (type == "bool") html += "<option value='" + posKey + "'" + ((value && key == "true") || (!value && key != "true") ? " selected" : "") + ">" + possible[key][posKey] + "</option>"
				else if (typeof possible[key][posKey] == "string") html += "<option value='" + posKey + "'" + (value == posKey ? " selected" : "") + ">" + possible[key][posKey] + "</option>"
				else html += "<option value='" + posKey + "'" + (value == posKey ? " selected" : "") + ">" + possible[key][posKey].name + "</option>"
			})
			html += "</select><br>"
		} else if (type == "time" || type == "singlestring") {
			html += "<input type='text' class='setting' id='" + setting.key + "_" + key + "' value='" + (parent || noDefault ? "" : (value ?? key).replace(/[<>&"']/g, "")) + "'><br>"
			if (/[<>&"']/.test(value ?? key)) queue.push(() => document.getElementById(setting.key + "_" + key).value = value ?? key)
		} else {
			html += "<div class='emoji-container'><textarea class='setting' rows='" + ((value ?? key).split("\n").length + 1) + "' id='" + setting.key + "_" + key + "' aria-label='Value for " + setting.key + "'>" +
				(parent || noDefault ? "" : (value ?? key).replace(/[<>&"']/g, "")) + "</textarea>" +
				"<ion-icon name='at-outline' title='Rolepicker' onclick='cMenPic(this)'></ion-icon>" +
				"<ion-icon name='happy-outline' title='Emojipicker' onclick='cEmoPic(this)'></ion-icon></div>"
			if (/[<>&"']/.test(value ?? key)) queue.push(() => document.getElementById(setting.key + "_" + key).value = value ?? key)
		}
	}
	html += (Array.isArray(setting.value) && !setting.org ? "<ion-icon name='trash-outline' class='removeItem' onclick='this.parentElement.remove();handleChange(\"" + setting.key + "\")'></ion-icon>" : "") +
		"</div>"

	if (parent) {
		parent.insertAdjacentHTML("beforeend", html)
		queue.forEach(f => f())
		queue = []
		for (const elem of document.querySelectorAll("input.setting, textarea.setting, select.setting")) elem.onchange = () => handleChange(elem.id)

		if (parent && Array.isArray(setting.value)) {
			const buttons = parent.querySelectorAll("button.createForm")
			if (buttons.length > 1) buttons[1].remove()
			if (parent.childElementCount > 3)
				parent.insertAdjacentHTML("beforeend", "<button class='createForm' onclick='addItem(\"" + setting.key + "\", void 0, \"\", this.parentElement)' translation='dashboard.add'>Add</button>")
		}
		reloadText()
	} else return html
}

function saveSettings() {
	if (!params.has("guild") || saving) return
	saving = true

	const items = {}
	settingsData.forEach(setting => {
		if (!changed.includes(setting.key)) return

		let entry
		if (typeof setting.type == "string" && Array.isArray(setting.value) && (setting.type == "role" || setting.type.endsWith("channel"))) entry = selectData[setting.key].value
		else if (setting.org == "object") {
			entry = {}
			Object.keys(setting.type).forEach(key => {
				const child = document.querySelector("[id^=" + setting.key + "_" + key + "_]")

				if (setting.type[key] == "bool") entry[key] = child.value == "true"
				else if (setting.type[key] == "number" || setting.type[key].type == "number") entry[key] = parseFloat(child.value)
				else if (setting.type[key] == "int" || setting.type[key].type == "int") entry[key] = parseInt(child.value)
				else if (child.hasAttribute("data-selected")) entry[key] = child.getAttribute("data-selected")
				else entry[key] = child.value
			})
		} else if (Array.isArray(setting.value)) {
			entry = []
			if (typeof setting.type == "object") {
				const parent = document.getElementById(setting.key)
				for (const arrentry of parent.querySelectorAll("div.setgroup")) {
					const temp = {}
					Object.keys(setting.type).forEach(key => {
						for (const objchild of arrentry.querySelectorAll("input,textarea,select,channel-picker")) {
							let value = objchild.value
							if (setting.type[key] == "bool") value = objchild.value == "true"
							else if (setting.type[key] == "number" || setting.type[key].type == "number") value = parseFloat(objchild.value)
							else if (setting.type[key] == "int" || setting.type[key].type == "int") value = parseInt(objchild.value)
							else if (objchild.hasAttribute("data-selected")) value = objchild.getAttribute("data-selected")

							if (objchild.id.split("_")[1] == key) temp[key] = value
							else if (!objchild.id.split("_")[2]) entry.push(value)
						}
					})
					if (Object.keys(temp).length > 0) entry.push(temp)
				}
			} else for (const objchild of document.getElementById(setting.key).querySelectorAll("input,textarea,select,channel-picker")) entry.push(objchild.value)
		} else if (setting.type == "bool") entry = document.getElementById(setting.key).value == "true"
		else if (setting.type == "number") entry = parseFloat(document.getElementById(setting.key).value)
		else if (setting.type == "int") entry = parseInt(document.getElementById(setting.key).value)
		else if (document.getElementById(setting.key).hasAttribute("data-selected")) entry = document.getElementById(setting.key).getAttribute("data-selected")
		else entry = document.getElementById(setting.key).value

		items[setting.key] = entry
	})

	socket.send({
		status: "success",
		action: "SAVE_settings",
		data: items
	})

	if (hasSavePopup) {
		fadeOut(document.getElementById("unsaved-container"))
		hasSavePopup = false
		changed = []
	}

	savingToast = new ToastNotification({type: "LOADING", title: "Saving settings...", timeout: 7}).show()
}

loadFunc = () => {
	if (params.has("guild") && getCookie("token")) connectWS(encode(params.get("guild")))
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname)
		location.href = "./"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
