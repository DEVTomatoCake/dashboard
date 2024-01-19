const toggleMsgEditor = settingsKey => {
	openDialog(document.getElementById("msgeditor-dialog"))

	const setting = settingsData[settingsKey]
	console.log(setting)
	document.getElementById("msgeditor-iframe").src = "https://embed.tomatenkuchen.com/?data=" + btoa(JSON.stringify({content: "yay!"}))
}
