function authRedirect() {
  const params = new URLSearchParams(location.search);

  if (!params.has('code') && !getCookie('access_token')) {
    location.href = 'https://' + location.host + '/login';
  } else if (!getCookie('access_token')) {
    setCookie('access_token', params.get('code'), 7);

    if (params.has('guild_id')) {
      location.href = 'https://' + location.host + '/dashboard?guild=' + params.get('guild_id');
    } else {
      location.href = 'https://' + location.host + '/dashboard';
    }
  }
}

function redirectIfAuth() {
  if (!getCookie('access_token')) return;
  location.href = 'https://' + location.host + '/dashboard';
}
