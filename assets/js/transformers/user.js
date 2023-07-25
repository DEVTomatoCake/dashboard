function getUserHTML() {
	return new Promise(resolve => {
		getUser()
			.then(json => {
				if (json.status == "success") {
					let text =
						"<h1 class='greeting'><span translation='logs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<ul>"

					json.data.forEach(site => {
						text +=
							"<li>" +
							"<a href='" + encode(site.url) + "'>" + encode(site.name) + "</a>" +
							(site.next ? " <ion-icon name='arrow-forward-outline'></ion-icon> Next vote in <b>" + encode(site.next) + "</b>" : "")
					})

					resolve(text + "</ul>")
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

loadFunc = () => {
	const params = new URLSearchParams(location.search)
	if (params.has("guild") && getCookie("token"))
		getLogsHTML(params.get("guild")).then(data => {
			document.getElementById("linksidebar").innerHTML +=
				"<div class='section middle'><p class='title' translation='dashboard.settings'></p>" +
				"<a class='tab otherlinks' href='./dashboard/custom'><ion-icon name='settings-outline'></ion-icon><p>Custom branding</p></a>" +
				"<a class='tab otherlinks' href='./dashboard/dataexport'><ion-icon name='terminal-outline'></ion-icon><p>Your user data</p></a>" +
				"</div>"

			document.getElementById("root-container").innerHTML = data
			reloadText()
		})
	else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login/?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
