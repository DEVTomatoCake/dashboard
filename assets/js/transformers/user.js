loadFunc = async () => {
	if (getCookie("token")) {
		const json = await getUser()

		if (json.status == "success") {
			let text =
				"<h1 class='greeting'><span translation='logs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
				"<ul>"

			json.data.filter(site => site.status != 0 && !site.mb).forEach(site => {
				text +=
					"<li>" +
					"<a href='" + encode(site.url) + "'>" + encode(site.name) + "</a>" +
					(site.status == 1 ? "You can vote now!" : "") +
					(site.status == 2 ? "You've already voted - thank you!" : "") +
					(site.status == 3 ? "<small>This site doesn't allow me to display whether you voted or not, however you still receive your credits!</small>" : "") +
					(site.next ? "<br><ion-icon name='arrow-forward-outline'></ion-icon> Next vote in <b>" + encode(site.next) + "</b>" : "")
			})
			document.getElementById("vote-tk").innerHTML = text

			let textmb = ""
			json.data.filter(site => site.status != 0 && site.mb).forEach(site => {
				textmb +=
					"<li>" +
					"<a href='" + encode(site.url) + "'>" + encode(site.name) + "</a>" +
					(site.status == 1 ? "You can vote now!" : "") +
					(site.status == 2 ? "You've already voted - thank you!" : "") +
					(site.status == 3 ? "<small>This site doesn't allow me to display whether you voted or not, however you still receive your credits!</small>" : "") +
					(site.next ? "<br><ion-icon name='arrow-forward-outline'></ion-icon> Next vote in <b>" + encode(site.next) + "</b>" : "")
			})
			document.getElementById("vote-mb").innerHTML = textmb
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
