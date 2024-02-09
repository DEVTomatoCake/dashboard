// Made by Mqx#8315 on "Deutsches Mapmaking" Discord
// Modified by TomatoCake

const types = new Set(["INFO", "LOADING", "SUCCESS", "WARNING", "ERROR"])
let autoscroll = true

const createWrapper = () => {
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

class ToastNotification {
	#_intervalId
	#element

	#timeout
	#type
	#title
	#description
	#tag

	constructor({timeout = 20, type = "INFO", title = "", description = "", tag = ""}) {
		this.#timeout = timeout
		this.#type = type
		this.#title = title
		this.#description = description
		this.#tag = tag

		this.#element = document.createElement("div")
		this.#element.setAttribute("class", "toast-notification")
		this.#element.innerHTML =
			"<div class='type-image-wrapper' data-type='" + this.#type + "'>" +
				"<div class='type-image'></div>" +
			"</div>" +
			"<div class='content-wrapper'>" +
				"<header>" +
					"<div>" +
						"<span class='title'>" + this.#title + "</span>" +
						"<span class='tag'>" + this.#tag + "</span>" +
					"</div>" +
					"<div class='close'>" +
						"<span class='timeout'></span>" +
						"<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>" +
							"<path d='M448.006,0l-192.029,192l-191.983,-192l-63.994,64l191.983,192l-191.983,192l63.994,64l191.983,-192l192.029,192l63.994,-64l-191.983,-192l191.983,-192l-63.994,-64Z'>" +
						"</svg>" +
					"</div>" +
				"</header>" +
				"<div class='description'>" + this.#description + "</div>" +
			"</div>"

		this.#element.querySelector(".content-wrapper header .close").addEventListener("click", () => {
			this.close()
		})
	}

	setType(type) {
		if (this.#element.classList.contains("closed")) return
		this.#type = types.has(type) ? type : "INFO"
		this.#element.querySelector(".type-image-wrapper").setAttribute("data-type", this.#type)
		return this
	}

	setTitle(title) {
		if (this.#element.classList.contains("closed")) return
		this.#title = title || ""
		this.#element.querySelector(".content-wrapper header .title").textContent = this.#title
		return this
	}

	setDescription(description) {
		if (this.#element.classList.contains("closed")) return
		this.#description = description || ""
		this.#element.querySelector(".content-wrapper .description").innerHTML = this.#description
		return this
	}

	setTag(tag) {
		if (this.#element.classList.contains("closed")) return
		this.#tag = tag || ""
		this.#element.querySelector(".content-wrapper header .tag").textContent = this.#tag
		return this
	}

	#setTimeout() {
		const e = this.#element.querySelector(".content-wrapper header .close .timeout")
		e.textContent = this.#timeout === void 0 ? e.textContent : (this.#timeout + "s")
	}

	show() {
		let container = document.body.querySelector("#toast-notification-wrapper .toast-notification-container")
		if (container === null) container = createWrapper()
		else if (container.contains(this.#element)) return

		autoscroll = ((container.scrollHeight - container.scrollTop - container.clientHeight) <= 40)

		container.append(this.#element)

		if (autoscroll) container.scrollTop = container.scrollHeight

		this.#setTimeout()
		this.#_intervalId = setInterval(() => {
			this.#timeout -= 1

			this.#setTimeout()

			if (this.#timeout <= 0) {
				clearInterval(this.#_intervalId)
				this.close()
			}
		}, 1000)
		return this
	}

	close() {
		clearInterval(this.#_intervalId)

		const wrapper = document.body.querySelector("#toast-notification-wrapper")
		const container = document.body.querySelector("#toast-notification-wrapper .toast-notification-container")
		if (!container) return

		this.#element.classList.add("closed")

		setTimeout(() => {
			this.#element.remove()
			if (container.childElementCount == 0) wrapper.remove()
		}, 500)
	}
}
