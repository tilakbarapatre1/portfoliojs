/**
 * TILAK BARAPATRE — MAIN APPLICATION SCRIPT
 * Orchestrator for scroll reveals, navigation, clipboard actions, and UX polish
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
  initScrollReveal();
  initClipboardToast();
  initMobileMenu();
});

/* ==========================================================================
   1. SCROLL SPY & FLOATING DOCK ACTIVE STATE
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
}

/* ==========================================================================
   2. INTERSECTION OBSERVER FOR SCROLL REVEALS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   3. COPY TO CLIPBOARD EMAIL TOAST
   ========================================================================== */
function initClipboardToast() {
  const copyBtn = document.getElementById('copy-email-trigger');
  const toast = document.getElementById('copy-toast');
  const emailText = 'tilakbarapatre@gmail.com'; // Tilak's official direct contact handle

  if (!copyBtn || !toast) return;

  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailText).then(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
    }).catch(() => {
      // Fallback
      prompt('Copy email address:', emailText);
    });
  });
}

/* ==========================================================================
   4. MOBILE NAVIGATION TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinksContainer) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = navLinksContainer.classList.toggle('mobile-open');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Close when clicking a link
  navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('mobile-open');
    });
  });
}
