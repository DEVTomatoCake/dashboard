const types = ["INFO", "LOADING", "SUCCESS", "WARNING", "ERROR"]
let _toastNotifications = []
let autoscroll = true

const toastNotifications = {
    closeAll: function () {
        _toastNotifications.forEach(toastNotification => {
            toastNotification.close()
        })
    }
}

function createWrapper() {
    const wrapper = document.createElement("div")
    const closeAll = document.createElement("div")
    const container = document.createElement("div")

    wrapper.setAttribute("id", "toast-notification-wrapper")
    closeAll.setAttribute("class", "close-all")
    container.setAttribute("class", "toast-notification-container")

    closeAll.innerHTML = `
        <span>Close all notifications</span>
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="fill:currentColor;">
            <path d="M435.2,128l-358.4,0l0,332.8c0,28.087 23.113,51.2 51.2,51.2l256,0c28.087,0 51.2,-23.113 51.2,-51.2l0,-332.8Zm-230.4,307.2l-51.2,0l0,-230.4l51.2,0l0,230.4Zm153.6,0l-51.2,0l0,-230.4l51.2,0l0,230.4Zm15.821,-384l-41.421,-51.2l-153.6,0l-41.421,51.2l-112.179,0l0,51.2l460.8,0l0,-51.2l-112.179,0Z"/>
        </svg>
    `

    closeAll.addEventListener("click", () => {
        toastNotifications.closeAll()
    }, )
    container.addEventListener("scroll", () => {
        autoscroll = ((wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight) <= 40)
    }, )

    wrapper.append(closeAll, container)
    document.querySelector("body").prepend(wrapper)
    return container
}

class ToastNotification {
    #_intervalId

    #element

    #type
    #title
    #description
    #tag
    #timeout

    constructor(timeout) {
        this.#type = "INFO"
        this.#title = ""
        this.#description = ""
        this.#tag = ""
        this.#timeout = timeout || 20

        this.#element = document.createElement("div")
        this.#element.setAttribute("class", "toast-notification")
        this.#element.innerHTML = `
            <div class="type-image-wrapper" data-type="${this.#type}">
                <div class="type-image"></div>
            </div>
            <div class="content-wrapper">
                <header>
                    <div class="title-wrapper">
                        <span class="title">${this.#title}</span>
                        <span class="tag">${this.#tag}</span>
                    </div>
                    <div class="close">
                        <span class="timeout"></span>
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="fill:currentColor;">
                            <path d="M448.006,0l-192.029,192l-191.983,-192l-63.994,64l191.983,192l-191.983,192l63.994,64l191.983,-192l192.029,192l63.994,-64l-191.983,-192l191.983,-192l-63.994,-64Z"/>
                        </svg>
                    </div>
                </header>
                <div class="description">${this.#description}</div>
            </div>
        `
        this.#element.querySelector(".content-wrapper header .close svg").addEventListener("click", () => {
            this.close()
        })
    }

    setType(type) {
        if (this.#element.classList.contains("closed")) return
        this.#type = types.includes(type) ? type : "INFO"
        this.#element.querySelector(".type-image-wrapper").setAttribute("data-type", this.#type)
        return this
    }

    setTitle(title) {
        if (this.#element.classList.contains("closed")) return
        this.#title = title || ""
        this.#element.querySelector(".content-wrapper header .title-wrapper .title").innerText = this.#title
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
        this.#element.querySelector(".content-wrapper header .title-wrapper .tag").innerText = this.#tag
        return this
    }

    #setTimeout() {
        const e = this.#element.querySelector(".content-wrapper header .close .timeout")
        e.innerText = (this.#timeout === void 0) ? e.innerText : (this.#timeout + "s")
    }

    show() {
        let container = document.body.querySelector("#toast-notification-wrapper .toast-notification-container")
        if (container === null) container = createWrapper()
        else if (container.contains(this.#element)) return

        autoscroll = ((container.scrollHeight - container.scrollTop - container.clientHeight) <= 40)

        container.append(this.#element)
        _toastNotifications.push(this)

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
        if (container === null) return

        this.#element.classList.add("closed")

        setTimeout(() => {
            this.#element.remove()
            _toastNotifications.splice(_toastNotifications.indexOf(this), 1)
            if (container.childElementCount === 0) wrapper.remove()
        }, 500)
    }
}
