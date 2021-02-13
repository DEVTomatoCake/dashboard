window.addEventListener('scroll', function () {
  const header = document.querySelector('header');
  if (header) header.classList.toggle('sticky', window.scrollY > 0);
});

window.addEventListener('load', function () {
  const about = document.getElementById('about');
  if (!about) return;

  if (screen.height > 720) {
    setTimeout(() => fadeIn(about), 250);
  } else {
    about.remove();
  }
});

function hideMenu() {
  document.querySelector('.menu-toggle').classList.remove('active');
  document.querySelector('.navigation').classList.remove('active');
}

function toggleMenu() {
  document.querySelector('.menu-toggle').classList.toggle('active');
  document.querySelector('.navigation').classList.toggle('active');
}

function fadeOut(element) {
  if (!element) return;
  if (!element.style.opacity) element.style.opacity = 1;

  element.style.opacity = parseFloat(element.style.opacity) - 0.05;
  if (element.style.opacity >= 0) setTimeout(() => fadeOut(element), 25);
  else element.remove();
}

function fadeIn(element) {
  if (!element) return;
  if (!element.style.opacity) element.style.opacity = 0;

  element.style.opacity = parseFloat(element.style.opacity) + 0.05;
  if (element.style.opacity < 1) setTimeout(() => fadeIn(element), 25);
}
