function getGuildsHTML() {
	return new Promise(resolve => {
		getGuilds()
			.then(json => {
				if (json.status == "success") {
					const target = localStorage.getItem("next");
					let text = "";
					json.data.sort((a, b) => {
						if (a.active && b.active) return 0;
						if (!a.active && b.active) return 1;
						return -1;
					}).forEach(guild => {
						text +=
							"<div class='guilds-container'>" +
							"<a class='guild' href='/" + (guild.active ? "dashboard/settings" : "invite") + "?guild=" + guild.id +
							(target && target.split("?")[1] ? "&" + target.split("?")[1].replace(/[^\w=-]/gi, "") : "") + "'>" +
							"<img" + (guild.active ? "" : " class='inactive'") + " alt='" + encode(guild.name) + " Server icon' width='128' height='128' title='" + encode(guild.name) + "' src='" + encode(guild.icon) + "'>" +
							"<div class='text'>" + encode(guild.name) + "</div>" +
							"</a>" +
							"</div>";
					});

					if (text == "") resolve("<h1 translation='dashboard.noservers'></h1>");
					else resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}

function getCustomcommandsHTML(json) {
	if (json.status == "success") {
		let text = "";

		json.data.forEach(setting => {
			text +=
				"<label for='" + setting.name + "'><b>" + setting.name + "</b></label>" +
				"<div class='emoji-container'>" +
				"<textarea class='setting' rows='" + Math.round(setting.value.split("\n").length * 1.25) + "' cols='65' id='" + setting.name + "' maxlength='2000' name='" + setting.name + "'>" + setting.value + "</textarea>" +
				"<ion-icon name='at-outline' title='Rolepicker' onclick='mentionPicker(this.parentElement, pickerData.roles)'></ion-icon>" +
				"<ion-icon name='happy-outline' title='Emojipicker' onclick='emojiPicker(this.parentElement, pickerData.emojis, guildName)'></ion-icon>" +
				"</div>" +
				"<br>";
		});

		if (text == "") text = "<p id='no-cc'><b translation='dashboard.cc.nocc'></b></p>";
		return "<h1 class='center'><span translation='dashboard.cc.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<p translation='dashboard.cc.delete'></p>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.cc.create'></button><br><br>" + text;
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>");
	}
}

function getTicketsHTML(guild) {
	return new Promise(resolve => {
		getTickets(guild)
			.then(json => {
				if (json.status == "success") {
					let text =
						"<h1 class='greeting'><span translation='tickets.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th>ID/Transcript</th><th translation='tickets.table.user'></th><th translation='tickets.table.otherusers'></th><th translation='tickets.table.state'></th></tr>" +
						"</thead><tbody>";

					json.data.forEach(ticket => {
						text +=
							"<tr class='ticket cmdvisible'>" +
							"<td><a href='/ticket/?id=" + encode(ticket.id) + "'>" + encode(ticket.id) + "</a></td>" +
							"<td>" + encode(ticket.owner) + "</td>" +
							"<td>" + encode(ticket.users.filter(u => u != ticket.owner).join(", ")) + "</td>" +
							"<td>" + encode(ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1)) + "</td>" +
							"</tr>";
					});

					resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}

function getLogsHTML(guild) {
	return new Promise(resolve => {
		getLogs(guild)
			.then(json => {
				if (json.status == "success") {
					logs = json.data;
					let text =
						"<h1 class='greeting'><span translation='logs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th>ID</th><th translation='logs.logtype'></th><th translation='logs.logmessage'></th><th translation='logs.amount'></th><th translation='logs.actions'></th></tr>" +
						"</thead><tbody>";

					json.data.forEach(log => {
						text +=
							"<tr class='ticket cmdvisible'>" +
							"<td>" + encode(log.id) + "</td>" +
							"<td>" + encode(log.type) + "</td>" +
							"<td class='overflow'>" + encode(log.message) + "</td>" +
							"<td>" + encode("" + log.count) + "</td>" +
							"<td>" +
								"<button type='button' class='categorybutton' onclick='info(\"" + encode(log.id) + "\")' translation='logs.moreinfo'></button>" +
								((log.lastDate || log.date) < Date.now() - 1000 * 60 * 60 * 24 * 3 ? "<button type='button' class='categorybutton red' onclick='const c=confirm(\"Do you really want to delete the log \\\"" +
								encode(log.id) + "\\\"?\");if(c){deleteLog(\"" + encode(guild) + "\",\"" + encode(log.id) + "\");this.parentElement.parentElement.remove();}' translation='logs.delete'></button>" : "") +
							"</td>" +
							"</tr>";
					});

					resolve(text + "</tbody></table>");
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}

function getModlogsHTML(guild) {
	return new Promise(resolve => {
		getModlogs(guild)
			.then(json => {
				if (json.status == "success") {
					logs = json.data;
					let text =
						"<h1 class='greeting'><span translation='modlogs.title'></span> <span class='accent'>" + encode(json.guild) + "</span></h1>" +
						"<table cellpadding='8' cellspacing='0'><thead>" +
						"<tr><th translation='logs.logtype'></th><th translation='modlogs.user'></th><th translation='modlogs.mod'></th><th translation='modlogs.reason'></th><th translation='logs.moreinfo'></th></tr>" +
						"</thead><tbody>";

					json.data.forEach(log => {
						log.cases?.forEach(i => {
							text +=
								"<tr class='ticket cmdvisible'>" +
								"<td>" + encode(i.type.charAt(0).toUpperCase() + i.type.slice(1)) + "</td>" +
								"<td>" + encode(log.user) + "</td>" +
								"<td>" + encode(i.moderator) + "</td>" +
								"<td class='overflow'>" + encode(i.reason) + "</td>" +
								"<td><button type='button' class='categorybutton' onclick='info(\"" + encode(log.user + "-" + i.date) + "\")' translation='logs.moreinfo'></button></td>" +
								"</tr>";
						});
					});

					resolve(text + "</tbody></table>");
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
}
