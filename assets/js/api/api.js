const url = 'https://node2.chaoshosting.tk:25508/api/';

async function get(component, auth) {
  while (true) {
    const response = await fetch(url + component + ((auth && getCookie('token')) ? (component.includes('?') ? '&' : '?') + 'token=' + getCookie('token') : ''));

    if (response.status !== 429) {
      const json = await response.json();
      console.log('Response for \'' + url + component + '\': ' + JSON.stringify(json));
      return json;
    }
  }
}

function getCommands() {
  return new Promise((resolve, reject) => {
    get('commands', false)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getBotstats() {
  return new Promise((resolve, reject) => {
    get('stats', false)
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
    get('stats/' + guild, true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function getSettings(guild) {
  return new Promise((resolve, reject) => {
    get('settings/get/' + guild, true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

function setSettings(guild, settings) {
  return new Promise((resolve, reject) => {
    get('settings/set/' + guild + settings, true)
      .then((data) => resolve(data))
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

function getLeaderboard(guild) {
  return new Promise((resolve, reject) => {
    get('leaderboard/' + guild, true)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}
