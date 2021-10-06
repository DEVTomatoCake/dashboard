function getCommandsHTML() {
  return new Promise((resolve => {
    getCommands()
      .then(json => {
        if (json.status === 'success') {
          let text = '<input type="text" id="cmdSearch" onkeyup="cmdSearch()" placeholder="Befehl suchen...">';
          var categories = [];
          var categoryData = [];

          json.data.forEach(command => {
            temp = '' +
              '<div class="command">' +
              '<p style="color: gold; font-size: 1.7em;">' + command.name + '</p>' +
              '<p>' + command.description + '</p>';

            if (command.name != command.usage) temp += '<pre>' + command.usage + '</pre>';
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  }));
}

function getBotstatsHTML() {
  return new Promise((resolve => {
    getBotstats()
      .then(json => {
          let text = '<h1>Server: <b>' + json.guilds + '</b></h1><br><h1>Nutzer: <b>' + json.users + '</b></h1><br><h1>API-Ping: <b>' + json.apiping + '</b></h1><br><h1>Befehle: <b>' + json.commands + '</b></h1><br><h1>Gestartet: <b>' + luxon.DateTime.fromMillis(Date.now() - json.uptime, {locale: "de-DE"}).toRelative() + '</b></h1>';
          if (text === '') {
            resolve('' +
              '<h1>Es gibt keine Stats!</h1>');
          } else {
            resolve(text);
          }
      })
      .catch(error => {
        console.error(error);
        resolve('' +
          '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

function getGuildsHTML() {
  return new Promise(resolve => {
    const noRow = screen.height <= 720;

    getGuilds()
      .then(json => {
        if (json.status === 'success') {
          let text = '';
          json.data.forEach(guild => {
            text += '' +
              (noRow ? '' : '<div class="column">') +
              '<div class="container">' +
              '<a class="guild" href="' + (guild.activated ? '' : '../invite') + '?guild=' + guild.id + '">' +
              '<img class="image" alt="' + guild.id + '" title="' + guild.name + '" src="' + guild.icon + '">' +
              '<div class="middle">' +
              '<div class="text">' + guild.name + '</div>' +
              '</div>' +
              '</a>' +
              '</div>' +
              (noRow ? '' : '</div>');
          });

          if (text === '') {
            resolve('' +
              '<h1>Es wurden keine Server von dir gefunden!</h1>');
          } else {
            resolve('' +
              (noRow ? '' : '<div class="columnrow">') +
              '<div' + (noRow ? ' style="left: 37.5%; position: absolute;"' : '') + '>' + text + '</div>' +
              (noRow ? '' : '</div>'));
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
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
              if (setting.key == "maxMentions") temp += '' +
                '<p>' + setting.help + '</p>' +
                '<input type="number" min="0" class="setting" size="35" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">';
              else temp += '' +
                '<p>' + setting.help + '</p>' +
                '<input class="setting" size="35" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">';
            } else {
              const possible = setting.possible;

              temp += '<p>' + setting.help + '</p><select class="setting" id="' + setting.key + '" name="' + setting.key + '">';
              Object.keys(possible).forEach(key => temp += '<option value="' + key.replace('_', '') + '" ' + (setting.value === key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>');
              temp += '</select>';
            }
            if (setting.category && !categories.includes(setting.category)) categories.push(setting.category)
            if (setting.category) categoryData.push([setting.category, temp + '<br><br>'])
          });

          categories.forEach(category => {
            text += '<h2 id="' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</h2>';
            categoryData.forEach(data => {
              if (category == data[0]) text += data[1]
            })
          })

          resolve('<h1>Einstellungen von <b>' + json.name + '</b></h1>' + text);
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
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
                '<textarea class="setting" rows="8" cols="65" id="' + setting.name + '" maxlength="4000" name="' + setting.name + '">' + setting.value + '</textarea>' +
                '<br>';
            } else {
              text += '' +
                '<p><b>' + setting.name + '</b></p>' +
                '<textarea class="setting" rows="3" cols="65" id="' + setting.name + '" maxlength="4000" name="' + setting.name + '">' + setting.value + '</textarea>' +
                '<br>';
            }
          });

          resolve('<h1>Customcommands von <b>' + json.name + '</b></h1><h2>Wenn du ein Feld leer lässt wird der Customcommand gelöscht.</h2><button onclick="createCustomcommand()">Customcommand erstellen</button><br><br>' + text);
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

function getLeaderboardHTML(guild) {
  return new Promise(resolve => {
    getLeaderboard(guild)
      .then(json => {
        if (json.status === 'success') {
          let text = '<h1>Das Leaderboard von ' + json.guild + '</h1>';
          json.data.forEach((entry) => text += '<p>' + entry.place + '. <img class="user-image" src="' + entry.avatar + '" alt="' + entry.place + '">' + entry.user + ' <b>' + entry.points + '</b> Punkte (Level <b>' + entry.level + '</b>)</p>');
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
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

