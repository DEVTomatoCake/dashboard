function getCommandsHTML() {
  return new Promise((resolve => {
    getCommands()
      .then(json => {
        if (json.status === 'success') {
          let text = '';
          var categories = [];
          var categoryData = [];

          json.data.forEach(command => {
            temp = '' +
              '<h1>' + command.name + '</h1>' +
              '<p>' + command.description + '</p>' +
              '<pre>' + command.usage + '</pre>' +
              '<br/>';
            if (command.category && !categories.includes(command.category)) categories.push(command.category)
            if (command.category) categoryData.push([command.category, temp])
          });

          categories.forEach(category => {
            text += '<h1 id="' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</h1><br><br>';
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
          let text = '<h1>Server: <b>' + json.guilds + '</b></h1><br><h1>Nutzer: <b>' + json.users + '</b></h1><br><h1>API-Ping: <b>' + json.apiping + '</b></h1>';

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
              temp += '' +
                '<p>' + setting.help + '</p>' +
                '<input class="setting" size="35" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">' +
                '<br><br>';
            } else {
              const possible = setting.possible;

              temp += '<p>' + setting.help + '</p><select class="setting" id="' + setting.key + '" name="' + setting.key + '">';
              Object.keys(possible).forEach(key => temp += '<option value="' + key.replace('_', '') + '" ' + (setting.value === key.replace('_', '') ? 'selected' : '') + '>' + possible[key] + '</option>');
              temp += '</select><br><br>';
            }
            if (setting.category && !categories.includes(setting.category)) categories.push(setting.category)
            if (setting.category) categoryData.push([setting.category, temp])
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
    getSettings(guild)
      .then(json => {
        if (json.status === 'success') {
          let text = '';

          json.data.forEach(setting => {
            text += '' +
              '<p>' + setting.help + '</p>' +
              '<input class="setting" size="45" id="' + setting.name + '" name="' + setting.name + '" value="' + setting.value + '">' +
              '<br><br>';
          });

          resolve('<h1>Customcommands von <b>' + json.name + '</b></h1>' + text);
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

