const toggleMsgEditor = msgId => {
	const dialog = document.getElementById("msgeditor-dialog")
	dialog.removeAttribute("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => {
		dialog.setAttribute("hidden", "")

		document.getElementById("msgeditor-iframe").contentWindow.postMessage("requestMessage", "*")
		window.onmessage = e => {
			if (e.data.startsWith("respondMessage_")) {
				messageData[msgId] = JSON.parse(decodeURIComponent(atob(e.data.replace("respondMessage_", ""))))
				document.getElementById("msgeditor-iframe").src = "about:blank"
			}
		}
	}

	document.getElementById("msgeditor-iframe").src = "https://embed.tomatenkuchen.com/?data=" + btoa(encodeURIComponent(JSON.stringify(messageData[msgId])))
	document.getElementById("msgeditor-iframe").dataset.current = msgId
}
