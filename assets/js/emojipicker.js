async function emojiPicker(parent = document.body) {
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

	var validActiveElement;
	document.addEventListener("click", e => {
		if (e.target.matches("input") || e.target.matches("textarea")) validActiveElement = e.target;
	});
	picker.addEventListener("emoji-click", e => {
		insertText(validActiveElement, e.detail.unicode || "<:" + e.detail.emoji.name + ":" + e.detail.emoji.url.replace(/[^0-9]/g, "") + ">");
	});

	picker.i18n = emojiPickerLang;
	picker.customEmoji = customEmojiGlobal.map(emoji => {
		return {
			name: emoji.name,
			shortCodes: [emoji.name, emoji.id],
			url: "https://cdn.discordapp.com/emojis/" + emoji.id + ".webp?size=64",
			category: guildName || "TomatenKuchen"
		};
	});
	parent.appendChild(picker);
}

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

// Modified and minified from https://cdn.jsdelivr.net/npm/insert-text-at-cursor@0.3.0/index.js
let browserTextNode;function canTextNode(input){if(input.nodeName!=="TEXTAREA"){return false}if(typeof browserTextNode==="undefined"){const textarea=document.createElement("textarea");textarea.value=1;browserTextNode=!!textarea.firstChild}return browserTextNode}function insertText(input,text){input.focus();if(document.selection){const ieRange=document.selection.createRange();ieRange.text=text;ieRange.collapse(false );ieRange.select();return}const isSuccess=document.execCommand("insertText",false,text);if(!isSuccess){const start=input.selectionStart;const end=input.selectionEnd;if(typeof input.setRangeText==="function"){input.setRangeText(text)}else{const range=document.createRange();const textNode=document.createTextNode(text);if(canTextNode(input)){let node=input.firstChild;if(!node){input.appendChild(textNode)}else{let offset=0;let startNode=null;let endNode=null;while(node&&(startNode===null||endNode===null)){const nodeLength=node.nodeValue.length;if(start>=offset&&start<=offset+nodeLength){range.setStart((startNode=node),start-offset)}if(end>=offset&&end<=offset+nodeLength){range.setEnd((endNode=node),end-offset)}offset+=nodeLength;node=node.nextSibling}if(start!==end){range.deleteContents()}}}if(canTextNode(input)&&range.commonAncestorContainer.nodeName==="#text"){range.insertNode(textNode)}else{const value=input.value;input.value=value.slice(0,start)+text+value.slice(end)}}input.setSelectionRange(start+text.length,start+text.length);const e=document.createEvent("UIEvent");e.initEvent("input",true,false);input.dispatchEvent(e)}};
