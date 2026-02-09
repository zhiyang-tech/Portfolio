/* ===================================================
   Ng Zhi Yang — Portfolio  |  script.js
   GSAP + ScrollTrigger + Canvas + Custom Cursor
   =================================================== */

// Register GSAP plugins FIRST before anything else
gsap.registerPlugin(ScrollTrigger);

// ——————————— LOADER ———————————
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    gsap.to(loader, {
        opacity: 0, duration: 0.6, delay: 1.6, ease: 'power2.inOut',
        onComplete: () => {
            loader.classList.add('hidden');
            // Init scroll animations AFTER loader is gone so triggers calculate correctly
            initScrollAnimations();
        }
    });
    initHeroAnimations();
});

// ——————————— CUSTOM CURSOR ———————————
(() => {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    let mx = -100, my = -100, dx = -100, dy = -100;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    // Use event delegation for hover effect (handles dynamic elements too)
    document.addEventListener('mouseover', e => {
        if (e.target.closest('a, button, .btn-glow, .btn-ghost, .proj-card, .cert, .contact-card, .award, .stat, .nav-toggle, .testimonial-card, .pdf-modal-close')) {
            ring.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest('a, button, .btn-glow, .btn-ghost, .proj-card, .cert, .contact-card, .award, .stat, .nav-toggle, .testimonial-card, .pdf-modal-close')) {
            ring.classList.remove('hover');
        }
    });

    (function moveCursor() {
        dx += (mx - dx) * 0.15;
        dy += (my - dy) * 0.15;
        dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
        ring.style.transform = `translate(${dx - 18}px, ${dy - 18}px)`;
        requestAnimationFrame(moveCursor);
    })();
})();

// ——————————— SCROLL PROGRESS ———————————
window.addEventListener('scroll', () => {
    const bar = document.getElementById('scrollProgress');
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
});

// ——————————— NAVBAR SCROLL ———————————
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ——————————— MOBILE MENU ———————————
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    // Lock body scroll when menu is open (fixes iPad overlay/scroll bleed)
    document.body.classList.toggle('nav-open', navMenu.classList.contains('open'));

    // Always show menu from the top, regardless of current page scroll
    if (navMenu.classList.contains('open')) {
        navMenu.scrollTop = 0;
    }
});
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.classList.remove('nav-open');
    });
});

// If the screen is resized wider (e.g. iPad rotate), ensure the overlay menu is closed
function syncNavOnResize() {
    // Keep in sync with the CSS breakpoint used for the overlay nav
    const OVERLAY_BREAKPOINT = 1600;
    if (window.innerWidth > OVERLAY_BREAKPOINT) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.classList.remove('nav-open');
    }
}
window.addEventListener('resize', syncNavOnResize);
window.addEventListener('orientationchange', syncNavOnResize);

// ——————————— SIDE NAV ACTIVE ———————————
const sections = document.querySelectorAll('section');
const sideDots = document.querySelectorAll('.side-dot');
const observerOptions = { rootMargin: '-40% 0px -50% 0px' };
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            sideDots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + id));
        }
    });
}, observerOptions);
sections.forEach(s => sectionObserver.observe(s));

