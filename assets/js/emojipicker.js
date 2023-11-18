async function emojiPicker(parent = document.body, customEmoji = [], guildName = "Serveremojis", onlyNameReplace = false) {
	const pickerExisting = parent.querySelector("emoji-picker")
	if (pickerExisting) return pickerExisting.remove()

	const picker = document.createElement("emoji-picker")
	if (getCookie("theme") == "light") picker.classList.add("light")
	else picker.classList.add("dark")

	const style = document.createElement("style")
	style.textContent = `
		.picker {
			border-radius: 10px;
		}
		.emoji, button.emoji {
			border-radius: 4px;
		}
		input.search {
			outline: none;
			background-color: var(--input-border-color);
		}
		#skintone-button {
			font-size: 24px;
		}
	`
	picker.shadowRoot.appendChild(style)

	picker.addEventListener("emoji-click", e => {
		if (onlyNameReplace) picker.parentElement.querySelector("textarea,input").value = e.detail.unicode || e.detail.emoji.name
		else insertText(picker.parentElement.querySelector("textarea,input"), e.detail.unicode || "<" + (e.detail.emoji.url.includes(".gif") ? "a" : "") + ":" + e.detail.emoji.name + ":" + e.detail.emoji.url.match(/[0-9]{17,20}/)[0] + ">")
		handleChange(picker.parentElement.querySelector("textarea,input").id)
	})

	picker.customEmoji = customEmoji.map(emoji => ({
		name: emoji.name,
		shortCodes: [emoji.name, emoji.id],
		url: "https://cdn.discordapp.com/emojis/" + emoji.id + "." + (emoji.a ? "gif" : "webp") + "?size=64",
		category: guildName
	}))
	parent.appendChild(picker)
}

const insertMention = (elem, id) => insertText(elem.parentElement.parentElement.querySelector("textarea,input"), "<@&" + id + ">")
async function mentionPicker(parent = document.body, roles = []) {
	const pickerExisting = parent.querySelector(".custom-picker")
	if (pickerExisting) return pickerExisting.remove()

	const picker = document.createElement("div")
	picker.classList.add("custom-picker")
	if (getCookie("theme") == "light") picker.classList.add("light")

	picker.innerHTML = roles.map(mention => (
		"<span class='element'" + (mention.color ? " style='background-color:#" + mention.color.toString(16).padStart(6, "0") + ";'" : "") +
		" onclick='insertMention(this, \"" + mention.id + "\")'>@" + mention.name + "</span>"
	)).join("")
	parent.appendChild(picker)
}

const togglePicker = elem => elem.parentElement.querySelector(".picker").classList.toggle("open")
const updateSelected = (elem, value = "") => {
	if (elem.parentElement.parentElement.classList.contains("disabled")) return console.warn("Not modifying disabled " + elem.parentElement.parentElement.getAttribute("name"))

	elem.parentElement.parentElement.setAttribute("data-selected", value)
	elem.parentElement.querySelectorAll(".element").forEach(e => {
		e.classList.remove("selected")
	})
	elem.parentElement.parentElement.querySelector(".list").innerHTML = ""
	elem.parentElement.querySelectorAll(".element").forEach(e => {
		if (e.getAttribute("data-id") == value) {
			e.classList.add("selected")
			elem.parentElement.parentElement.querySelector(".list").innerHTML += "<div>" + e.innerHTML + "</div>"
		}
	})
	handleChange(elem.parentElement.parentElement.id)
}
const updateMultiSelected = (elem, key, value) => {
	if (elem.parentElement.parentElement.classList.contains("disabled")) return console.warn("Not modifying disabled " + elem.parentElement.parentElement.getAttribute("name"))

	elem.classList.toggle("selected")
	if (elem.classList.contains("selected")) selectData[key].value.push(value)
	else selectData[key].value.splice(selectData[key].value.indexOf(value), 1)

	if (selectData[key].value.length == 0) elem.parentElement.parentElement.querySelector(".list").innerHTML = "<div class='element'><ion-icon name='build-outline'></ion-icon></div>"
	else {
		elem.parentElement.parentElement.querySelector(".list").innerHTML = ""
		selectData[key].value.forEach(v => {
			elem.parentElement.parentElement.querySelector(".list").innerHTML += "<div>" + elem.parentElement.querySelector("div[data-id='" + v + "']").innerHTML + "</div>"
		})
	}
	handleChange(elem.parentElement.parentElement.id)
}

