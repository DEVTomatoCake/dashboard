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
							"<a class='guild' href='" + (guild.active ? "./settings" : "/invite") + "?guild=" + guild.id +
							(target && target.split("?")[1] ? "&" + target.split("?")[1].replace(/[^\w=-]/gi, "") : "") + "'>" +
							"<img" + (guild.active ? "" : " class='inactive'") + " alt='" + guild.id + "' width='128' height='128' title='" + encode(guild.name) + "' src='" + guild.icon + "'>" +
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
				(setting.docs ? " <a href='https://docs.tomatenkuchen.eu/" + (getLanguage() == "de" ? "de/" : "") + setting.docs + "' target='_blank' rel='noopener'><small>Docs</small></a>" : "") + "<br>";

			if (setting.possible || typeof setting.value == "object") {
				let possible = setting.possible;
				if (typeof possible == "string") possible = json.constant[possible];
				else if (typeof possible == "object") {
					Object.keys(possible).filter(key => key != "").sort((a, b) => b.pos - a.pos).forEach(key => {
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
					temp += "</div><br>";
				} else if (setting.type == "role" || setting.type.endsWith("channel")) {
					temp += "<channel-picker id='" + setting.key + "' type='" + setting.type + "'></channel-picker>";
					queue.push(() => updateSelected(document.getElementById(setting.key).querySelector(".picker .element"), setting.value));
				} else {
					temp += "<select class='setting' id='" + setting.key + "'>";
					Object.keys(possible).forEach(key => {
						if (setting.type == "bool") temp += "<option value='" + key + "'" + ((setting.value && key == "true") || (!setting.value && key != "true") ? " selected" : "") + ">" + possible[key] + "</option>"
						else temp += "<option value='" + key + "'" + (setting.value == key ? " selected" : "") + ">" + possible[key] + "</option>";
					});
					temp += "</select><br>";
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
				temp += "<br>";
			}
			if (!categories.includes(setting.category)) categories.push(setting.category);
			categoryData.push([setting.category, temp + "<br>"]);
		});

		categories.forEach(category => {
			text += "<div id='setcat-" + category + "' class='settingdiv'><h2 id='" + category + "'>" + (friendlyCat[category] || category.charAt(0).toUpperCase() + category.slice(1)) + "</h2><br>";
			categoryData.forEach(data => {
				if (category == data[0]) text += data[1];
			});
			text += "</div>";
		});

		return {
			html: "<h1 class='center'><span translation='dashboard.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" + text,
			categories
		};
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
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
		return "<h1 class='center'><span translation='dashboard.cc.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<p translation='dashboard.cc.delete'></p>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.cc.create'></button><br><br>" + text;
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>");
	}
}

function getIntegrationsHTML(json, guild) {
	if (json.status == "success") {
		let text = "";

		if (json.integrations.some(i => i.guild == guild))
			text +=
				"<br><br><h2 translation='integration.thisserver'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild == guild).map(handleIntegration).join("") +
				"</div>";
		else text += "<div class='integration-container'></div>";

		if (json.integrations.some(i => i.guild != guild && i.isOwner))
			text +=
				"<br><br><h2 translation='integration.yours'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild != guild && i.isOwner).map(handleIntegration).join("") +
				"</div>";

		if (json.integrations.some(i => i.guild != guild && !i.isOwner))
			text +=
				"<br><br><h2 translation='integration.otherpublic'></h2><div class='integration-container'>" +
				json.integrations.filter(i => i.guild != guild && !i.isOwner).map(handleIntegration).join("") +
				"</div>";

		if (text == "<div class='integration-container'></div>") text += "<p id='no-integrations'><b translation='integration.none'></b></p>";
		return "<h1 class='center'><span translation='integration.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='createDialog()' translation='integration.create'></button>" + text + "</div>";
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
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
				"</select><ion-icon name='trash-outline' onclick='this.parentElement.remove()'></ion-icon><br><br></div>";
		});

		if (text == "") text = "<p id='no-rr'><b translation='dashboard.rr.norr'></b></p>";
		return "<h1 class='center'><span translation='dashboard.rr.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<button type='button' class='createForm' onclick='openForm()' translation='dashboard.rr.create'></button><br><br>" + text;
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
