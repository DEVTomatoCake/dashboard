const handleImage = image =>
	"<div class='integration'>" +
	"<h3>" + encode(image.name) + "</h3>" +
	"<p><span translation='integration.lastupdate'></span> " + new Date(image.lastUpdate).toLocaleDateString() + "</p>" +
	"<div class='flex'>" +
		"<button type='button' onclick='imageEdit(\"" + encode(image.id) + "\")'><span translation='integration.edit'></span> <ion-icon name='build-outline'></ion-icon></button>" +
		"<button type='button' class='red' onclick='imageDelete(this, \"" + encode(image.id) + "\")'><ion-icon name='trash-outline'></ion-icon></button>" +
	"</div>" +
	"</div>"

const getImagesHTML = (json, guild) => {
	if (json.status == "success") {
		let text =
			"<div class='image-container'>" +
			json.images.filter(i => i.guild == guild).map(handleImage).join("") +
			"</div>"

		if (text == "<div class='image-container'></div>") text += "<br><p id='no-images'><b>There are no dynamic images on this server!</b></p>"
		return "<h1 class='center'><span>Dynamic images of</span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' onclick='createDialog()'>Create dynamic image</button><br>" + text + "</div>"
	}

	return (
		"<h1>An error occured while handling your request:</h1>" +
		"<h2>" + encode(json.message) + "</h2>"
	)
}

let dialog
let currentImage = {}
let currentLayer = {}
let ctx

const handleChange = elem => {
	if (!elem.id) return

	if (elem.id == "image-border-radius") {
		currentLayer.borderRadius = Number.parseInt(elem.value)
		document.getElementById("image-border-radius-text").innerText = "Border radius: " + elem.value + "%"
	} else if (elem.id == "layer-opacity") {
		const value = Math.round(elem.value * 100)
		currentLayer.opacity = value / 100
		document.getElementById("layer-opacity-text").innerText = "Opacity: " + value + "%"
	} else if (elem.id == "layer-text" || elem.id == "layer-image" || elem.id == "layer-form") currentLayer.content = elem.value
	else if (elem.id.split("-")[1] == "color") currentLayer[elem.id.split("-")[1]] = elem.value.replace("#", "").padStart(6, "0")
	else if (elem.id == "text-textAlign" || elem.id == "text-textBaseline") currentLayer[elem.id.split("-")[1]] = elem.value
	else if (elem.id.startsWith("text-")) currentLayer[elem.id.split("-")[1]] = elem.checked
	else if (elem.id == "layer-x" || elem.id == "layer-y" || elem.id.startsWith("layer-width") || elem.id.startsWith("layer-height") || elem.id.startsWith("layer-fontSize"))
		currentLayer[elem.id.split("-")[1]] = Number.parseInt(elem.value)
	else if (elem.id.startsWith("layer-")) currentLayer[elem.id.split("-")[1]] = elem.value
	else if (elem.id == "image-width" || elem.id == "image-height") {
		currentImage[elem.id.split("-")[1]] = Number.parseInt(elem.value)

		ctx.canvas.width = currentImage.width
		ctx.canvas.height = currentImage.height
		document.getElementById("image-preview").style[elem.id.split("-")[1]] = elem.value + "px"
	} else if (elem.id.startsWith("image-")) currentImage[elem.id.split("-")[1]] = elem.value
	else console.log("Unknown element: " + elem.id)

	currentImage.layers[currentImage.layers.indexOf(currentImage.layers.find(layer => layer.id == currentLayer.id))] = currentLayer
	if (elem.id == "layer-name") document.getElementById("layer-" + currentLayer.id).getElementsByTagName("p")[0].innerText = encode(elem.value)

	if (elem.id != "image-name") {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		renderImage(ctx, currentImage)
	}
}

