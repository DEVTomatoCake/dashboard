const toggleMsgEditor = settingsKey => {
	const dialog = document.getElementById("msgeditor-dialog")
	dialog.removeAttribute("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => {
		dialog.setAttribute("hidden", "")
		document.getElementById("msgeditor-iframe").src = "about:blank"
	}

	const msg = settingsData.find(set => set.key == settingsKey).value[0]
	document.getElementById("msgeditor-iframe").src = "https://embed.tomatenkuchen.com/?data=" + btoa(encodeURIComponent(JSON.stringify({
		content: msg.content || void 0,
		embeds: [{
			color: msg.color || void 0,
			title: msg.title || void 0,
			description: msg.description || void 0,
			image: msg.image || void 0,
			thumbnail: msg.thumbnail || void 0,
			author: {
				name: msg.author || void 0,
				icon_url: msg.authoricon || void 0
			},
			footer: {
				text: msg.footer || void 0,
				icon_url: msg.footericon || void 0
			}
		}]
	})))
}
