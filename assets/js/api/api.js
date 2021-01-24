const baseURL = 'https://tomatenkuchen.free.beeceptor.com/api/';

function get(component, auth) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + component + ((auth && getCookie('token')) ? (component.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(getCookie('token')) : ''))
      .then((data) => {
        data.json()
          .then((json) => {
            console.log('Received Response: URL=' + baseURL + component + ', JSON=' + json);
            resolve(json);
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
  });
}

function getCommands() {
  return new Promise((resolve, reject) => {
    get('commands', false)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getGuilds() {
  return new Promise((resolve, reject) => {
    get('guilds', true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getStats(guild) {
  return new Promise((resolve, reject) => {
    get('stats/' + encodeURIComponent(guild), true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getSettings(guild) {
  return new Promise((resolve, reject) => {
    get('settings/get/' + encodeURIComponent(guild), true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function setSettings(guild, settings) {
  return new Promise((resolve, reject) => {
    get('settings/set/' + encodeURIComponent(guild) + '?' + encodeURIComponent(settings).replace(',', '&'), true)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
}

function login(code) {
  return new Promise((resolve, reject) => {
    get('auth/login?code=' + encodeURIComponent(code), false)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function logout() {
  return new Promise((resolve, reject) => {
    get('auth/logout', true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}
