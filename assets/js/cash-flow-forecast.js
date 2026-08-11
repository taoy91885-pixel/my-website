// Scroll spy
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 100) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// Module accordion
function toggleModule(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.module-card').forEach(c => {
    c.classList.remove('open');
    c.querySelector('.module-header')?.setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) {
    card.classList.add('open');
    card.querySelector('.module-header')?.setAttribute('aria-expanded', 'true');
  }
}

// Open first module by default
document.addEventListener('DOMContentLoaded', () => {
  const firstModule = document.querySelector('.module-card');
  firstModule?.classList.add('open');
  firstModule?.querySelector('.module-header')?.setAttribute('aria-expanded', 'true');
});

// Animate bars on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => bar.style.width = w, 100);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.suff-table').forEach(t => observer.observe(t));
