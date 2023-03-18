// Varun Dewan 2019
// https://github.com/varundewan/multiselect/blob/master/js/index.js
const $ = {
	get(selector) {
		const ele = document.querySelectorAll(selector)
		for (let i = 0; i < ele.length; i++) {
			this.init(ele[i])
		}
		return ele
	},
	template(html) {
		const template = document.createElement("div")
		template.innerHTML = html.trim()
		return this.init(template.childNodes[0])
	},
	init(ele) {
		ele.on = function(event, func) {
			this.addEventListener(event, func)
		}
		return ele
	}
}

const Drop = function(info) {
	const o = {
		options: info.options,
		selected: info.selected || [],
		preselected: info.preselected || [],
		open: false,
		html: {
			select: $.get(info.selector)[0],
			options: $.get(info.selector + " option"),
			parent: void 0
		},
		init() {
			this.html.parent = $.get(info.selector)[0].parentNode
			this.html.drop = $.template("<div class='drop'></div>")
			this.html.dropDisplay = $.template("<div class='drop-display'>Display</div>")
			this.html.dropOptions = $.template("<div class='drop-options'>Options</div>")
			this.html.dropScreen = $.template("<div class='drop-screen'></div>")

			this.html.parent.insertBefore(this.html.drop, this.html.select)
			this.html.drop.appendChild(this.html.dropDisplay)
			this.html.drop.appendChild(this.html.dropOptions)
			this.html.drop.appendChild(this.html.dropScreen)
			//Hide old select
			this.html.drop.appendChild(this.html.select)

			const that = this
			this.html.dropDisplay.on("click", () => {
				that.toggle()
			})
			this.html.dropScreen.on("click", () => {
				that.toggle()
			})

			this.load()
			this.preselect()
			this.render()
		},
		toggle() {
			this.html.drop.classList.toggle("open")
		},
		addOption(element) {
			const index = Number(element.dataset.index)
			this.clearStates()
			this.selected.push({
				index: Number(index),
				state: "add",
				removed: false
			})
			this.options[index].state = "remove"
			this.render()
		},
		removeOption(e, element) {
			e.stopPropagation()
			this.clearStates()
			const index = Number(element.dataset.index)
			this.selected.forEach(select => {
				if (select.index == index && !select.removed) {
					select.removed = true
					select.state = "remove"
				}
			})
			this.options[index].state = "add"
			this.render()
		},
		load() {
			this.options = []
			for (let i = 0; i < this.html.options.length; i++) {
				const option = this.html.options[i]

				let prefix = ""
				if (option.dataset.type == "text") prefix = "<img src='https://cdn.discordapp.com/emojis/1013330953038475355.webp?size=32' width='25' height='25' alt=''>"
				else if (option.dataset.type == "voice") prefix = "<img src='https://cdn.discordapp.com/emojis/1013333740187033671.webp?size=32' width='25' height='25' alt=''>"
				else if (option.dataset.type == "category") prefix = "<img src='https://cdn.discordapp.com/emojis/1013339254593687592.webp?size=32' width='25' height='25' alt=''>"
				else if (option.dataset.type == "role") prefix = "<img style='padding-right: 2px;' src='https://cdn.discordapp.com/emojis/1013338522830250014.webp?size=32' width='25' height='25' alt=''>"

				this.options[i] = {
					html: prefix + option.innerText + (option.dataset.type == "role" && option.dataset.color ? "</span>" : ""),
					value: option.value,
					selected: option.selected,
					state: ""
				}
			}
		},
		preselect() {
			const that = this
			this.selected = []
			this.preselected.forEach(pre => {
				that.selected.push({
					index: pre,
					state: "add",
					removed: false
				})
				if (that.options[pre]) that.options[pre].state = "remove"
			})
		},
		render() {
			this.renderDrop()
			this.renderOptions()
		},
		renderDrop() {
			const that = this
			const parentHTML = $.template("<div></div>")
			this.selected.forEach(select => {
				const option = that.options[select.index]
				const childHTML = $.template("<span class='item " + select.state + "'>" + option.html + "</span>")
				const childCloseHTML = $.template("<ion-icon style='margin-top: 5px; font-size: 20px;' name='close-circle-outline' data-index='" + select.index + "'></ion-icon></span>")
				childCloseHTML.on("click", function(e) {
					that.removeOption(e, this)
				})
				childHTML.appendChild(childCloseHTML)
				parentHTML.appendChild(childHTML)
			})
			this.html.dropDisplay.innerHTML = ""
			this.html.dropDisplay.appendChild(parentHTML)
		},
		renderOptions() {
			const that = this
			const parentHTML = $.template("<div></div>")
			this.options.forEach((option, index) => {
				const childHTML = $.template("<a data-index='" + index + "' class='" + option.state + "'>" + option.html + "</a>")
				childHTML.on("click", function() {
					that.addOption(this)
				})
				parentHTML.appendChild(childHTML)
			})
			this.html.dropOptions.innerHTML = ""
			this.html.dropOptions.appendChild(parentHTML)
		},
		clearStates() {
			const that = this
			this.selected.forEach(select => {
				select.state = that.changeState(select.state)
			})
			this.options.forEach(option => {
				option.state = that.changeState(option.state)
			})
		},
		changeState(state) {
			switch (state) {
				case "remove":
				case "hide":
					return "hide"
				default:
					return ""
			}
		}
	}
	o.init()
	return o
}
