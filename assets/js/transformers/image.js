function getImagesHTML(json, guild) {
	if (json.status == "success") {
		let text =
			"<div class='image-container'>" +
			json.images.filter(i => i.guild == guild).map(handleImage).join("") +
			"</div>"

		if (text == "<div class='image-container'></div>") text += "<br><p id='no-images'><b>There are no dynamic images on this server!</b></p>"
		return "<h1 class='center'><span>Dynamic images of</span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Create dynamic image</button>" + text + "</div>"
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>")
	}
}

let ctx
function handleChange(id) {
	if (id == "integration-sync") {
		const inputs = document.querySelectorAll(".action textarea, .action input")
		if (document.getElementById("integration-sync").getAttribute("data-selected") == "auto" || document.getElementById("integration-sync").getAttribute("data-selected") == "safe") {
			for (const elem of inputs) elem.setAttribute("readonly", "")
		} else {
			for (const elem of inputs) elem.removeAttribute("readonly")
		}
	}
}

function createDialog() {
	document.getElementById("image-name").value = ""
	document.getElementById("image-width").value = 500
	document.getElementById("image-height").value = 250
	document.getElementById("layer-container").innerHTML = ""
	document.getElementById("image-submit").innerText = "Create dynamic image"

	addLayer()
	openDialog(document.getElementById("edit-dialog"))
	reloadText()
}

let currentLayer = {}
function addLayer() {
	currentLayer = {}

	document.getElementById("layer-text").value = ""
	document.getElementById("layer-image").value = ""
	document.getElementById("layer-form").value = ""
	document.getElementById("image-border-radius").value = "0"
	document.getElementById("layer-opacity").value = "1"
}

let images = []
function imageEdit(imageId) {
	openDialog(document.getElementById("create-dialog"))
	const image = images.find(e => e.id == imageId)

	document.getElementById("create-title").innerHTML = "<span translation='integration.edittitle'></span> <b>" + encode(image.name) + "</b>"
	document.getElementById("image-name").value = image.name
	document.getElementById("image-width").value = image.width
	document.getElementById("image-height").value = image.height
	document.getElementById("image-submit").innerText = "Save dynamic image"

	document.getElementById("layer-container").innerHTML = ""
	image.layers.forEach(layer => {
		const newElem = addLayer()
		newElem.querySelector(".layer-name").value = layer.name
	})
	reloadText()
}

const params = new URLSearchParams(location.search)
let socket
function imageDelete(elem, imageId = "") {
	const confirmed = confirm("Are you sure you want to delete the image \"" + images.find(img => img.id == imageId).name + "\"? This cannot be undone!")
	if (confirmed) {
		elem.parentElement.parentElement.remove()
		images = images.filter(img => img.id != imageId)
		socket.send({status: "success", action: "DELETE_image", id: imageId})
	}
}

function handleImage(image) {
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
				image = json.image
			} else if (json.action == "SAVED_image") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("The image was saved!")
			}
		}
	})
}

function changeTab(elem) {
	for (const tab of document.getElementsByClassName("dialog-tab")) {
		if (tab.getAttribute("data-radio") == elem.getAttribute("data-radio")) {
			tab.classList.remove("active")
			document.getElementById(tab.getAttribute("name")).classList.add("hidden")
		}
	}

	elem.classList.add("active")
	document.getElementById(elem.getAttribute("name")).classList.remove("hidden")
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
		div.innerHTML = handleImage(data)
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
	const canvas = document.getElementById("image-preview")
	ctx = canvas.getContext("2d")

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