const addLayer = () => {
	if (currentLayer.id && currentLayer.name.length > 32) return alert("The layer name can be at most 32 characters long!")

	currentLayer = {
		id: Math.random().toString(36).slice(2),
		type: "text",
		name: "Layer " + (currentImage.layers.length + 1),
		content: "",
		x: Math.floor(currentImage.width / 2),
		y: Math.floor(currentImage.height / 2),
		opacity: 1
	}
	currentImage.layers.push(currentLayer)

	document.getElementById("layer-text").value = ""
	document.getElementById("layer-color-text").value = "#000000"
	document.getElementById("layer-width-text").value = 800
	document.getElementById("layer-fontSize").value = 16
	document.getElementById("text-bold").checked = false
	document.getElementById("text-italic").checked = false
	document.getElementById("text-underline").checked = false
	document.getElementById("text-strikethrough").checked = false
	document.getElementById("text-textAlign").value = "start"
	document.getElementById("text-textBaseline").value = "alphabetic"

	document.getElementById("layer-image").value = ""
	document.getElementById("layer-width-image").value = 500
	document.getElementById("layer-height-image").value = 250
	document.getElementById("image-border-radius").value = 0
	document.getElementById("image-border-radius-text").innerText = "Border radius: 0%"

	document.getElementById("layer-form").value = ""
	document.getElementById("layer-width-form").value = 100
	document.getElementById("layer-height-form").value = 100
	document.getElementById("layer-color-form").value = "#000000"

	document.getElementById("layer-name").value = ""
	document.getElementById("layer-x").value = currentLayer.x
	document.getElementById("layer-y").value = currentLayer.y
	document.getElementById("layer-opacity").value = currentLayer.opacity
	document.getElementById("layer-opacity-text").innerText = "Opacity: " + Math.round(currentLayer.opacity * 100) + "%"

	for (const layer of document.getElementsByClassName("image-layer")) layer.classList.remove("active")
	document.getElementById("layer-container").innerHTML +=
		"<div class='image-layer active' id='layer-" + currentLayer.id + "' onclick='editLayer(\"" + currentLayer.id + "\")'>" +
		"<p>" + encode(currentLayer.name) + "</p>" +
		"</div>"
}

const editLayer = (id = "") => {
	for (const layer of document.getElementsByClassName("image-layer")) layer.classList.remove("active")
	document.getElementById("layer-" + id).classList.add("active")

	currentLayer = currentImage.layers.find(layer => layer.id == id)

	document.getElementById("layer-text").value = currentLayer.content
	document.getElementById("layer-color-text").value = currentLayer.color ? (currentLayer.color.length == 6 ? "#" + currentLayer.color : currentLayer.color) : "#000000"
	document.getElementById("layer-width-text").value = currentLayer.width || 800
	document.getElementById("layer-fontSize").value = currentLayer.fontSize || 16
	document.getElementById("text-bold").checked = currentLayer.bold || false
	document.getElementById("text-italic").checked = currentLayer.italic || false
	document.getElementById("text-underline").checked = currentLayer.underline || false
	document.getElementById("text-strikethrough").checked = currentLayer.strikethrough || false
	document.getElementById("text-textAlign").value = currentLayer.textAlign || "start"
	document.getElementById("text-textBaseline").value = currentLayer.textBaseline || "alphabetic"

	document.getElementById("layer-image").value = currentLayer.content
	document.getElementById("layer-width-image").value = currentLayer.width
	document.getElementById("layer-height-image").value = currentLayer.height
	document.getElementById("image-border-radius").value = currentLayer.borderRadius || 0
	document.getElementById("image-border-radius-text").innerText = "Border radius: " + (currentLayer.borderRadius || 0) + "%"

	document.getElementById("layer-form").value = currentLayer.content
	document.getElementById("layer-width-form").value = currentLayer.width || 100
	document.getElementById("layer-height-form").value = currentLayer.height || 100
	document.getElementById("layer-color-form").value = currentLayer.color ? (currentLayer.color.length == 6 ? "#" + currentLayer.color : currentLayer.color) : "#000000"

	document.getElementById("layer-name").value = currentLayer.name
	document.getElementById("layer-x").value = currentLayer.x
	document.getElementById("layer-y").value = currentLayer.y
	document.getElementById("layer-opacity").value = currentLayer.opacity
	document.getElementById("layer-opacity-text").innerText = "Opacity: " + Math.round(currentLayer.opacity * 100) + "%"
}

