const tkbadges = {
	developer: "<img src='https://cdn.discordapp.com/emojis/712736235873108148.webp?size=24' width='24' height='24' alt='' loading='lazy'> Developer",
	team: "<img src='https://cdn.discordapp.com/emojis/713984949639708712.webp?size=24' width='24' height='24' alt='' loading='lazy'> Staff",
	contributor: "<img src='https://cdn.discordapp.com/emojis/914137176499949598.webp?size=24' width='24' height='24' alt='' loading='lazy'> Denkääär",
	translator: "🏴‍☠️ Translator",
	kek: "<img src='https://cdn.discordapp.com/emojis/858221941017280522.webp?size=24' width='24' height='24' alt='' loading='lazy'> Kek",
	oldeconomy: "<img src='https://cdn.discordapp.com/emojis/960027591115407370.gif?size=24' width='24' height='24' alt='' loading='lazy'> Old economy system"
}
function getDataexportHTML() {
	return new Promise(resolve => {
		getDataexport()
			.then(json => {
				if (json.status == "success") {
					let badges = ""
					if (json.data.userProfiles?.badges?.length > 0) badges = json.data.userProfiles.badges.map(badge => "<div class='badge'>" + tkbadges[badge] + "</div>").join(", ")

					let economyitems = ""
					if (json.data.economy?.shop?.length > 0)
						economyitems = json.data.economy.shop.map(item => "<p class='badge' title='Erhalten am " + new Date(item.date).toLocaleString() +
							(item.used > 0 ? ", " + item.used + " mal genutzt" : "") + "'>" + item.name + "</p>").join(", ")

					let cooldowns = ""
					if (json.data.economy?.cooldowns?.length > 0)
						cooldowns = json.data.economy.cooldowns.map(cooldown => "<p class='badge' title='Runs out: " + new Date(cooldown.time).toLocaleString() + "'>" + cooldown.cmd + "</p>").join(", ")

					let mentions = ""
					if (json.data.userProfiles?.afk?.mentions?.length > 0)
						mentions = json.data.userProfiles.afk.mentions.map(mention => "<a href='" + mention.url + "'><p class='badge'>" + mention.user + "</p></a><br>").join(", ")
					const afkSince = json.data.userProfiles?.afk?.date ? new Date(json.data.userProfiles?.afk?.date).toLocaleString() : ""

					let reminders = ""
					if (json.data.remind?.length > 0)
						reminders = json.data.remind.map(reminder => "<p class='badge' title='" + new Date(reminder.time).toLocaleString() + "'>" + encode(reminder.text) + "</p>").join(", ")

					let tickets = ""
					if (json.data.ticket?.length > 0) tickets = json.data.ticket.map(ticket => "<a href='/ticket?id=" + encode(ticket.id) + "'>" + encode(ticket.id) + "</a>").join(", ")

					let suggests = ""
					if (json.data.suggest?.length > 0)
						suggests = json.data.suggest.map(suggest => "<p class='badge' title='" + encode(suggest.text) + "'>#" + encode("" + suggest.id) + "</p>").join(", ")

					const text =
						"<div class='center'>" +
						"<h1 class='greeting'><span translation='user.title'></span> <span class='accent'>" + encode(getCookie("user")) + "</span></h1>" +
						"<div class='userdatagrid'>" +

						"<div class='userData'>" +
						"<h1 translation='user.general'></h1>" +
						"<p><b>ID:</b> " + json.data.userProfiles?.id + "</p>" +
						(json.data.birthday ?
							"<p><b translation='user.birthday'></b> " + encode("" + json.data.birthday.day) + "." + encode("" + json.data.birthday.month) + "." +
							(json.data.birthday.year ? encode("" + json.data.birthday.year) : "") + "</p>"
						: "") +
						(badges ? "<p><b translation='user.badges'></b> " + badges + "</p>" : "") +
						"</div>" +

						"<div class='userData'>" +
						"<h1 translation='dashboard.settings'></h1>" +
						"<p><b>Embed color:</b> " + encode(json.data.userProfiles?.settings?.embedcolor) + "</p>" +
						"<p><b translation='user.levelbg'></b><br><a class='accent' target='_blank' ref='noopener' href='" + json.data.userProfiles?.settings?.levelBackground +
						"'><img src='" + json.data.userProfiles?.settings?.levelBackground + "' loading='lazy' width='350' height='140' alt='Your level background'></a></p>" +
						"<p><b translation='user.saveticketatt'></b> " + encode(json.data.userProfiles?.settings?.saveTicketAttachments) + "</p>" +
						"</div>" +

						(json.data.economy ?
							"<div class='userData'>" +
							"<h1>Economy</h1>" +
							"<p><b>Wallet:</b> " + json.data.economy.wallet.toLocaleString() + "🍅</p>" +
							"<p><b>Bank:</b> " + json.data.economy.bank.toLocaleString() + "🍅</p>" +
							"<p><b>Skill:</b> " + json.data.economy.skill.toFixed(1) + "</p>" +
							"<p><b>School:</b> " + json.data.economy.school + "</p>" +
							(economyitems ? "<p><b>Items:</b> " + economyitems + "</p>" : "") +
							(cooldowns ? "<p><b>Cooldowns:</b> " + cooldowns + "</p>" : "") +
							"</div>"
						: "") +

						(!json.data.userProfiles || !json.data.userProfiles.afk || !json.data.userProfiles.afk.text ? "" :
							"<div class='userData'>" +
							"<h1>AFK</h1>" +
							"<p><b translation='user.reason'></b> " + encode(json.data.userProfiles.afk.text) + "</p>" +
							"<p><b translation='user.since'></b> " + afkSince + "</p>" +
							(mentions ? "<p><b>Mentions:</b> " + mentions + "</p>" : "") +
							"</div>"
						) +

						(reminders ?
							"<div class='userData'>" +
							"<h1 translation='user.reminders'></h1>" +
							reminders +
							"</div>"
						: "") +

						(tickets ?
							"<div class='userData'>" +
							"<h1>Tickets</h1>" +
							tickets +
							"</div>"
						: "") +

						(suggests ?
							"<div class='userData'>" +
							"<h1 translation='user.suggestions'></h1>" +
							suggests +
							"</div>"
						: "") +

						(json.data.backup && json.data.backups ?
							"<div class='userData'>" +
							"<h1>" + json.data.backups.length + "Backups</h1>" +
							"</div>"
						: "") +

						"</div>" +

						"<div class='userData'>" +
						"<label for='datajson'><h1 translation='user.json'></h1></label><br>" +
						"<textarea id='datajson' rows='13' cols='" + (Math.round(screen.width / 11) > 120 ? 120 : Math.round(screen.width / 11)) + "' readonly>" +
							JSON.stringify(json.data, null, 2) + "</textarea>" +
						"</div>" +

						"</div>"

					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

loadFunc = () => {
	if (getCookie("token"))
		getDataexportHTML().then(data => {
			document.getElementById("content").innerHTML = data
			document.getElementById("linksidebar").innerHTML +=
				"<div class='section middle'><p class='title'>Your profile</p>" +
				"<a class='tab otherlinks' href='./custom'><ion-icon name='construct-outline'></ion-icon><p>Custom branding</p></a>" +
				"<a class='tab otherlinks active' href='./dataexport'><ion-icon name='file-tray-stacked-outline'></ion-icon><p>Your user data</p></a>" +
				"</div>"

			reloadText()
		})
	else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
