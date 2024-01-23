const toggleMsgEditor = settingsKey => {
	const dialog = document.getElementById("msgeditor-dialog")
	dialog.removeAttribute("hidden")
	dialog.getElementsByClassName("close")[0].onclick = () => {
		dialog.setAttribute("hidden", "")
		document.getElementById("msgeditor-iframe").src = "about:blank"
	}

	const msg = settingsData.find(set => set.key == settingsKey.split("_")[0]).value[0]
	document.getElementById("msgeditor-iframe").src = "https://embed.tomatenkuchen.com/?data=" + btoa(encodeURIComponent(JSON.stringify(msg.message)))
}
