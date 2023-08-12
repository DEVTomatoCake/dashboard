const formatVote = site => {
	return "<li><a href='" + encode(site.url) + "' target='_blank' rel='noopener'>" + encode(site.name) + "</a>" +
		(site.status == 1 ? "<br><ion-icon name='thumbs-up-outline'></ion-icon>You can vote now!" : "") +
		(site.status == 2 ? "<br><ion-icon name='heart'></ion-icon>You've already voted - thank you!" : "") +
		(site.status == 3 ? "<br><small><ion-icon name='warning-outline'></ion-icon>This site doesn't allow me to display whether you've voted or not, however you still receive your credits!</small>" : "") +
		(site.next ? "<br> <ion-icon name='arrow-forward-outline'></ion-icon>Next vote in <b>" + encode(site.next) + "</b>" : "") +
		"</li>"
}

loadFunc = async () => {
	if (getCookie("token")) {
		const json = await getUser()

		if (json.status == "success") {
			document.getElementById("vote-tk").innerHTML = "<p>In total, you've voted <b>" + json.totalVotes + "</b> times for TomatenKuchen.<br>" +
				"Also, you currently have <b>" + json.credits + "</b> credits.</p>" +
				"<ul>" + json.votes.filter(site => site.status != 0 && !site.mb).map(formatVote).join("") + "</ul>"
			document.getElementById("vote-mb").innerHTML = "<ul>" + json.votes.filter(site => site.status != 0 && site.mb).map(formatVote).join("") + "</ul>"
		} else return handleError(resolve, json.message)

		document.getElementById("linksidebar").innerHTML =
			"<a href='/' title='Home' class='tab'>" +
				"<ion-icon name='home-outline'></ion-icon>" +
				"<p translation='sidebar.home'></p>" +
			"</a>" +
			"<a href='/commands' title='Bot commands' class='tab'>" +
				"<ion-icon name='terminal-outline'></ion-icon>" +
				"<p translation='sidebar.commands'></p>" +
			"</a>" +
			"<a href='/dashboard' class='tab'>" +
				"<ion-icon name='settings-outline'></ion-icon>" +
				"<p translation='sidebar.dashboard'></p>" +
			"</a>" +
			"<div class='section middle'><p class='title'>Your profile</p>" +
			//"<a class='tab otherlinks' href='./dashboard/custom'><ion-icon name='diamond-outline'></ion-icon><p>Custom branding</p></a>" +
			"<a class='tab otherlinks' href='./dashboard/dataexport'><ion-icon name='file-tray-stacked-outline'></ion-icon><p>Your user data</p></a>" +
			"</div>"

		reloadText()
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
