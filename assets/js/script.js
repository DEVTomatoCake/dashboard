window.addEventListener('scroll', function () {
  document.querySelector('header').classList.toggle('sticky', window.scrollY > 0)
})

function toggleMenu() {
  document.querySelector('.menu-toggle').classList.toggle('active')
  document.querySelector('.navigation').classList.toggle('active')
}

function fadeOut(element) {
  element.style.opacity -= 0.05;
  if (element.style.opacity >= 0) setTimeout(() => fadeOut(element), 25);
  else element.remove();
}

function fadeIn(element) {
  element.style.opacity = parseFloat(element.style.opacity) + 0.05;
  if (element.style.opacity < 1) setTimeout(() => fadeIn(element), 25);
}
