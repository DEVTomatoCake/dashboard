const pureCookieTitle = "Information";
const pureCookieDescription = "Unsere Website nutzt Cookies, um bestmögliche Funktionalität bieten zu können.";
const pureCookieButton = "Verstanden";

function pureFadeIn(elementId, display) {
  const element = document.getElementById(elementId);
  element.style.opacity = '0';
  element.style.display = display || "block";

  (function fade() {
    let opacity = parseFloat(element.style.opacity).toString();

    if (!((opacity += .02) > 1)) {
      element.style.opacity = opacity;
      requestAnimationFrame(fade);
    }
  })()
}

function pureFadeOut(elementId) {
  const element = document.getElementById(elementId);
  element.style.opacity = '1';

  (function fade() {
    if ((element.style.opacity -= '0.02') < 0) {
      element.style.display = "none"
    } else {
      requestAnimationFrame(fade)
    }
  })()
}

function setCookie(name, value, days) {
  let expires = "";

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = "; expires=" + date.toUTCString()
  }

  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];

    while (cookie.charAt(0) === " ") cookie = cookie.substring(1, cookie.length);
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length)
  }

  return null;
}

function deleteCookie(name) {
  document.cookie = name+'=; Max-Age=-99999999;'
}

function cookieConsent() {
  if (getCookie('pureCookieDismiss')) return;

  document.body.innerHTML += '' +
    '<div class="cookieConsentContainer" id="cookieConsentContainer">' +
    '<div class="cookieTitle">' +
    '<a>' + pureCookieTitle + '</a>' +
    '</div>' +
    '<div class="cookieDesc">' +
    '<p>' + pureCookieDescription + '</p>' +
    '</div>' +
    '<div class="cookieButton">' +
    '<a onClick="pureCookieDismiss();">' + pureCookieButton + '</a>' +
    '</div>' +
    '</div>';

  pureFadeIn("cookieConsentContainer");
}

function pureCookieDismiss() {
  setCookie('pureCookieDismiss', '1', 7)
  pureFadeOut("cookieConsentContainer")
}

window.onload = function () {
  cookieConsent()
}
