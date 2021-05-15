function getCommandsHTML() {
  return new Promise((resolve => {
    getCommands()
      .then(json => {
        if (json.status === 'success') {
          let text = '';
          json.data.forEach(command => {
            text += '' +
              '<h1>' + command.name + '</h1>' +
              '<p>' + command.description + '</p>' +
              '<pre>' + command.usage + '</pre>' +
              '<br/>';
          });

          if (text === '') {
            resolve('' +
              '<h1>Es gibt noch keine Befehle!</h1>');
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
          let text = '<h1>Server: <b>' + json.guilds + '</b></h1><br /><h1>Nutzer: <b>' + json.users + '</b></h1><br /><h1>API-Ping: <b>' + json.apiping + '</b></h1>';

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
          //resolve('' +
          //  '<h1>Serverstatistiken für <b>' + json.name + '</b></h1>' +
          //  '<p>Mitglieder: <b>' + json.member_count + '</b></p>');
          resolve({
            name: json.name
            data: '[' + json.data + ']',
            labels: '"' + json.labels.join("', '") + '"'
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

          json.data.forEach(setting => {
            if (setting.possible === undefined) {
              text += '' +
                '<p>' + setting.help + '</p>' +
                '<input class="setting" size="35" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">' +
                '<br /><br />';
            } else {
              const possible = setting.possible;

              text += '<p>' + setting.help + '</p><select class="setting" id="' + setting.key + '" name="' + setting.key + '">';
              Object.keys(possible).forEach(key => text += '<option value="' + key.replace('_', '') + '" ' + (setting.value === key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>');
              text += '</select><br/><br/>';
            }
          });

          resolve(text + '<button style="cursor: pointer;" onclick="saveSettings();" class="save">Speichern</button>');
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

