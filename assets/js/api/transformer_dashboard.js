function getGuildsHTML() {
	return new Promise(resolve => {
		getGuilds()
			.then(json => {
				if (json.status == "success") {
					let text = "";
					json.data.sort((a, b) => {
						if (a.active && b.active) return 0;
						if (!a.active && b.active) return 1;
						return -1;
					}).forEach(guild => {
						text +=
							"<div class='guilds-container'>" +
							"<a class='guild' href='" + (guild.active ? "./settings/" : "../invite/") + "?guild=" + guild.id + "'>" +
							"<img" + (guild.active ? "" : " class='inactive'") + ' alt="' + guild.id + '" width="128" height="128" title="' + encode(guild.name) + '" src="' + guild.icon + '">' +
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

function getSettingsHTML(json) {
	if (json.status == "success") {
		let text = "";
		const categories = [];
		const categoryData = [];

		json.data.forEach(setting => {
			let temp = "<label for='" + setting.key + "'>" + setting.desc + "</label>" +
				(setting.docs ? " <a href='https://docs.tomatenkuchen.eu/" + (getLanguage() == "de" ? "de/" : "") + setting.docs + "' target='_blank' rel='noopener'><small>Docs<ion-icon name='link-outline'></ion-icon></small></a>" : "") + "<br>";

			if (setting.possible || typeof setting.value == "object") {
				let possible = setting.possible;
				if (typeof possible == "string") possible = json.constant[possible];
				else if (typeof possible == "object") {
					Object.keys(possible).filter(key => key != "").forEach(key => {
						if (typeof possible[key] == "string" && json.constant[possible[key]]) possible[key] = json.constant[possible[key]];
					});
				}

				selectData[setting.key] = setting;
				if (typeof setting.type == "string" && Array.isArray(setting.value) && (setting.type == "role" || setting.type.endsWith("channel"))) {
					temp += "<channel-picker id='" + setting.key + "' data-multi='1' type='" + setting.type + "'></channel-picker>";
					queue.push(() => {
						if (selectData[setting.key].value.length == 0) document.getElementById(setting.key).querySelector(".list").innerHTML = "<div class='element'><ion-icon name='build-outline'></ion-icon></div>";
						else {
							selectData[setting.key].value.forEach(v => {
								const elem = document.getElementById(setting.key).querySelector(".picker div[data-id='" + v + "']");
								if (!elem) return;
								elem.classList.toggle("selected");
								document.getElementById(setting.key).querySelector(".list").innerHTML += "<div>" + elem.innerHTML + "</div>";
							});
						}
					});
				} else if (typeof setting.value == "object") {
					temp += "<div id='" + setting.key + "' class='advancedsetting'>";
					if (Array.isArray(setting.value)) temp += "<button class='createForm' onclick='addItem(\"" + setting.key + "\", void 0, \"\", this.parentElement)' translation='dashboard.add'>Add</button>";

					if (setting.value.length > 0 && typeof setting.value[0] == "object") temp += Object.keys(setting.value).map(i => addItem(setting.key, i, setting.value[i], void 0, true)).join("");
					else if (setting.value.length > 0) temp += setting.value.map(i => addItem(setting.key, i)).join("");
					else if (Object.keys(setting.value).length > 0) {
						setting.org = "object";
						setting.value = [setting.value];
						temp += addItem(setting.key, void 0, setting.value[0], void 0, true);
					}
					temp += "</div>";
				} else if (setting.type == "role" || setting.type.endsWith("channel")) {
					temp += "<channel-picker id='" + setting.key + "' type='" + setting.type + "'></channel-picker>";
					queue.push(() => updateSelected(document.getElementById(setting.key).querySelector(".picker .element"), setting.value));
				} else {
					temp += "<select class='setting' id='" + setting.key + "'>";
					Object.keys(possible).forEach(key => {
						if (setting.type == "bool") temp += "<option value='" + key + "'" + ((setting.value && key == "true") || (!setting.value && key != "true") ? " selected" : "") + ">" + possible[key] + "</option>"
						else temp += "<option value='" + key + "'" + (setting.value == key ? " selected" : "") + ">" + possible[key] + "</option>";
					});
					temp += "</select>";
				}
			} else {
				if (setting.type == "int" || setting.type == "number") temp +=
					"<input type='number' min='" + (setting.min || 0) + "' max='" + (setting.max || 10000) + "' step='" + (setting.step || 1) + "' class='setting' id='" + setting.key +
					"' value='" + (setting.type == "number" ? parseFloat(setting.value) : parseInt(setting.value)) + "'>";
				else if (setting.type == "time" || setting.type == "singlestring") {
					temp += "<input type='text' class='setting' id='" + setting.key + "' value='" + setting.value.replace(/[<>&"']/g, "") + "'>";
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value);
				} else if (setting.type == "emoji") {
					temp += "<div><input class='setting' id='" + setting.key + "' value='" + setting.value.replace(/[<>&"']/g, "") + "' onclick='cEmoPic(this, true)' readonly></div>";
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value);
				} else {
					temp += "<div class='emoji-container'><textarea class='setting' rows='" + (setting.value.split("\n").length + 1) + "' id='" + setting.key + "'>" + setting.value.replace(/[<>&"']/g, "") + "</textarea>" +
						"<ion-icon name='at-outline' title='Rolepicker' onclick='cMenPic(this)'></ion-icon>" +
						"<ion-icon name='happy-outline' title='Emojipicker' onclick='cEmoPic(this)'></ion-icon></div>";
					if (/[<>&"']/.test(setting.value)) queue.push(() => document.getElementById(setting.key).value = setting.value);
				}
			}
			if (!categories.includes(setting.category)) categories.push(setting.category);
			categoryData.push([setting.category, temp + "<br><br>"]);
		});

		categories.forEach(category => {
			text += "<div id='setcat-" + category + "' class='settingdiv'><h2 id='" + category + "'>" + (friendlyCat[category] || category.charAt(0).toUpperCase() + category.slice(1)) + "</h2><br>";
			categoryData.forEach(data => {
				if (category == data[0]) text += data[1];
			});
			text += "</div>";
		});

		return {
			html: "<center><h1><span translation='dashboard.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1></center>" + text,
			categories
		};
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h2>" +
			"<h2>" + json.message + "</h2>");
	}
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
		return "<center><h1><span translation='dashboard.cc.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1></center>" +
			"<p translation='dashboard.cc.delete'></p>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.cc.create'></button><br><br>" + text;
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h2>" +
			"<h2>" + json.message + "</h2>");
	}
}

function getActionsHTML(json) {
	if (json.status == "success") {
		let text = "";

		json.data.forEach(action => {
			text +=
				"<div>" +
				"<label for='" + encode(action.name) + "'><b>" + encode(action.name) + "</b></label>" +
				"<div class='emoji-container'>" +
				"<textarea class='setting' rows='" + (Math.round(action.content.split("\n").length * 1.2) + 2) + "' id='" + encode(action.name) + "-action' maxlength='2000' name='" + encode(action.name) +
				(action.slashcommand ? "' data-slashcommand='" + encode(action.slashcommand) : "") + "' data-trigger='" + encode(action.trigger) + "' data-version='" + encode(action.version) + "'>" +
				action.content + "</textarea><ion-icon name='at-outline' title='Rolepicker' onclick='mentionPicker(this.parentElement, pickerData.roles)'></ion-icon>" +
				"<ion-icon name='happy-outline' title='Emojipicker' onclick='emojiPicker(this.parentElement, pickerData.emojis, guildName)'></ion-icon>" +
				"</div>" +
				"<br><ion-icon name='trash-outline' onclick='deleteAction(this, \"" + encode(action.name) + "\");'></ion-icon>" +
				"<br></div>";
		});

		if (json.integrations.length > 0) text += "<h1 style='margin-top:125px'>Your and public integrations</h1><div class='integration-container'>"
		json.integrations.forEach(integration => {
			text +=
				"<div class='integration'>" +
				"<div class='flex'>" +
					"<h3>" + encode(integration.name) + "</h3>" +
					(integration.image ? "<img src='" + encode(integration.image) + "' alt='Integration icon' width='100' height='100' loading='lazy'>" : "") +
				"</div>" +
				"<p>ID: <code>" + encode(integration.id) + "</code></p>" +
				"<p>Owner: " + encode(integration.owner) + "</p>" +
				"<p>Public: " + (integration.public ? "✅" : "❌") + "</p>" +
				"<p>Last update: " + new Date(integration.lastUpdate).toLocaleDateString() + "</p>" +
				"<div class='flex'>" +
					"<button>View / Use</button>" +
					(integration.isOwner ? "<button>Edit</button>" : "") +
				"</div>" +
				"</div>";
		});
		if (json.integrations.length > 0) text += "</div>"

		if (text == "") text = "<p id='no-action'><b>There are no actions for this server!</b></p>";
		return "<center><h1><span>Actions of</span> <span class='accent'>" + encode(json.name) + "</span></h1></center>" +
			"<button type='button' class='createForm' onclick='createDialog()'>Create action</button>" +
			"<button type='button' class='createForm' onclick='createDialog(\"integration-create-dialog\")'>Create integration</button>" +
			"<br><br>" + text;
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h2>" +
			"<h2>" + json.message + "</h2>");
	}
}

function getReactionrolesHTML(json) {
	if (json.status == "success") {
		let channeloptions = "";
		Object.keys(json.data.channels).forEach(key => channeloptions += "<option value='" + key + "'>" + json.data.channels[key] + "</option>");
		document.getElementById("reactionroles-channel").innerHTML = channeloptions;

		let roleoptions = "";
		Object.keys(json.data.roles).forEach(key => roleoptions += "<option value='" + key + "'>" + json.data.roles[key] + "</option>");
		document.getElementById("reactionroles-role").innerHTML = roleoptions;
		rolecopy = json.data.roles;

		let text = "";
		json.data.reactionroles.forEach(setting => {
			const type = encode(setting.type);
			const emoji = encode(setting.reaction || setting.emoji);

			text +=
				"<div>" +
				(emoji ? (isNaN(emoji) ? "<p><b>" + emoji + "</b></p>" : "<img src='https://cdn.discordapp.com/emojis/" + emoji + ".webp?size=32' alt='Role emoji'><br>") : "") +
				(type == "button" || type == "select" ? "<p><b>" + encode(setting.label) + "</b></p>" : "") +
				"<select class='setting' data-type='" + type + "' data-msg='" + encode(setting.msg) + "' " +
				"data-channel='' " +
				(type == "reaction" ? "data-reaction='" + encode(setting.reaction) + "' " : "") +
				(type == "button" || type == "select" ?
					"data-label='" + encode(setting.label) + "' " +
					"data-emoji='" + encode(setting.emoji) + "' "
				: "") +
				(type == "button" && setting.buttonstyle ? "data-buttonstyle='" + encode(setting.buttonstyle) + "' " : "") +
				(type == "select" && setting.selectdesc ? "data-selectdesc='" + encode(setting.selectdesc) + "' " : "") +
				(setting.content ? "data-content='" + encode(setting.content) + "' " : "") +
				"id='" + encode(setting.msg + "-" + (setting.reaction || setting.label)) + "' " +
				"name='" + encode(setting.msg) + "' disabled>" +
				Object.keys(rolecopy).map(key =>
					setting.role == key ? "<option value='" + key + "' selected>" + encode(rolecopy[key]) + "</option>" : ""
				) +
				"</select><ion-icon name='trash-outline' onclick='this.parentElement.remove();'></ion-icon><br><br></div>";
		});

		if (text == "") text = "<p id='no-rr'><b translation='dashboard.rr.norr'></b></p>";
		return "<center><h1><span translation='dashboard.rr.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1></center>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.rr.create'></button><br><br>" + text;
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h2>" +
			"<h2>" + json.message + "</h2>");
	}
}

const tkbadges = {
	developer: "<img src='https://cdn.discordapp.com/emojis/712736235873108148.webp?size=24' width='24' height='24' alt='' loading='lazy'> Entwickler",
	team: "<img src='https://cdn.discordapp.com/emojis/713984949639708712.webp?size=24' width='24' height='24' alt='' loading='lazy'> Team",
	contributor: "<img src='https://cdn.discordapp.com/emojis/914137176499949598.webp?size=24' width='24' height='24' alt='' loading='lazy'> Denkääär",
	translator: "🏴‍☠️ Übersetzer",
	kek: "<img src='https://cdn.discordapp.com/emojis/858221941017280522.webp?size=24' width='24' height='24' alt='' loading='lazy'> Kek",
	oldeconomy: "<img src='https://cdn.discordapp.com/emojis/960027591115407370.gif?size=24' width='24' height='24' alt='' loading='lazy'> Altes Economysystem"
}
function getDataexportHTML(token) {
	return new Promise(resolve => {
		getDataexport(token)
			.then(json => {
				if (json.status == "success") {
					let badges = "";
					if (json.data.userProfiles?.badges?.length > 0) badges = json.data.userProfiles.badges.map(badge => "<div class='badge'>" + tkbadges[badge] + "</div>").join(", ");

					let economyitems = "";
					if (json.data.economy?.shop?.length > 0)
						economyitems = json.data.economy.shop.map(item => "<p class='badge' title='Erhalten am " + new Date(item.date).toLocaleString() +
							(item.used > 0 ? ", " + item.used + " mal genutzt" : "") + "'>" + item.name + "</p>").join(", ");

					let cooldowns = "";
					if (json.data.economy?.cooldowns?.length > 0)
						cooldowns = json.data.economy.cooldowns.map(cooldown => "<p class='badge' title='Bis " + new Date(cooldown.time).toLocaleString() + "'>" + cooldown.cmd + "</p>").join(", ");

					let mentions = "";
					if (json.data.userProfiles?.afk?.mentions?.length > 0)
						mentions = json.data.userProfiles.afk.mentions.map(mention => "<a href='" + mention.url + "'><p class='badge'>" + mention.user + "</p></a><br>").join(", ");
					const afkSince = json.data.userProfiles?.afk?.date ? new Date(json.data.userProfiles?.afk?.date).toLocaleString() : "";

					let reminders = "";
					if (json.data.remind?.length > 0)
						reminders = json.data.remind.map(reminder => "<p class='badge' title='" + new Date(reminder.time).toLocaleString() + "'>" + encode(reminder.text) + "</p>").join(", ");

					let tickets = "";
					if (json.data.ticket?.length > 0) tickets = json.data.ticket.map(ticket => "<a href='/ticket/?id=" + encode(ticket.id) + "'>" + encode(ticket.id) + "</a>").join(", ");

					let suggests = "";
					if (json.data.suggest?.length > 0)
						suggests = json.data.suggest.map(suggest => "<p class='badge' title='" + encode(suggest.text) + "'>#" + encode("" + suggest.id) + "</p>").join(", ");

					const text =
						"<center>" +
						"<h1 class='greeting'><span translation='user.title'></span> <span class='accent'>" + encode(getCookie("user")) + "</span></h1>" +
						"<div class='userdatagrid'>" +

						"<div class='userData'>" +
						"<h1 translation='user.general'></h1>" +
						"<p><b>ID:</b> " + json.data.userProfiles?.id + "</p>" +
						(json.data.birthday ?
							"<p><b>Birthday:</b> " + encode("" + json.data.birthday.day) + "." + encode("" + json.data.birthday.month) + "." +
							(json.data.birthday.year ? encode("" + json.data.birthday.year) : "") + "</p>"
						: "") +
						(badges ? "<p><b>Badges:</b> " + badges + "</p>" : "") +
						"</div>" +

						"<div class='userData'>" +
						"<h1 translation='dashboard.settings'></h1>" +
						"<p><b>Embed color:</b><p style='background-color: #" + encode(json.data.userProfiles?.settings?.embedcolor) + ";'></p> " + encode(json.data.userProfiles?.settings?.embedcolor) + "</p>" +
						"<p><b translation='user.levelbg'></b><br><a class='accent' target='_blank' ref='noopener' href='" + json.data.userProfiles?.settings?.levelBackground + "'><img src='" + json.data.userProfiles?.settings?.levelBackground + "' loading='lazy' width='350' height='140' alt='Your level background'></a></p>" +
						"<p><b translation='user.saveticketatt'></b> " + encode(json.data.userProfiles?.settings?.saveTicketAttachments) + "</p>" +
						"</div>" +

						(json.data.economy ?
							"<div class='userData'>" +
							"<h1>Economy</h1>" +
							"<p><b>Wallet:</b> " + json.data.economy.wallet.toLocaleString("de-DE") + "🍅</p>" +
							"<p><b>Bank:</b> " + json.data.economy.bank.toLocaleString("de-DE") + "🍅</p>" +
							"<p><b>Skill:</b> " + json.data.economy.skill.toFixed(1) + "</p>" +
							"<p><b>School:</b> " + json.data.economy.school + "</p>" +
							(economyitems ? "<p><b>Items:</b> " + economyitems + "</p>" : "") +
							(cooldowns ? "<p><b>Cooldowns:</b> " + cooldowns + "</p>" : "") +
							"</div>"
						: "") +

						(json.data.userProfiles?.afk?.text == "" ? "" :
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

						"</div>" +

						"<div style='overflow: auto;'>" +
						"<div class='userData'>" +
						"<label for='datajson'><h1 translation='user.json'></h1></label><br>" +
						"<textarea id='datajson' rows='13' cols='" + (Math.round(screen.width / 11) > 120 ? 120 : Math.round(screen.width / 11)) + "' readonly>" +
							JSON.stringify(json.data, null, 2) + "</textarea>" +
						"</div>" +
						"</div>" +

						"</center>";

					resolve(text);
				} else handleError(resolve, json.message);
			})
			.catch(e => handleError(resolve, e));
	});
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
