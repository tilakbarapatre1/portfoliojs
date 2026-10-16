/**
 * TILAK BARAPATRE — PORTFOLIO MAGNETIC CURSOR
 * Warm Coral Motion & Micro-Interactions
 */

(function () {
  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursorDot = document.querySelector('.cursor-dot');
  const cursorFollower = document.querySelector('.cursor-follower');

  if (!cursorDot || !cursorFollower) return;

  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Elastic trailing physics
  function animateCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;

    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;

    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);

  // Attach hover expand listeners
  function attachHoverEffects() {
    const interactiveElements = document.querySelectorAll(
      'a, button, .h-project-card, .partner-item, .card-arrow-btn, .social-circle-btn, .tool-btn, .ip-badge'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorFollower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorFollower.classList.remove('hovering');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHoverEffects);
  } else {
    attachHoverEffects();
  }
})();
