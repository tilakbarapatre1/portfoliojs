/**
 * TILAK BARAPATRE — PORTFOLIO CANVAS BACKGROUND
 * Spatial 3D Mathematical Node Constellation & Ambient Field
 * Inspired by Creative 3D Portfolio Architectures
 */

(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouse = { x: -1000, y: -1000, targetX: 0, targetY: 0 };
  let particles = [];
  const PARTICLE_COUNT = 55;
  const CONNECTION_DISTANCE = 140;

  class Particle3D {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = (Math.random() - 0.5) * (width || window.innerWidth) * 1.2;
      this.y = (Math.random() - 0.5) * (height || window.innerHeight) * 1.2;
      this.z = initial ? Math.random() * 800 : 800;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.vz = -(0.3 + Math.random() * 0.5); // move slowly towards screen
      this.baseRadius = 1.2 + Math.random() * 1.8;
      this.color = Math.random() > 0.4 ? 'rgba(139, 92, 246,' : 'rgba(6, 182, 212,';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      // Parallax mouse influence
      this.x += (mouse.targetX * 0.05 - this.x * 0.001);
      this.y += (mouse.targetY * 0.05 - this.y * 0.001);

      if (this.z <= 10) {
        this.reset(false);
      }
    }

    getScreenCoords() {
      const fov = 400;
      const factor = fov / (fov + this.z);
      const screenX = width / 2 + this.x * factor;
      const screenY = height / 2 + this.y * factor;
      const radius = this.baseRadius * factor;
      const alpha = Math.min(1, Math.max(0.1, (1 - this.z / 800) * 0.75));

      return { x: screenX, y: screenY, radius, alpha, factor };
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle3D());
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse lerping
    mouse.targetX += (mouse.x - mouse.targetX) * 0.05;
    mouse.targetY += (mouse.y - mouse.targetY) * 0.05;

    const projected = [];

    // Update and project
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      const proj = p.getScreenCoords();
      projected.push({ p, proj });
    }

    // Draw dynamic connections between nearby nodes
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i].proj;
        const p2 = projected[j].proj;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const depthDiff = Math.abs(projected[i].p.z - projected[j].p.z);
          if (depthDiff < 250) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.18 * ((p1.alpha + p2.alpha) / 2);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(165, 180, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw nodes with glowing core
    for (let i = 0; i < projected.length; i++) {
      const { p, proj } = projected[i];

      // Outer glow
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${proj.alpha * 0.35})`;
      ctx.fill();

      // Sharp central node
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(0.7, proj.radius), 0, Math.PI * 2);
      ctx.fillStyle = `#ffffff`;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX - width / 2) * 0.4;
    mouse.y = (e.clientY - height / 2) * 0.4;
  });

  init();
  requestAnimationFrame(render);
})();
