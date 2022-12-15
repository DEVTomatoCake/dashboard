function getCommandsHTML() {
	return new Promise((resolve => {
		getCommands()
			.then(json => {
				if (json.status == 'success') {
					let text = "";
					var categories = [];
					var categoryData = [];

					json.data.forEach(command => {
						var temp = '' +
							'<tr class="command cmdvisible"' + (command.category ? ' data-category="' + command.category + '"' : '') + '>' +
							'<td>' + command.name + '</td>' +
							'<td>' + command.description + '</td>' +
							'<td>' + command.usage + '</td>' +
							'</tr>';

						if (command.category && !categories.includes(command.category)) categories.push(command.category);
						if (command.category) categoryData.push([command.category, temp]);
					});

					categories.forEach(category => {
						text += '<center><h2 id="' + category + 'title">' + category.charAt(0).toUpperCase() + category.slice(1) + '</h2>' +
						'<button class="categorybutton" id="' + category + 'tb" onclick="toggleCategory(\'' + category + '\');">Verstecken</button>' +
						'<table cellpadding="8" cellspacing="0" class="category" id="' + category + '">' +
						'<thead><tr><th>Name</th><th>Beschreibung</th><th>Verwendung</th></tr></thead><tbody>';
						categoryData.forEach(data => {
							if (category == data[0]) text += data[1];
						});
						text += '</tbody></table></center><br id="' + category + 'br">';
					});

					resolve(text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
						'<h1>' + json.message + '</h1>');
				}
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	}));
}

function getStatsHTML(guild, filter) {
	return new Promise(resolve => {
		getStats(guild + (filter.time ? "&time=" + filter.time : "") + (filter.type ? "&type=" + filter.type : ""))
			.then(json => {
				if (json.status === 'success') {
					resolve({
						name: json.name,
						data: json.data
					});
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
						'<h1>' + json.message + '</h1>');
				}
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	});
}

function getGuildsHTML() {
	return new Promise(resolve => {
		getGuilds()
			.then(json => {
				if (json.status == 'success') {
					let text = '';
					json.data.sort((a, b) => {
						if (a.activated && b.activated) return 0;
						if (!a.activated && b.activated) return 1;
						return -1;
					})
					json.data.forEach(guild => {
						text += '' +
							'<div class="guilds-container">' +
							'<a class="guild" href="' + (guild.activated ? '' : '../invite/') + '?guild=' + guild.id + '">' +
							'<img class="image' + (guild.activated ? '' : ' notactivated') + '" alt="' + guild.id + '" title="' + encode(guild.name) + '" src="' + guild.icon + '">' +
							'<div class="text">' + encode(guild.name) + '</div>' +
							'</a>' +
							'</div>';
					});

					if (text == '') resolve('<h1>Es wurden keine Server von dir gefunden!</h1>');
					else resolve(text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
						'<h1>' + json.message + '</h1>');
				}
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	});
}

function getSettingsHTML(json) {
	if (json.status == 'success') {
		let text = "";
		var categories = [];
		var categoryData = [];

		multiselect = json.constant.multiselect;
		advancedsetting = json.constant.advancedsetting;

		json.data.forEach(setting => {
			let temp = "";
			if (!setting.possible) {
				if (json.constant.integer.includes(setting.key)) temp += "" +
					'<label for=' + setting.key + '>' + setting.help + '</label><br>' +
					'<input type="number" min="0" max="9999" class="setting" id="' + setting.key + '" name="' + setting.key + '" value="' + (setting.value?.includes("<") || setting.value?.includes(">") ? "" : setting.value) + '">';
				else temp += "" +
					'<label for=' + setting.key + '>' + setting.help + '</label><br>' +
					'<input class="setting" size="' + (screen.width > 500 ? 38 : 20) + '" id="' + setting.key + '" name="' + setting.key + '" value="' + (setting.value?.includes("<") || setting.value?.includes(">") ? "" : setting.value) + '">';

				if (setting.value?.includes("<") || setting.value?.includes(">")) {
					setTimeout(() => {
						document.getElementById(setting.key).value = setting.value;
					}, 2000);
				};
			} else {
				var possible = setting.possible;
				if (typeof possible == "string") possible = json.constant[possible];

				if (multiselect.includes(setting.key)) {
					temp += '<label for=' + setting.key + '>' + setting.help + '</label><br>' +
						'<select multiple class="setting" id="' + setting.key + '" name="' + setting.key + '">';
					var selected = [];
					var i = 0;
					Object.keys(possible).forEach(key => {
						if (key == "") return;
						setting.value.split(",").forEach(data => {
							if (data == key.replace('_', '')) selected.push(i);
						});
						i++;
						if (typeof possible[key] == "string") temp += '<option value="' + key.replace("_", "") + '" ' + (setting.value == key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>';
						else temp += '<option value="' + key.replace("_", "") + '" data-type="' + possible[key].type + '" ' + (possible[key].color ? ' data-color="' + possible[key].color + '" ' : "") + (setting.value == key.replace('_', '') ? 'selected' : '') + '>' + possible[key].name + '</option>';
					});
					temp += "</select>";
					setTimeout(() => {
						drops.push({key: setting.key, data: new drop({selector: "#" + setting.key, preselected: selected})});
					}, 2000);
				} else if (advancedsetting.includes(setting.key)) {
					currentlySelected[setting.key] = {
						value: setting.value.split(",").map(r => r.split(":")[0]).join(" ") + " ",
						possible
					};

					temp += '<label for=' + setting.key + '>' + setting.help + '</label><br>' +
						'<select class="setting" id="' + setting.key + '" name="' + setting.key + '" ' +
						(Object.keys(possible).filter(r => r.trim() != "" && !setting.value.includes(r.replace("_", ""))).length == 0 ? "disabled " : "") +
						'onchange="addRole(\'' + setting.key + '\', this)">' +
						'<option>' + (setting.key == "voiceNotifyMessage" || setting.key == "levelMultipliers" ? "Kanal" : "Rolle") + ' hinzufügen...</option>';

					Object.keys(possible).filter(r => r.trim() != "" && !setting.value.includes(r.replace("_", ""))).forEach(key => {
						temp += '<option value="' + key.replace("_", "") + '"' + '>' + possible[key].name + '</option>';
					});
					temp += '</select><div id="' + setting.key + 'list" class="advancedsetting">';

					if (setting.value.trim() != "") setting.value.split(",").forEach(r => {
						temp += "<div><br><p>" + possible["_" + r.split(":")[0]].name + '</p><input type="' + (setting.key == "levelMultipliers" ? 'number" min="0.1" max="3" step="0.1" value="1"' : 'text" size="' + (screen.width > 500 ? 30 : 20) + '"') + ' id="an_' + setting.key + "_" + r.split(":")[0] + 'value" class="settingcopy" value="' + r.split(":")[1] + '"><ion-icon name="close-outline" class="removeItem" onclick="removeRole(\'' + setting.key + '\', this, \'' + r.split(":")[0] + '\')"></ion-icon></div>';
					});
					temp += "</div>";
				} else {
					temp += '<label for=' + setting.key + '>' + setting.help + '</label><br>' +
						'<select class="setting" id="' + setting.key + '" name="' + setting.key + '">';
					Object.keys(possible).forEach(key => {
						if (typeof possible[key] == "string") temp += '<option value="' + key.replace('_', '') + '" ' + (setting.value == key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>'
						else temp += '<option value="' + key.replace('_', '') + '" ' + (setting.value == key.replace('_', '') ? 'selected' : '') + '>' + possible[key].name + '</option>'
					});
					temp += "</select>";
				};
			};
			if (setting.category && !categories.includes(setting.category)) categories.push(setting.category);
			if (setting.category) categoryData.push([setting.category, temp + "<br><br>"]);
		});

		categories.forEach(category => {
			text += '<h2 id="' + category + '">' + (friendlyCat[category] || category.charAt(0).toUpperCase() + category.slice(1)) + "</h2><br>";
			categoryData.forEach(data => {
				if (category == data[0]) text += data[1];
			});
		});

		return {
			html: '<center><h1>Einstellungen von <span class="accent">' + encode(json.name) + '</span></h1></center>' + text,
			categories
		};
	} else {
		return ('' +
			'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
			'<h1>' + json.message + '</h1>');
	};
}

function getCustomcommandsHTML(json) {
	if (json.status == "success") {
		let text = "";

		json.data.forEach(setting => {
			text += '' +
				'<p><b>' + setting.name + '</b></p>' +
				'<textarea class="setting" rows="' + Math.round(setting.value.split("").filter(i => i == "\n").length * 1.3) + '" cols="65" id="' + setting.name + '" maxlength="2000" name="' + setting.name + '">' + setting.value + '</textarea>' +
				'<br>';
		});

		if (text == "") text = "<span id='no-cc'><b>Es sind keine Customcommands vorhanden!</b></span>"
		return '<center><h1>Customcommands von <span class="accent">' + encode(json.name) + '</span></h1></center><p>Wenn du ein Feld leer lässt wird der Customcommand gelöscht.</p><button onclick="openForm()">Customcommand erstellen</button><br><br>' + text;
	} else {
		return ('' +
			'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
			'<h1>' + json.message + '</h1>');
	};
}

function getReactionrolesHTML(json) {
	if (json.status == "success") {
		let text = "";

		json.data.reactionroles.forEach(setting => {
			if (isNaN(setting.reaction)) text += '<p><b>' + setting.reaction + '</b></p>';
			else text += '<img src="https://cdn.discordapp.com/emojis/' + setting.reaction + '.webp?size=32" width="32" height="32" loading="lazy" alt="Reactionrole image" /><br>';

			const possible = setting.possible;
			text += '<select class="setting" data-type="' + setting.type + '" data-msg="' + setting.msg + '" data-reaction="' + setting.reaction + '" data-channel="" id="' + setting.msg + '-' + setting.reaction + '" name="' + setting.msg + '">';
			Object.keys(possible).forEach(key => text += '<option value="' + key.replace('_', '') + '" ' + (setting.role === key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>');
			text += '</select><br><br>';
		});

		let typeoptions = "";
		Object.keys(json.data.types).forEach(key => typeoptions += '<option value="' + key + '">' + json.data.types[key] + '</option>');
		document.getElementById("reactionroles-type").innerHTML = typeoptions;

		let channeloptions = "";
		Object.keys(json.data.channels).forEach(key => channeloptions += '<option value="' + key.replace('_', '') + '">' + json.data.channels[key] + '</option>');
		document.getElementById("reactionroles-channel").innerHTML = channeloptions;

		let roleoptions = "";
		Object.keys(json.data.roles).forEach(key => roleoptions += '<option value="' + key.replace('_', '') + '">' + json.data.roles[key] + '</option>');
		document.getElementById("reactionroles-role").innerHTML = roleoptions;
		rolecopy = json.data.roles;

		if (text == "") text = "<span id='no-rr'><b>Es sind keine Reactionroles vorhanden!</b></span>"
		return '<center><h1>Reactionroles von <span class="accent">' + encode(json.name) + '</span></h1></center><button onclick="openForm()">Reactionrole erstellen</button><br><br>' + text;
	} else {
		return ('' +
			'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
			'<h1>' + json.message + '</h1>');
	};
}

function getLeaderboardHTML(guild) {
	return new Promise(resolve => {
		getLeaderboard(guild)
			.then(json => {
				if (json.status == 'success') {
					let text = '<h1 class="greeting">Leaderboard von <span class="accent">' + encode(json.guild) + '</span></h1>';
					json.data.forEach(entry => text += '<div class="leaderboard"><p>' + entry.place + '. <img class="user-image" src="' + entry.avatar + '?size=32" loading="lazy" width="32" height="32" alt="Avatar von ' + encode(entry.user) + '" />' + encode(entry.user) + ' <b>' + entry.points + '</b> ' + (entry.points == 1 ? 'Punkt' : 'Punkte') + ' (Level <b>' + entry.level + '</b>)</p></div>');
					resolve(text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
						'<h1>' + json.message + '</h1>');
				}
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	});
}

const tkbadges = {
	developer: "<img src='https://cdn.discordapp.com/emojis/712736235873108148.webp?size=24' width='24' height='24' alt='' loading='lazy' /> Entwickler",
	team: "<img src='https://cdn.discordapp.com/emojis/713984949639708712.webp?size=24' width='24' height='24' alt='' loading='lazy' /> Team",
	contributor: "<img src='https://cdn.discordapp.com/emojis/914137176499949598.webp?size=24' width='24' height='24' alt='' loading='lazy' /> Denkääär",
	translator: "🏴‍☠️ Übersetzer",
	kek: "<img src='https://cdn.discordapp.com/emojis/858221941017280522.webp?size=24' width='24' height='24' alt='' loading='lazy' /> Kek",
	oldeconomy: "<img src='https://cdn.discordapp.com/emojis/960027591115407370.gif?size=24' width='24' height='24' alt='' loading='lazy' /> Altes Economysystem"
}

function getDataexportHTML(token) {
	return new Promise(resolve => {
		getDataexport(token)
			.then(json => {
				if (json.status == "success") {
					if (json.data.userProfiles?.badges?.length > 0)
						var badges = json.data.userProfiles.badges.map(badge => '<div class="badge">' + tkbadges[badge] + '</div>').join(", ");

					if (json.data.economy?.shop?.length > 0)
						var economyitems = json.data.economy.shop.map(item => '<p class="badge" title="Erhalten am ' + new Date(item.date).toLocaleString() + (item.used > 0 ? ", " + item.used + " mal genutzt" : "") + '">' + item.name + '</p>').join(", ");

					if (json.data.economy?.cooldowns?.length > 0)
						var cooldowns = json.data.economy.cooldowns.map(cooldown => '<p class="badge" title="Bis ' + new Date(cooldown.time).toLocaleString() + '">' + cooldown.cmd + '</p>').join(", ");

					if (json.data.userProfiles?.afk?.mentions?.length > 0)
						var mentions = json.data.userProfiles.afk.mentions.map(mention => '<a href="' + mention.url + '"><p class="badge">' + mention.user + '</p></a><br>').join(", ");
					let afkSince = json.data.userProfiles?.afk?.date ? new Date(json.data.userProfiles?.afk?.date).toLocaleString() : "";

					if (json.data.remind?.length > 0)
						var reminders = json.data.remind.map(reminder => '<p class="badge" title="' + new Date(reminder.time).toLocaleString() + '">' + encode(reminder.text) + '</p>').join(", ");

					if (json.data.ticket?.length > 0)
						var tickets = json.data.ticket.map(ticket => '<a href="/ticket/?id=' + ticket.id + '">' + ticket.id + '</a>').join(", ");

					if (json.data.suggest?.length > 0)
						var suggests = json.data.suggest.map(suggest => '<p class="badge" title="' + encode(suggest.text) + '">#' + suggest.id + '</p>').join(", ");

					let text =
					'<center>' +
					'<h1 class="greeting">Daten von <span class="accent">' + encode(getCookie('user')) + '</span></h1>' +
					'<div class="userdatagrid">' +

					// User
					'<div class="userData">' +
					'<h1 translation="user.general"></h1>' +
					'<p><b>ID:</b> ' + json.data.userProfiles?.id + '</p>' +
					(json.data.birthday ? '<p><b>Birthday:</b> ' + json.data.birthday.day + '.' + json.data.birthday.month + '.</p>' : "") +
					(badges ? '<p><b>Badges:</b> ' + badges + '</p>' : "") +
					'</div>' +

					// Usersettings
					'<div class="userData">' +
					'<h1 translation="user.settings"></h1>' +
					'<p><b>Embed color:</b><p style="background-color: #' + json.data.userProfiles?.settings?.embedcolor + ';"></p> ' + json.data.userProfiles?.settings?.embedcolor + '</p>' +
					'<p><b>Level background:</b><br><a class="accent" href="' + json.data.userProfiles?.settings?.levelBackground + '"><img src="' + json.data.userProfiles?.settings?.levelBackground + '" loading="lazy" width="350" height="140" alt="Your level background"/></a></p>' +
					'<p><b>Save avatar and attachments in tickets:</b> ' + json.data.userProfiles?.settings?.saveTicketAttachments + '</p>' +
					'</div>' +

					// Economy
					(json.data.economy ?
						'<div class="userData">' +
						'<h1>Economy</h1>' +
						'<p><b>Wallet:</b> ' + json.data.economy.wallet.toLocaleString("de-DE") + '🍅</p>' +
						'<p><b>Bank:</b> ' + json.data.economy.bank.toLocaleString("de-DE") + '🍅</p>' +
						'<p><b>Skill:</b> ' + json.data.economy.skill.toFixed(1) + '</p>' +
						'<p><b>School:</b> ' + json.data.economy.school + '</p>' +
						(economyitems ? '<p><b>Items:</b> ' + economyitems + '</p>' : "") +
						(cooldowns ? '<p><b>Cooldowns:</b> ' + cooldowns + '</p>' : "") +
						'</div>'
					: "") +

					// AFK
					(json.data.userProfiles?.afk?.text != "" ?
						'<div class="userData">' +
						'<h1>AFK</h1>' +
						'<p><b>Reason:</b> ' + encode(json.data.userProfiles.afk.text) + '</p>' +
						'<p><b>Seit:</b> ' + afkSince + '</p>' +
						(mentions ? '<p><b>Mentions:</b> ' + mentions + '</p>' : "") +
						'</div>'
					: "") +

					// Remind
					(reminders ?
						'<div class="userData">' +
						'<h1 translation="user.reminders"></h1>' +
						reminders +
						'</div>'
					: "") +

					// Tickets
					(tickets ?
						'<div class="userData">' +
						'<h1>Tickets</h1>' +
						tickets +
						'</div>'
					: "") +

					// Suggest
					(suggests ?
						'<div class="userData">' +
						'<h1 translation="user.suggestions"></h1>' +
						suggests +
						'</div>'
					: "") +

					'</div>' +

					'<div style="overflow: auto;">' +
					'<div class="userData">' +
					'<label for="datajson"><h1 translation="user.json"></h1></label>' +
					'<br><textarea id="datajson" rows="13" cols="' + (Math.round(screen.width / 11) > 120 ? 120 : Math.round(screen.width / 11)) + '" readonly>' + JSON.stringify(json.data, null, 2) + '</textarea>' +
					'</div>' +
					'</div>' +

					'</center>';

					resolve(text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1><br>' +
						'<h1>' + json.message + '</h1>');
				}
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	});
}
