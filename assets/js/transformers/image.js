function getImagesHTML(json, guild) {
	if (json.status == "success") {
		let text =
			"<div class='image-container'>" +
			json.images.filter(i => i.guild == guild).map(handleImage).join("") +
			"</div>"

		if (text == "<div class='image-container'></div>") text += "<br><p id='no-images'><b>There are no dynamic images on this server!</b></p>"
		return "<h1 class='center'><span>Dynamic images of</span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Create dynamic image</button>" + text + "</div>"
	}

	return (
		"<h1>An error occured while handling your request:</h1>" +
		"<h2>" + json.message + "</h2>"
	)
}

let dialog
let currentImage = {}
function createDialog() {
	document.getElementById("image-name").value = ""
	document.getElementById("image-width").value = 500
	document.getElementById("image-height").value = 250
	document.getElementById("layer-container").innerHTML = ""
	document.getElementById("image-submit").innerText = "Create dynamic image"

	currentImage = {
		id: Math.random().toString(36).slice(2),
		name: "New image",
		width: 500,
		height: 250,
		layers: []
	}

	addLayer()
	dialog.classList.remove("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => dialog.classList.add("hidden")

	reloadText()
	for (const elem of document.querySelectorAll(".image-container input, .image-container select")) elem.oninput = () => handleChange(elem)
}

let currentLayer = {}
let ctx
function handleChange(elem) {
	if (!elem.id) return

	if (elem.id == "image-border-radius") {
		currentLayer.borderRadius = parseInt(elem.value)
		document.getElementById("image-border-radius-text").innerText = "Border radius: " + elem.value + "%"
	} else if (elem.id == "layer-opacity") {
		const value = Math.round(elem.value * 100)
		currentLayer.opacity = value / 100
		document.getElementById("layer-opacity-text").innerText = "Opacity: " + value + "%"
	} else if (elem.id == "layer-text" || elem.id == "layer-image" || elem.id == "layer-form") currentLayer.content = elem.value
	else if (elem.id.split("-")[1] == "color") currentLayer[elem.id.split("-")[1]] = elem.value.replace("#", "").padStart(6, "0")
	else if (elem.id == "text-textAlign" || elem.id == "text-textBaseline") currentLayer[elem.id.split("-")[1]] = elem.value
	else if (elem.id.startsWith("text-")) currentLayer[elem.id.split("-")[1]] = elem.checked
	else if (elem.id == "layer-x" || elem.id == "layer-y" || elem.id == "layer-width" || elem.id == "layer-height") currentLayer[elem.id.split("-")[1]] = parseInt(elem.value)
	else if (elem.id.startsWith("layer-")) currentLayer[elem.id.split("-")[1]] = elem.value
	else if (elem.id == "image-width" || elem.id == "image-height") {
		currentImage[elem.id.split("-")[1]] = parseInt(elem.value)
		ctx.canvas[elem.id.split("-")[1]] = parseInt(elem.value)
		document.getElementById("image-preview").style[elem.id.split("-")[1]] = elem.value + "px"
	} else if (elem.id.startsWith("image-")) currentImage[elem.id.split("-")[1]] = elem.value
	else console.log("Unknown element: " + elem.id)

	currentImage.layers[currentImage.layers.indexOf(currentImage.layers.find(layer => layer.id == currentLayer.id))] = currentLayer

	if (elem.id == "layer-name") document.getElementById("layer-" + currentLayer.id).getElementsByTagName("p")[0].innerText = encode(elem.value)

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	renderImage(ctx, currentImage)
}

function editLayer(id = "") {
	for (const layer of document.getElementsByClassName("image-layer")) layer.classList.remove("active")
	document.getElementById("layer-" + id).classList.add("active")

	currentLayer = currentImage.layers.find(layer => layer.id == id)

	document.getElementById("layer-text").value = currentLayer.content
	document.getElementById("layer-color-text").value = currentLayer.color || "#000000"
	document.getElementById("text-bold").checked = currentLayer.bold || false
	document.getElementById("text-italic").checked = currentLayer.italic || false
	document.getElementById("text-underline").checked = currentLayer.underline || false
	document.getElementById("text-strikethrough").checked = currentLayer.strikethrough || false
	document.getElementById("text-textAlign").value = currentLayer.textAlign || "start"
	document.getElementById("text-textBaseline").value = currentLayer.textBaseline || "alphabetic"

	document.getElementById("layer-image").value = currentLayer.content
	document.getElementById("image-border-radius").value = currentLayer.borderRadius || 0
	document.getElementById("image-border-radius-text").innerText = "Border radius: " + (currentLayer.borderRadius || 0) + "%"

	document.getElementById("layer-form").value = currentLayer.content
	document.getElementById("layer-color-form").value = currentLayer.color || "#000000"

	document.getElementById("layer-name").value = currentLayer.name
	document.getElementById("layer-x").value = currentLayer.x
	document.getElementById("layer-y").value = currentLayer.y
	document.getElementById("layer-width").value = currentLayer.width
	document.getElementById("layer-height").value = currentLayer.height
	document.getElementById("layer-opacity").value = currentLayer.opacity
	document.getElementById("layer-opacity-text").innerText = "Opacity: " + currentLayer.opacity + "%"
}

let layerCount = 1
function addLayer() {
	if (currentLayer.id && currentLayer.name.length > 32) return alert("The layer name can be at most 32 characters long!")

	currentLayer = {
		id: Math.random().toString(36).slice(2),
		type: "text",
		name: "Layer " + layerCount++,
		content: "",
		x: Math.floor(currentImage.width / 2),
		y: Math.floor(currentImage.height / 2),
		width: 100,
		height: 100,
		opacity: 1
	}
	currentImage.layers.push(currentLayer)

	document.getElementById("layer-text").value = ""
	document.getElementById("layer-color-text").value = "#000000"
	document.getElementById("text-bold").checked = false
	document.getElementById("text-italic").checked = false
	document.getElementById("text-underline").checked = false
	document.getElementById("text-strikethrough").checked = false
	document.getElementById("text-textAlign").value = "start"
	document.getElementById("text-textBaseline").value = "alphabetic"

	document.getElementById("layer-image").value = ""
	document.getElementById("image-border-radius").value = 0
	document.getElementById("image-border-radius-text").innerText = "Border radius: 0%"

	document.getElementById("layer-form").value = ""
	document.getElementById("layer-color-form").value = "#000000"

	document.getElementById("layer-name").value = ""
	document.getElementById("layer-x").value = currentLayer.x
	document.getElementById("layer-y").value = currentLayer.y
	document.getElementById("layer-width").value = currentLayer.width
	document.getElementById("layer-height").value = currentLayer.height
	document.getElementById("layer-opacity").value = currentLayer.opacity
	document.getElementById("layer-opacity-text").innerText = "Opacity: " + currentLayer.opacity + "%"

	for (const layer of document.getElementsByClassName("image-layer")) layer.classList.remove("active")
	document.getElementById("layer-container").innerHTML +=
		"<div class='image-layer active' id='layer-" + currentLayer.id + "' onclick='editLayer(\"" + currentLayer.id + "\")'>" +
		"<p>" + encode(currentLayer.name) + "</p>" +
		"</div>"
}

let images = []
function imageEdit(imageId) {
	layerCount = 1
	currentImage = images.find(e => e.id == imageId)
	currentImage.edit = true

	document.getElementById("create-title").innerHTML = "Edit dynamic image: <b>" + encode(currentImage.name) + "</b>"
	document.getElementById("image-name").value = currentImage.name
	document.getElementById("image-width").value = currentImage.width
	document.getElementById("image-height").value = currentImage.height
	document.getElementById("image-submit").innerText = "Save dynamic image"

	document.getElementById("layer-container").innerHTML = ""
	currentImage.layers.forEach(layer => {
		const newElem = document.createElement("p")
		newElem.innerText = layer.name
		document.getElementById("layer-container").appendChild(newElem)
	})

	dialog.classList.remove("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => dialog.classList.add("hidden")

	reloadText()
	for (const elem of document.querySelectorAll(".image-container input, .image-container select")) elem.oninput = () => handleChange(elem)
}

const params = new URLSearchParams(location.search)
let socket
const imageDelete = (elem, imageId = "") => {
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
				document.getElementsByTagName("global-sidebar")[0].setAttribute("guild", guild)
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

	currentLayer.type = elem.getAttribute("name")
	handleChange(elem)
}

function saveImage() {
	if (!params.has("guild") || saving) return
	saving = true

	const name = encode(document.getElementById("image-name").value)
	if (!name) return alert("Enter a name for the image!")
	if (name.length > 32) return alert("The name can be at most 32 characters long!")

	document.getElementById("edit-dialog").classList.add("hidden")
	if (document.getElementById("no-images")) document.getElementById("no-images").remove()

	if (currentImage.edit) images = images.filter(int => int.name != currentImage.name)
	else {
		const div = document.createElement("div")
		div.innerHTML = handleImage(currentImage)
		document.getElementsByClassName("image-container")[0].appendChild(div)
		reloadText()
	}
	images.push(currentImage)

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
	dialog = document.getElementById("edit-dialog")

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