// ——————————— HERO PARTICLE CANVAS ———————————
(() => {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], mouse = { x: -999, y: -999 };
    const PARTICLE_COUNT = 70;
    const CONNECT_DIST = 130;

    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.r = Math.random() * 1.8 + 0.8;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
            // mouse repulsion — gentle push
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 0) {
                this.x += (dx / dist) * 0.8;
                this.y += (dy / dist) * 0.8;
            }
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(165,180,252,0.6)'; ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) { p.update(); p.draw(); }
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < CONNECT_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(165,180,252,${0.2 * (1 - d / CONNECT_DIST)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ——————————— HERO GSAP ANIMATIONS ———————————
function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 1.8 });
    // Name slides up from clip
    tl.from('.hero-name .word', { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.12 })
      // Badge, desc, btns, socials fade in + slide up (use fromTo for explicitness)
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo('.hero-desc',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .fromTo('.hero-btns',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .fromTo('.hero-socials', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
}

// ——————————— TYPING EFFECT ———————————
(() => {
    const roles = [
        'Robotics Developer',
        'Full Stack Developer',
        'AI Enthusiast',
    ];
    const el = document.getElementById('roleText');
    if (!el) return;
    let roleIdx = 0, charIdx = 0, deleting = false;

    function type() {
        const current = roles[roleIdx];
        if (!deleting) {
            el.textContent = current.slice(0, ++charIdx);
            if (charIdx === current.length) { setTimeout(() => { deleting = true; type(); }, 2000); return; }
        } else {
            el.textContent = current.slice(0, --charIdx);
            if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
        }
        setTimeout(type, deleting ? 35 : 65);
    }
    setTimeout(type, 2600);
})();

// ——————————— SCROLL REVEAL ANIMATIONS (called after loader) ———————————
function initScrollAnimations() {
    // Refresh ScrollTrigger after loader hides (layout may have shifted)
    ScrollTrigger.refresh();

    // Single reveal system: animate each .reveal-up element individually
    // This avoids double-animation bugs from staggering parent children too
    gsap.utils.toArray('.reveal-up').forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, y: 40 },
            {
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
                delay: el.parentElement ? Array.from(el.parentElement.children).indexOf(el) * 0.06 : 0
            }
        );
    });

    // Counter animation
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = +el.dataset.count;
        ScrollTrigger.create({
            trigger: el, start: 'top 88%',
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target, duration: 1.4, ease: 'power2.out',
                    onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); }
                });
            }, once: true
        });
    });
}

// ——————————— TILT EFFECT ———————————
// Use a separate wrapper div approach so tilt doesn't overwrite GSAP transforms
document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        // Apply tilt via GSAP so it doesn't fight with other transforms
        gsap.to(card, {
            rotateX: -y * 6, rotateY: x * 6,
            transformPerspective: 700,
            duration: 0.3, ease: 'power2.out', overwrite: 'auto'
        });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0, rotateY: 0,
            duration: 0.5, ease: 'power2.out', overwrite: 'auto'
        });
    });
});

// Note: Native CSS `scroll-behavior: smooth` on the html element
// handles smooth scrolling for anchor links. A custom JS-based
// smooth scroll implementation caused issues on some mobile
// browsers (notably iPad Safari) where lower sections could
// become hard to reach after jumping via nav links, so it has
// been removed in favour of the simpler, more compatible
// CSS-based approach.

// ——————————— PDF MODAL ———————————
(() => {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    const closeBtn = document.getElementById('pdfModalClose');
    if (!modal || !viewer || !closeBtn) return;

    function openPdf(src) {
        viewer.src = encodeURI(src);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePdf() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Delay clearing src so transition finishes
        setTimeout(() => { viewer.src = ''; }, 350);
    }

    closeBtn.addEventListener('click', closePdf);
    modal.addEventListener('click', e => {
        if (e.target === modal) closePdf();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closePdf();
    });

    // Achievement cards with data-pdf
    document.querySelectorAll('.award[data-pdf]').forEach(card => {
        card.addEventListener('click', () => {
            const pdf = card.dataset.pdf;
            if (pdf) openPdf(pdf);
        });
    });

    // Testimonial cards with data-pdf
    document.querySelectorAll('.testimonial-card[data-pdf]').forEach(card => {
        card.addEventListener('click', () => {
            const pdf = card.dataset.pdf;
            if (pdf) openPdf(pdf);
        });
    });

    // Certificate-style cards that open PDFs (education, participation, etc.)
    document.querySelectorAll('.cert[data-pdf]').forEach(card => {
        const open = () => {
            const pdf = card.dataset.pdf;
            if (pdf) openPdf(pdf);
        };

        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });
})();
