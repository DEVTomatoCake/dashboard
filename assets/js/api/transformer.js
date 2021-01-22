function getCommandsHTML() {
  return new Promise(((resolve) => {
    getCommands()
      .then((data) => {
        const json = JSON.parse(data);
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
              '<h1>At the moment, no registered commands exits!</h1>');
          } else {
            resolve(text);
          }
        } else {
          resolve('' +
            '<h1>There was an error while processing the api request!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);

        resolve('' +
          '<h1>There was an error while processing the api request!</h1>' +
          '<h1>Look into your browser console for more info!</h1>');
      });
  }));
}

function getGuildsHTML() {
  return new Promise((resolve) => {
    getGuilds()
      .then((data) => {
        const json = JSON.parse(data);
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
              '<h1>I didn\'t find you on any guilds!</h1>');
          } else {
            resolve('' +
              '<div class="columnrow">' +
              '<div style="text-align: center;">' + text + '</div>' +
              '</div>');
          }
        } else {
          resolve('' +
            '<h1>There was an error while processing the api request!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);

        resolve('' +
          '<h1>There was an error while processing the api request!</h1>' +
          '<h1>Look into your browser console for more info!</h1>');
      });
  });
}

function getStatsHTML(guild) {
  return new Promise((resolve) => {
    getStats(guild)
      .then((data) => {
        const json = JSON.parse(data);
        if (json.status === 'success') {
          resolve('' +
            '<h1>Serverstatistiken für <b>' + data.name + '</b></h1>' +
            '<p>Mitglieder: <b>' + guild.member_count + '</b></p>');
        } else {
          resolve('' +
            '<h1>There was an error while processing the api request!</h1>' +
            '<h1>' + json.message + '</h1>');
        }
      })
      .catch((error) => {
        console.error(error);

        resolve('' +
          '<h1>There was an error while processing the api request!</h1>' +
          '<h1>Look into your browser console for more info!</h1>');
      });
  });
}
