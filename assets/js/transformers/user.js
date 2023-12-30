const formatVote = site => {
	return "<li><a href='" + encode(site.url) + "' target='_blank' rel='noopener'>" + encode(site.name) + "</a>" +
		(site.status == 1 ? "<br><span class='vmiddle'><ion-icon name='thumbs-up-outline'></ion-icon><span translation='user.canvote'></span></span>" : "") +
		(site.status == 2 ? "<br><span class='vmiddle'><ion-icon name='heart'></ion-icon><span translation='user.voted'></span></span>" : "") +
		(site.status == 3 ? "<br><small class='vmiddle'><ion-icon name='warning-outline'></ion-icon><span translation='user.voteunknown'></span></small>" : "") +
		(site.next ? "<br><span class='vmiddle'><ion-icon name='arrow-forward-outline'></ion-icon>Next vote in <b>" + encode(site.next) + "</b></span>" : "") +
		"</li>"
}

loadFunc = async () => {
	if (getCookie("token")) {
		const json = await getUser()
		if (json.status == "success") {
			document.getElementById("vote-tk").innerHTML = "<p>In total, you've voted <b>" + json.totalVotes.toLocaleString() + "</b> times for TomatenKuchen.<br>" +
				"You currently have <b>" + json.credits.toLocaleString() + " credits</b>.</p><br><h3 translation='user.votelinks'></h3>" +
				"<ul>" + json.votes.filter(site => site.status != 0 && !site.mb).map(formatVote).join("") + "</ul>"
			document.getElementById("vote-mb").innerHTML = "<ul>" + json.votes.filter(site => site.status != 0 && site.mb).map(formatVote).join("") + "</ul>"
		} else return handleError(resolve, json.message)

		//reloadText()
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
