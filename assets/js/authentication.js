function authRedirect() {
  const params = new URLSearchParams(window.location.search);
  let href;

  if (!params.has('code') && !getCookie('access_token')) {
    href = 'https://' + location.host + '/login';
  } else {
    setCookie('access_token', params.get('code'), 7);

    if (params.has('guild_id')) {
      href = 'https://' + location.host + '/dashboard?guild=' + params.get('guild_id');
    } else {
      href = 'https://' + location.host + '/dashboard';
    }
  }

  console.log('Would be redirecting to ' + href + '!');
}

function redirectIfAuth() {
  if (!getCookie('access_token')) return;
  location.href = 'https://' + location.host + '/dashboard';
}
