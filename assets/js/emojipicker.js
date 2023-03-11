const emojiPickerLang = {
	categoriesLabel: "Kategorien",
	emojiUnsupportedMessage: "Dein Browser unterstützt keine farbigen Emojis.",
	favoritesLabel: "Favoriten",
	loadingMessage: "Wird geladen…",
	networkErrorMessage: "Konnte Emoji nicht laden.",
	regionLabel: "Emoji auswählen",
	searchDescription: "Wenn Suchergebnisse verfügbar sind, wähle sie mit Pfeil rauf und runter, dann Eingabetaste, aus.",
	searchLabel: "Suchen",
	searchResultsLabel: "Suchergebnisse",
	skinToneDescription: "Wenn angezeigt, nutze Pfeiltasten rauf und runter zum Auswählen, Eingabe zum Akzeptieren.",
	skinToneLabel: "Wähle einen Hautton (aktuell {skinTone})",
	skinTonesLabel: "Hauttöne",
	skinTones: [
		"Standard",
		"Hell",
		"Mittel-hell",
		"Mittel",
		"Mittel-dunkel",
		"Dunkel"
	],
	categories: {
		custom: "Benutzerdefiniert",
		"smileys-emotion": "Smileys und Emoticons",
		"people-body": "Menschen und Körper",
		"animals-nature": "Tiere und Natur",
		"food-drink": "Essen und Trinken",
		"travel-places": "Reisen und Orte",
		activities: "Aktivitäten",
		objects: "Objekte",
		symbols: "Symbole",
		flags: "Flaggen"
	}
}

async function emojiPicker(parent = document.body, customEmoji = [], guildName = "Serveremojis") {
	const pickerExisting = parent.querySelector("emoji-picker");
	if (pickerExisting) return pickerExisting.remove();

	const picker = document.createElement("emoji-picker");
	if (getCookie("theme") == "light") picker.classList.add("light");
	else picker.classList.add("dark");

	const style = document.createElement("style");
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
	`;
	picker.shadowRoot.appendChild(style);

	picker.addEventListener("emoji-click", e => {
		insertText(picker.parentElement.querySelector("textarea,input"), e.detail.unicode || "<" + (e.detail.emoji.url.includes(".gif") ? "a" : "") + ":" + e.detail.emoji.name + ":" + e.detail.emoji.url.match(/[0-9]{17,20}/)[0] + ">");
	});

	picker.i18n = emojiPickerLang;
	picker.customEmoji = customEmoji.map(emoji => {
		return {
			name: emoji.name,
			shortCodes: [emoji.name, emoji.id],
			url: "https://cdn.discordapp.com/emojis/" + emoji.id + "." + (emoji.a ? "gif" : "webp") + "?size=64",
			category: guildName
		};
	});
	parent.appendChild(picker);
}

function insertMention(elem, id) {
	insertText(elem.parentElement.parentElement.querySelector("textarea,input"), "<@" + id + ">");
}
async function mentionPicker(parent = document.body, roles = []) {
	const pickerExisting = parent.querySelector(".custom-picker");
	if (pickerExisting) return pickerExisting.remove();

	const picker = document.createElement("div");
	picker.classList.add("custom-picker");
	if (getCookie("theme") == "light") picker.classList.add("light");

	picker.innerHTML = roles.map(mention => (
		"<span class='element'" + (mention.color ? " style='color:#" + mention.color.toString(16) + ";'" : "") +
		" onclick='insertMention(this, \"" + mention.id + "\")'>@" + mention.name + "</span>"
	)).join("");
	parent.appendChild(picker);
}

// Modified and minified from https://cdn.jsdelivr.net/npm/insert-text-at-cursor@0.3.0/index.js
/* eslint-disable */
let browserTextNode;function canTextNode(e){if("TEXTAREA"!==e.nodeName)return!1;if(void 0===browserTextNode){const e=document.createElement("textarea");e.value=1,browserTextNode=!!e.firstChild}return browserTextNode}function insertText(e,t){if(e.focus(),document.selection){const e=document.selection.createRange();return e.text=t,e.collapse(!1),void e.select()}if(!document.execCommand("insertText",!1,t)){const n=e.selectionStart,o=e.selectionEnd;if("function"==typeof e.setRangeText)e.setRangeText(t);else{const c=document.createRange(),l=document.createTextNode(t);if(canTextNode(e)){let t=e.firstChild;if(t){let e=0,l=null,s=null;for(;t&&(null===l||null===s);){const i=t.nodeValue.length;n>=e&&n<=e+i&&c.setStart(l=t,n-e),o>=e&&o<=e+i&&c.setEnd(s=t,o-e),e+=i,t=t.nextSibling}n!==o&&c.deleteContents()}else e.appendChild(l)}if(canTextNode(e)&&"#text"===c.commonAncestorContainer.nodeName)c.insertNode(l);else{const c=e.value;e.value=c.slice(0,n)+t+c.slice(o)}}e.setSelectionRange(n+t.length,n+t.length);const c=document.createEvent("UIEvent");c.initEvent("input",!0,!1),e.dispatchEvent(c)}}
