function authRedirect() {
  if (getCookie('access_token')) return;
  location.href = 'https://' + location.host + '/invite';
}

function redirectAuth() {
  if (!getCookie('access_token')) return;
  location.href = 'https://' + location.host + '/dashboard';
}
