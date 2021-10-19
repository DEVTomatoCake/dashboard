window.addEventListener('scroll', function () {
  const header = document.querySelector('header');
  if (header) header.classList.toggle('sticky', window.scrollY > 0);
});

function aboutVisibility() {
  const about = document.getElementById('about');
  if (!about) return;

  if (screen.height > 720) {
    setTimeout(() => fadeIn(about), 250);
  } else {
    about.remove();
  }
}

function hideMenu() {
  document.querySelector('.menu-toggle').classList.remove('active');
  document.querySelector('.navigation').classList.remove('active');
}

function toggleMenu() {
  document.querySelector('.menu-toggle').classList.toggle('active');
  document.querySelector('.navigation').classList.toggle('active');
}
