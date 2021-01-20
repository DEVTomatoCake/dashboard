function authRedirect() {
  const params = new URLSearchParams(location.search);

  if (!params.has('code') && !getCookie('access_token')) {
    location.href = 'http://' + location.host + '/login';
  } else if (!getCookie('access_token')) {
    setCookie('code', params.get('code'), 7);

    if (params.has('guild_id')) {
      location.href = 'http://' + location.host + '/dashboard?guild=' + params.get('guild_id');
    } else {
      location.href = 'http://' + location.host + '/dashboard';
    }
  }
}

function redirectIfAuth() {
  if (!getCookie('access_token')) return;
  location.href = 'http://' + location.host + '/dashboard';
}
