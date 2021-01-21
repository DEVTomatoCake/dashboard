function authRedirect() {
  const params = new URLSearchParams(location.search);

  if (!params.has('code') && !getCookie('code')) {
    location.href = 'http://' + location.host + '/login';
  } else if (!getCookie('code')) {
    setCookie('code', params.get('code'), 7);

    if (params.has('guild_id')) {
      setCookie('guild_id', params.get('guild_id'), 1);
      location.href = 'http://' + location.host + '/dashboard?guild=' + params.get('guild_id');
    } else {
      location.href = 'http://' + location.host + '/dashboard';
    }

    if (params.has('permissions')) {
      setCookie('permissions', params.get('permissions'), 1);
    }
  }
}

function redirectIfAuth() {
  if (!getCookie('access_token')) return;
  location.href = 'http://' + location.host + '/dashboard';
}
