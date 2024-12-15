// eslint-disable-next-line no-unused-vars
const toggleMsgEditor = (setting = "", msgId = "") => {
	const dialog = document.getElementById("msgeditor-dialog")
	dialog.removeAttribute("hidden")
	document.getElementById("msgeditor-save").onclick = () => {
		dialog.setAttribute("hidden", "")

		document.getElementById("msgeditor-iframe").contentWindow.postMessage("requestMessage", "https://tk-embed.chaoshosting.eu")
		window.onmessage = e => {
			if (e.origin == "https://tk-embed.chaoshosting.eu" && e.data.startsWith("respondMessage_")) {
				messageData[document.getElementById("msgeditor-iframe").dataset.current] = JSON.parse(decodeURIComponent(atob(e.data.replace("respondMessage_", ""))))
				document.getElementById("msgeditor-iframe").src = "about:blank"
				handleChange(setting)
			}
		}
	}
	document.getElementById("msgeditor-cancel").onclick = () => {
		dialog.setAttribute("hidden", "")
	}

	document.getElementById("msgeditor-iframe").src = "https://tk-embed.chaoshosting.eu/?data=" + btoa(encodeURIComponent(JSON.stringify(messageData[msgId]))) +
		(getCookie("theme") == "light" ? "&light=1" : "")
	document.getElementById("msgeditor-iframe").dataset.current = msgId
}
