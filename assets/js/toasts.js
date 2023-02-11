const types = ["INFO", "LOADING", "SUCCESS", "WARNING", "ERROR"]
let toastNotifications = {}
let autoscroll = true
var currentId = 0

function createWrapper() {
	const wrapper = document.createElement("div")
	const container = document.createElement("div")

	wrapper.setAttribute("id", "toast-notification-wrapper")
	container.setAttribute("class", "toast-notification-container")

	container.addEventListener("scroll", () => {
		autoscroll = (wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight) <= 40
	})

	wrapper.append(container)
	document.querySelector("body").prepend(wrapper)
	return container
}

function toastNotification({timeout = 10, type = "INFO", title = ""}) {
	let element = document.createElement("div")
	element.setAttribute("class", "toast-notification")
	element.innerHTML = `
		<div class="type-image-wrapper" data-type="${type}">
			<div class="type-image"></div>
		</div>
		<div class="content-wrapper">
			<header>
				<div class="title-wrapper">
					<span class="title">${title}</span>
				</div>
				<div class="close">
					<span class="timeout"></span>
					<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="fill:currentColor;">
						<path d="M448.006,0l-192.029,192l-191.983,-192l-63.994,64l191.983,192l-191.983,192l63.994,64l191.983,-192l192.029,192l63.994,-64l-191.983,-192l191.983,-192l-63.994,-64Z"/>
					</svg>
				</div>
			</header>
		</div>
	`
	let id = currentId++
	let intervalId

	element.querySelector(".content-wrapper header .close svg").addEventListener("click", () => {
		this.close()
	})

	this.setType = function setType(type) {
		if (element.classList.contains("closed")) return
		element.querySelector(".type-image-wrapper").setAttribute("data-type", types.includes(type) ? type : "INFO")
		return this
	}

	this.setTitle = function setTitle(title) {
		if (element.classList.contains("closed")) return
		title = title || ""
		element.querySelector(".content-wrapper header .title-wrapper .title").innerText = title
		return this
	}

	function createTimeout() {
		const e = element.querySelector(".content-wrapper header .close .timeout")
		e.innerText = (timeout == undefined) ? e.innerText : timeout + "s"
	}

	this.show = function show() {
		let container = document.body.querySelector("#toast-notification-wrapper .toast-notification-container")
		if (container == null) container = createWrapper()
		else if (container.contains(element)) return

		autoscroll = ((container.scrollHeight - container.scrollTop - container.clientHeight) <= 40)
		if (autoscroll) container.scrollTop = container.scrollHeight

		container.append(element)
		toastNotifications[id] = this.get()

		createTimeout()
		intervalId = setInterval(() => {
			toastNotifications[id].intervalId = intervalId
			timeout--
			createTimeout()

			if (timeout <= 0) this.close(id)
		}, 1000)
		return this
	}

	this.close = function close(closeId) {
		if (!closeId) closeId = id
		const current = toastNotifications[closeId]
		clearInterval(current.intervalId)

		const container = document.body.querySelector("#toast-notification-wrapper .toast-notification-container")
		if (container == null) return

		current.element.classList.add("closed")

		setTimeout(() => {
			current.element.remove()
			delete toastNotifications[closeId]
			if (container.childElementCount == 0) document.body.querySelector("#toast-notification-wrapper").remove()
		}, 500)
	}

	this.get = function get() {
		return {
			id,
			intervalId,
			type,
			title,
			timeout,
			element
		}
	}
	return this
}