const createDialog = () => {
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
	dialog.removeAttribute("hidden")

	reloadText()
	for (const elem of document.querySelectorAll(".image-editor input, .image-editor select")) elem.oninput = () => handleChange(elem)
}

let images = []
const imageEdit = imageId => {
	currentImage = images.find(e => e.id == imageId)
	currentImage.edit = true

	document.getElementById("create-title").innerHTML = "Edit dynamic image: <b>" + encode(currentImage.name) + "</b>"
	document.getElementById("image-name").value = currentImage.name
	document.getElementById("image-width").value = currentImage.width
	document.getElementById("image-height").value = currentImage.height
	document.getElementById("image-submit").innerText = "Save dynamic image"

	document.getElementById("layer-container").innerHTML = currentImage.layers.map(layer => {
		layer.id = Math.random().toString(36).slice(2)
		return "" +
			"<div class='image-layer' id='layer-" + layer.id + "' onclick='editLayer(\"" + layer.id + "\")'>" +
			"<p>" + encode(layer.name) + "</p>" +
			"</div>"
	}).join("")

	currentLayer = currentImage.layers[0]
	editLayer(currentLayer.id)

	dialog.removeAttribute("hidden")

	reloadText()
	for (const elem of document.querySelectorAll(".image-editor input, .image-editor select")) elem.oninput = () => handleChange(elem)
	renderImage(ctx, currentImage)
}

const params = new URLSearchParams(location.search)
let socket
const imageDelete = (elem, imageId = "") => {
	if (confirm("Are you sure you want to delete the image \"" + images.find(img => img.id == imageId).name + "\"? This cannot be undone!")) {
		elem.parentElement.parentElement.remove()
		images = images.filter(img => img.id != imageId)
		socket.send({status: "success", action: "DELETE_image", id: imageId})
	}
}

let saving = false
let savingToast
let errorToast

const connectWS = guild => {
	socket = sockette("wss://tk-api.chaoshosting.eu", {
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
				images = json.images
			} else if (json.action == "SAVED_image") {
				saving = false
				savingToast.setType("SUCCESS").setTitle("The image was saved!")
			}
		}
	})
}

const changeTab = elem => {
	for (const tab of document.getElementsByClassName("dialog-tab")) {
		if (tab.getAttribute("data-radio") == elem.getAttribute("data-radio")) {
			tab.classList.remove("active")
			document.getElementById(tab.getAttribute("name")).setAttribute("hidden", "")
		}
	}

	elem.classList.add("active")
	document.getElementById(elem.getAttribute("name")).removeAttribute("hidden")

	currentLayer.type = elem.getAttribute("name")
	handleChange(elem)
}

const saveImage = () => {
	if (!params.has("guild") || saving) return

	const name = encode(document.getElementById("image-name").value)
	if (!name) return alert("Enter a name for the image!")
	if (name.length > 32) return alert("The name can be at most 32 characters long!")
	if (!currentImage.edit && images.some(image => image.name == name)) return alert("An image with this name already exists!")
	if (currentImage.layers.length == 0) return alert("You need to add at least one layer to the image!")

	saving = true
	document.getElementById("edit-dialog").setAttribute("hidden", "")
	if (document.getElementById("no-images")) document.getElementById("no-images").remove()

	if (currentImage.edit) images = images.filter(int => int.id != currentImage.id)
	else {
		const div = document.createElement("div")
		div.innerHTML = handleImage({
			id: currentImage.id,
			name,
			lastUpdate: Date.now()
		})
		document.getElementsByClassName("image-container")[0].appendChild(div)
		reloadText()
	}
	images.push(currentImage)

	socket.send({
		status: "success",
		action: "SAVE_image",
		data: currentImage
	})

	savingToast = new ToastNotification({type: "LOADING", title: "Saving image \"" + encode(name) + "\"...", timeout: 7}).show()
}

document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("image-preview")
	ctx = canvas.getContext("2d")
	ctx.canvas.width = 500
	ctx.canvas.height = 250

	dialog = document.getElementById("edit-dialog")

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
})
