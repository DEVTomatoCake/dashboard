window.addEventListener('scroll', function () {
    document.querySelector('header').classList.toggle('sticky', window.scrollY > 0)
})

function toggleMenu() {
  document.querySelector('.menu-toggle').classList.toggle('active')
  document.querySelector('.navigation').classList.toggle('active')
}
