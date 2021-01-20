const baseURL = 'http://136.243.92.96:7025/api/';

function get(component, auth) {
  return new Promise(((resolve, reject) => {
    fetch(baseURL + component + (auth ? '?token=' + getCookie('access_token') : ''))
      .then((data) => {
        data.text()
          .then((text) => {
            resolve(JSON.parse(text));
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  }));
}

function getChangelog() {
  return new Promise((((resolve, reject) => {
    get('changelog', false)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  })));
}

function getCommands() {
  return new Promise((((resolve, reject) => {
    get('commands', false)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  })));
}

function getGuilds() {
  return new Promise((((resolve, reject) => {
    get('guilds', true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  })));
}

function getSettings(guild) {
  return new Promise((((resolve, reject) => {
    get('settings/get/' + guild, true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  })));
}

function getStats(guild) {
  return new Promise((((resolve, reject) => {
    get('stats/' + guild, true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  })));
}

function setSettings(guild, settings) {
  return new Promise((((resolve, reject) => {
    get('settings/set/' + guild + '?' + settings.replace(',', '&'))
      .then(() => resolve())
      .catch((error) => reject(error));
  })));
}
