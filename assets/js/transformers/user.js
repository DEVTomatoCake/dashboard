loadFunc = async () => {
	if (getCookie("token")) {
		const json = await getUser()

		if (json.status == "success") {
			let text = "<ul>"

			json.data.filter(site => site.status != 0 && !site.mb).forEach(site => {
				text +=
					"<li>" +
					"<a href='" + encode(site.url) + "'>" + encode(site.name) + "</a>" +
					(site.status == 1 ? "You can vote now!" : "") +
					(site.status == 2 ? "You've already voted - thank you!" : "") +
					(site.status == 3 ? "<small>This site doesn't allow me to display whether you voted or not, however you still receive your credits!</small>" : "") +
					(site.next ? "<br><ion-icon name='arrow-forward-outline'></ion-icon> Next vote in <b>" + encode(site.next) + "</b>" : "")
			})
			document.getElementById("vote-tk").innerHTML = text + "</ul>"

			let textmb = "<ul>"
			json.data.filter(site => site.status != 0 && site.mb).forEach(site => {
				textmb +=
					"<li>" +
					"<a href='" + encode(site.url) + "'>" + encode(site.name) + "</a>" +
					(site.status == 1 ? "<br><ion-icon name='thumbs-up-outline'></ion-icon>You can vote now!" : "") +
					(site.status == 2 ? "<br><ion-icon name='heart'></ion-icon>You've already voted - thank you!" : "") +
					(site.status == 3 ? "<br><ion-icon name='warning-outline'></ion-icon><small>This site doesn't allow me to display whether you've voted or not, however you still receive your credits!</small>" : "") +
					(site.next ? "<br><ion-icon name='arrow-forward-outline'></ion-icon> Next vote in <b>" + encode(site.next) + "</b>" : "")
			})
			document.getElementById("vote-mb").innerHTML = textmb + "</ul>"
		} else return handleError(resolve, json.message)

		document.getElementById("linksidebar").innerHTML +=
			"<div class='section middle'><p class='title'>Your profile</p>" +
			"<a class='tab otherlinks' href='./dashboard/custom'><ion-icon name='construct-outline'></ion-icon><p>Custom branding</p></a>" +
			"<a class='tab otherlinks' href='./dashboard/dataexport'><ion-icon name='file-tray-stacked-outline'></ion-icon><p>Your user data</p></a>" +
			"</div>"

		reloadText()
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