class ChannelRolePicker extends HTMLElement {
	constructor() {
		super()
	}
	connectedCallback() {
		let toSelect = pickerData[this.getAttribute("type")]
		if (this.getAttribute("data-multi") == 1 && this.getAttribute("type") != "role" && !this.hasAttribute("data-form")) {
			toSelect = {
				alltext: {
					name: "All text channels",
					type: "text"
				},
				allvoice: {
					name: "All voice channels",
					type: "voice"
				},
				allannouncement: {
					name: "All announcement channels",
					type: "text"
				},
				allcategory: {
					name: "All categories",
					type: "category"
				},
				allthread: {
					name: "All threads",
					type: "text"
				},
				...toSelect
			}
		}
		this.innerHTML =
			"<div class='list' onclick='togglePicker(this)'></div>" +
			"<div class='picker'>" +
			Object.keys(toSelect).map(channel => {
				if (this.getAttribute("data-multi") == 1 && channel == "") return ""
				const current = toSelect[channel]
				const func = this.getAttribute("data-multi") == 1 ? "updateMultiSelected(this, this.parentElement.parentElement.id, \"" + channel + "\")" : "updateSelected(this, \"" + channel + "\")"
				return "<div data-id='" + channel + "' onkeyup='if(event.key==\"Enter\")" + func + "' " +
					"onclick='" + func + "' class='element" +
					(current.parent ? " child" : "") + "' tabindex='0'>" +
					(current.type == "text" ? "<img src='/assets/images/channel.webp' width='25' height='25' alt=''>" : "") +
					(current.type == "voice" ? "<img src='/assets/images/voice.webp' width='25' height='25' alt=''>" : "") +
					(current.type == "category" ? "<img src='/assets/images/category.webp' width='25' height='25' alt=''>" : "") +
					(current.type == "role" ? "<img class='pic-role' src='/assets/images/mention.webp' width='25' height='25' alt=''>" : "") +
					"<span>" +
					(channel ? (this.getAttribute("data-unsafe") ? current.name || current : encode(current.name || current)) : "No " + (this.getAttribute("type") == "role" ? "role" : "channel")) +
					"</span></div>"
			}).join("") +
			"</div>"
	}
}
customElements.define("channel-picker", ChannelRolePicker)

// Modified and minified from https://cdn.jsdelivr.net/npm/insert-text-at-cursor@0.3.0/index.js
/* eslint-disable */
let browserTextNode;function canTextNode(e){if("TEXTAREA"!==e.nodeName)return!1;if(void 0===browserTextNode){const e=document.createElement("textarea");e.value=1,browserTextNode=!!e.firstChild}return browserTextNode}function insertText(e,t){if(e.focus(),document.selection){const e=document.selection.createRange();return e.text=t,e.collapse(!1),void e.select()}if(!document.execCommand("insertText",!1,t)){const n=e.selectionStart,o=e.selectionEnd;if("function"==typeof e.setRangeText)e.setRangeText(t);else{const c=document.createRange(),l=document.createTextNode(t);if(canTextNode(e)){let t=e.firstChild;if(t){let e=0,l=null,s=null;for(;t&&(null===l||null===s);){const i=t.nodeValue.length;n>=e&&n<=e+i&&c.setStart(l=t,n-e),o>=e&&o<=e+i&&c.setEnd(s=t,o-e),e+=i,t=t.nextSibling}n!==o&&c.deleteContents()}else e.appendChild(l)}if(canTextNode(e)&&"#text"===c.commonAncestorContainer.nodeName)c.insertNode(l);else{const c=e.value;e.value=c.slice(0,n)+t+c.slice(o)}}e.setSelectionRange(n+t.length,n+t.length);const c=document.createEvent("UIEvent");c.initEvent("input",!0,!1),e.dispatchEvent(c)}}
