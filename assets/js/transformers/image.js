function getImagesHTML(json, guild) {
	if (json.status == "success") {
		let text =
			"<div class='image-container'>" +
			json.images.filter(i => i.guild == guild).map(handleIntegration).join("") +
			"</div>"

		if (text == "<div class='image-container'></div>") text += "<p id='no-images'><b>There are no dynamic images on this server!</b></p>"
		return "<h1 class='center'><span>Dynamic images of</span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Bild erstellen</button>" + text + "</div>"
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>")
	}
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
	document.getElementById("actions-container").innerHTML = ""
	document.getElementById("integration-use-container").setAttribute("hidden", "")
	document.getElementById("integration-submit").setAttribute("translation", "integration.create")

	addLayer()
	openDialog(document.getElementById("create-dialog"))
	reloadText()
}

function addLayer(trigger = "command") {
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
let images = []
let pickerData = {}
function imageEdit(integrationName) {
	openDialog(document.getElementById("create-dialog"))
	const image = images.find(e => e.name == integrationName)

	document.getElementById("create-dialog").setAttribute("data-edit", "")
	document.getElementById("create-title").innerHTML = "<span translation='integration.edittitle'></span> <b>" + encode(integrationName) + "</b>"
	document.getElementById("integration-name").value = integrationName
	document.getElementById("integration-use-container").setAttribute("hidden", "")
	document.getElementById("integration-submit").setAttribute("translation", "integration.editsave")

	document.getElementById("actions-container").innerHTML = ""
	image.actions.forEach(action => {
		const newElem = addAction(action.trigger)
		newElem.querySelector(".action-name").value = action.name
	})
	reloadText()
}

let socket
function imageDelete(elem, imageId = "") {
	const confirmed = confirm("Are you sure you want to delete the image \"" + images.find(img => img.id == imageId).name + "\"? This cannot be undone!")
	if (confirmed) {
		elem.parentElement.parentElement.remove()
		images = images.filter(img => img.id != imageId)
		socket.send({status: "success", action: "DELETE_image", id: imageId})
	}
}

function handleIntegration(image) {
	return "<div class='integration'>" +
		"<h3>" + encode(image.name) + "</h3>" +
		"<p><span translation='integration.lastupdate'></span> " + new Date(image.lastUpdate).toLocaleDateString() + "</p>" +
		"<div class='flex'>" +
			"<button onclick='imageEdit(\"" + encode(image.id) + "\")'><span translation='integration.edit'></span> <ion-icon name='build-outline'></ion-icon></button>" +
			"<button class='red' onclick='imageDelete(this, \"" + encode(image.id) + "\")'><ion-icon name='trash-outline'></ion-icon></button>" +
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
				action: "GET_images",
				guild,
				lang: getLanguage(),
				token: getCookie("token")
			})
		},
		onMessage: json => {
			if (json.action == "NOTIFY") new ToastNotification(json).show()
			else if (json.action == "RECEIVE_images") {
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
					"<div class='section middle'><p class='title' translation='dashboard.settings'></p>" +
						"<a class='tab otherlinks' href='./settings?guild=" + guild + "'><ion-icon name='settings-outline'></ion-icon><p translation='dashboard.settings'>Settings</p></a>" +
						"<div class='tab otherlinks'><ion-icon name='terminal-outline'></ion-icon><p translation='dashboard.integrations'>Integrations</p></div>" +
						"<a class='tab otherlinks' href='./reactionroles?guild=" + guild + "'><ion-icon name='happy-outline'></ion-icon><p>Reactionroles</p></a>" +
						"<a class='tab otherlinks' href='../leaderboard?guild=" + guild + "'><ion-icon name='speedometer-outline'></ion-icon><p translation='dashboard.leaderboard'>Leaderboard</p></a>" +
						"<a class='tab otherlinks' href='../stats?guild=" + guild + "'><ion-icon name='bar-chart-outline'></ion-icon><p translation='dashboard.stats'>Statistics</p></a>" +
					"</div></div>"

				document.getElementById("root-container").innerHTML = getImagesHTML(json, guild)
				reloadText()
				guildName = json.name
				image = json.image

				pickerData = {
					...pickerData,
					"possible-types": {
						image: "Load image from URL",
						text: "Display text",
						form: "Display form"
					}
				}

				const item = ["possible-types", "text"]
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
			} else if (json.action == "SAVED_image") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("The image was saved!")
			}
		}
	})
}

function saveImage() {
	if (!params.has("guild") || saving) return
	saving = true

	const name = encode(document.getElementById("image-name").value)
	if (!name) return alert("Enter a name for the image!")
	if (!/^[a-z0-9_-]+$/g.test(name)) return alert("The name can only contain lowercase letters, numbers, underscores and dashes!")
	if (name.length > 32) return alert("The name can be at most 32 characters long!")

	document.getElementById("create-dialog").classList.add("hidden")
	if (document.getElementById("no-images")) document.getElementById("no-images").remove()

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
		actions: []
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
	images = images.filter(int => int.name != data.name)
	images.push(data)

	if (!data.edit) {
		const div = document.createElement("div")
		div.innerHTML = handleIntegration(data)
		document.getElementsByClassName("integration-container")[0].appendChild(div)
		reloadText()
	}

	socket.send({
		status: "success",
		action: "SAVE_image",
		data
	})

	savingToast = new ToastNotification({type: "LOADING", title: "Saving image \"" + encode(name) + "\"...", timeout: 7}).show()
}

loadFunc = () => {
	if (params.has("guild") && getCookie("token")) connectWS(encode(params.get("guild")))
	else if (params.has("guild_id") && getCookie("token")) location.href = "./?guild=" + params.get("guild_id")
	else if (getCookie("token")) {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to server selection...</h1>"
		localStorage.setItem("next", location.pathname + location.search)
		location.href = "../dashboard"
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
