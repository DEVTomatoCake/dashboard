function getCommandsHTML() {
	return new Promise((resolve => {
		getCommands()
			.then(json => {
				if (json.status === 'success') {
					let text = '';
					var categories = [];
					var categoryData = [];

					json.data.forEach(command => {
						var temp = '' +
							'<div class="command">' +
							'<p style="color: var(--accent-color); font-size: 1.6em;">' + command.name + '</p>' +
							'<p style="color: var(--primary-text-color);">' + command.description + '</p>';

						if (command.name != command.usage) temp += '<pre style="color: var(--primary-text-color);">' + command.usage + '</pre>';
						temp += '<p style="padding-bottom: 20px;"></p></div>';

						if (command.category && !categories.includes(command.category)) categories.push(command.category)
						if (command.category) categoryData.push([command.category, temp])
					});

					categories.forEach(category => {
						text += '<br><h1 id="' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</h1><br>';
						categoryData.forEach(data => {
							if (category == data[0]) text += data[1]
						})
					})

					if (text === '') {
						resolve('' +
							'<h1>Es gibt keine Befehle!</h1>');
					} else {
						resolve(text);
					}
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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

function getBotstatsHTML() {
	return new Promise((resolve => {
		getBotstats()
			.then(json => {
				let text = '<h1>Server: <b>' + json.guilds + '</b></h1><br><h1>Nutzer: <b>' + json.users + '</b></h1><br><h1>API-Ping: <b>' + json.apiping + '</b></h1><br><h1>Befehle: <b>' + json.commands + '</b></h1><br><h1>Gestartet: <b>' + luxon.DateTime.fromMillis(Date.now() - json.uptime, {
					locale: "de-DE"
				}).toRelative() + '</b></h1>';
				resolve(text);
			})
			.catch(error => {
				console.error(error);
				resolve('' +
					'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
					'<h1>Guck in deine Browserkonsole, um mehr zu erfahren!</h1>');
			});
	}));
}

function getStatsHTML(guild) {
	return new Promise(resolve => {
		getStats(guild)
			.then(json => {
				if (json.status === 'success') {
					resolve({
						name: json.name,
						data: json.data,
						labels: json.labels
					});
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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
				if (json.status === 'success') {
					let text = '';
					json.data.forEach(guild => {
						text += '' +
							'<div class="guilds-container">' +
							'<a class="guild" href="' + (guild.activated ? '' : '../invite/') + '?guild=' + guild.id + '">' +
							'<img class="image" alt="' + guild.id + '" title="' + guild.name + '" src="' + guild.icon + '">' +
							'<div class="middle">' +
							'<div class="text">' + guild.name + '</div>' +
							'</div>' +
							'</a>' +
							'</div>';
					});

					if (text === '') {
						resolve('<h1>Es wurden keine Server von dir gefunden!</h1>');
					} else {
						resolve(text);
					}
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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

function getSettingsHTML(guild) {
	return new Promise(resolve => {
		getSettings(guild)
			.then(json => {
				if (json.status === 'success') {
					let text = '';
					var categories = [];
					var categoryData = [];

					json.data.forEach(setting => {
						temp = '';
						if (!setting.possible) {
							if (setting.key == "maxMentions" || setting.key == "starboardStars") temp += '' +
								'<p>' + setting.help + '</p>' +
								'<input type="number" min="0" max="9999" class="setting" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">';
							else temp += '' +
								'<p>' + setting.help + '</p>' +
								'<input class="setting" size="' + (screen.width > 500 ? 35 : 20) + '" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">';
						} else {
							const possible = setting.possible;

							if (setting.key == "autorole" || setting.key == "disabledLogs") {
								temp += '<p>' + setting.help + '</p><select multiple class="setting" id="' + setting.key + '" name="' + setting.key + '">';
								var selected = [];
								var i = 0;
								console.log(setting.value);
								Object.keys(possible).forEach(key => {
									i++;
									setting.value.split(",").forEach(data => {
										if (data == key.replace('_', '')) selected.push(i);
									});
									if (key != "") temp += '<option value="' + key.replace('_', '') + '">' + possible[key] + '</option>';
									console.log(i, key, selected);
								});
								setTimeout(() => {
									drops.push(new drop({selector: "#" + setting.key, preselected: selected}));
								}, 2000);
							} else {
								temp += '<p>' + setting.help + '</p><select class="setting" id="' + setting.key + '" name="' + setting.key + '">';
								Object.keys(possible).forEach(key => temp += '<option value="' + key.replace('_', '') + '" ' + (setting.value == key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>');
							}
							temp += '</select>';
						}
						if (setting.category && !categories.includes(setting.category)) categories.push(setting.category);
						if (setting.category) categoryData.push([setting.category, temp + '<br><br>']);
					});

					categories.forEach(category => {
						text += '<h2 id="' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</h2><br>';
						categoryData.forEach(data => {
							if (category == data[0]) text += data[1];
						});
					})

					resolve('<center><h1>Einstellungen von <span class="accent">' + json.name + '</span></h1></center>' + text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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

function getCustomcommandsHTML(guild) {
	return new Promise(resolve => {
		getCustomcommands(guild)
			.then(json => {
				if (json.status === 'success') {
					let text = '';

					json.data.forEach(setting => {
						if (setting.value.split("").filter(i => i == "\n").length > 3) {
							text += '' +
								'<p><b>' + setting.name + '</b></p>' +
								'<textarea class="setting" rows="8" cols="65" id="' + setting.name + '" maxlength="2000" name="' + setting.name + '">' + setting.value + '</textarea>' +
								'<br>';
						} else {
							text += '' +
								'<p><b>' + setting.name + '</b></p>' +
								'<textarea class="setting" rows="3" cols="65" id="' + setting.name + '" maxlength="2000" name="' + setting.name + '">' + setting.value + '</textarea>' +
								'<br>';
						}
					});

					if (text == "") text = "<span id='no-cc'><b>Es sind keine Customcommands vorhanden!</b></span>"
					resolve('<center><h1>Customcommands von <span class="accent">' + json.name + '</span></h1></center><h3>Wenn du ein Feld leer lässt wird der Customcommand gelöscht.</h3><button onclick="openForm()">Customcommand erstellen</button><br><br>' + text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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

function getReactionrolesHTML(guild) {
	return new Promise(resolve => {
		getReactionroles(guild)
			.then(json => {
				if (json.status === 'success') {
					let text = '';

					json.data.reactionroles.forEach(setting => {
						if (isNaN(setting.reaction)) text += '<p><b>' + setting.reaction + '</b></p>';
						else text += '<img src="https://cdn.discordapp.com/emojis/' + setting.reaction + '.png?size=32" /><br>';

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
					resolve('<center><h1>Reactionroles von <span class="accent">' + json.name + '</span></h1></center><button onclick="openForm()">Reactionrole erstellen</button><br><br>' + text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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

function getLeaderboardHTML(guild) {
	return new Promise(resolve => {
		getLeaderboard(guild)
			.then(json => {
				if (json.status === 'success') {
					let text = '<h1 class="greeting">Leaderboard von <span class="accent">' + json.guild + '</span></h1>';
					json.data.forEach(entry => text += '<div class="leaderboard"><p>' + entry.place + '. <img class="user-image" src="' + entry.avatar + '?size=32" alt="' + entry.place + '">' + entry.user + ' <b>' + entry.points + '</b> ' + (entry.points == 1 ? 'Punkt' : 'Punkte') + ' (Level <b>' + entry.level + '</b>)</p></div>');
					resolve(text);
				} else {
					resolve('' +
						'<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
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
