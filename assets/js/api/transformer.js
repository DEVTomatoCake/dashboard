function getCommandsHTML() {
  return new Promise(((resolve) => {
    getCommands()
      .then((json) => {
        if (json.status === 'success') {
          let text = '';
          json.data.forEach((command) => {
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
      .catch((error) => {
        console.error(error);
        resolve('' +
          '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  }));
}

function getGuildsHTML() {
  return new Promise((resolve) => {
    getGuilds()
      .then((json) => {
        if (json.status === 'success') {
          let text = '';
          json.data.forEach((guild) => {
            text += '' +
              '<div class="column">' +
              '<div class="container">' +
              '<a class="guild" href="?guild=' + guild.id + '">' +
              '<img class="image" alt="' + guild.id + '" title="' + guild.name + '" src="' + guild.icon + '">' +
              '<div class="middle">' +
              '<div class="text">' + guild.name + '</div>' +
              '</div>' +
              '</a>' +
              '</div>' +
              '</div>';
          });

          if (text === '') {
            resolve('' +
              '<h1>Es wurden keine Server von dir gefunden!</h1>');
          } else {
            resolve('' +
              '<div class="columnrow">' +
              '<div style="text-align: center;">' + text + '</div>' +
              '</div>');
          }
        } else {
          resolve('' +
            '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);
        resolve('' +
          '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

function getStatsHTML(guild) {
  return new Promise((resolve) => {
    getStats(guild)
      .then((json) => {
        if (json.status === 'success') {
          resolve('' +
            '<h1>Serverstatistiken für <b>' + json.name + '</b></h1>' +
            '<p>Mitglieder: <b>' + guild.member_count + '</b></p>');
        } else {
          resolve('' +
            '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);
        resolve('' +
          '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

function getSettingsHTML(guild) {
  return new Promise((resolve) => {
    getSettings(guild)
      .then((json) => {
        if (json.status === 'success') {
          let text = '';
          json.data.forEach((setting) => {
            text += '' +
              '<p>' + setting.help + '</p>' +
              '<input class="setting" size="35" id="' + setting.key + '" name="' + setting.key + '" value="' + setting.value + '">' +
              '<br/><br/>';
          });

          resolve(text + '<button style="cursor: pointer;" onclick="saveSettings();" class="save">Speichern</button>');
        } else {
          resolve('' +
            '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);
        resolve('' +
          '<h1>Es gab einen Fehler beim Verarbeiten der API-Abfrage!</h1>' +
          '<h1>Guck in deine Browser Konsole, um mehr zu erfahren!</h1>');
      });
  });
}

