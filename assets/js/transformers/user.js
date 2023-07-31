const formatVote = site => {
	return "<a href='" + encode(site.url) + "' target='_blank' rel='noopener'>" + encode(site.name) + "</a>" +
		(site.status == 1 ? "<br><ion-icon name='thumbs-up-outline'></ion-icon>You can vote now!" : "") +
		(site.status == 2 ? "<br><ion-icon name='heart'></ion-icon>You've already voted - thank you!" : "") +
		(site.status == 3 ? "<br><small><ion-icon name='warning-outline'></ion-icon>This site doesn't allow me to display whether you've voted or not, however you still receive your credits!</small>" : "") +
		(site.next ? "<br> <ion-icon name='arrow-forward-outline'></ion-icon>Next vote in <b>" + encode(site.next) + "</b>" : "")
}

loadFunc = async () => {
	if (getCookie("token")) {
		const json = await getUser()

		if (json.status == "success") {
			document.getElementById("vote-tk").innerHTML = "<ul><li>" + json.data.filter(site => site.status != 0 && !site.mb).map(formatVote).join("</li><li>") + "</li></ul>"
			document.getElementById("vote-mb").innerHTML = "<ul><li>" + json.data.filter(site => site.status != 0 && site.mb).map(formatVote).join("</li><li>") + "</li></ul>"
		} else return handleError(resolve, json.message)

		document.getElementById("linksidebar").innerHTML +=
			"<div class='section middle'><p class='title'>Your profile</p>" +
			"<a class='tab otherlinks' href='./dashboard/custom'><ion-icon name='diamond-outline'></ion-icon><p>Custom branding</p></a>" +
			"<a class='tab otherlinks' href='./dashboard/dataexport'><ion-icon name='file-tray-stacked-outline'></ion-icon><p>Your user data</p></a>" +
			"</div>"

		reloadText()
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
