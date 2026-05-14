/* ── INTRO SCREEN ── */
(function initIntro() {
  const INTRO_KEY = 'intro_shown';

  if (sessionStorage.getItem(INTRO_KEY)) {
    const s = document.getElementById('introScreen');
    if (s) s.remove();
    return;
  }

  document.body.style.overflow = 'hidden';

  const screen      = document.getElementById('introScreen');
  const numberEl    = document.getElementById('introNumber');
  const progressBar = document.getElementById('introProgressBar');

  let count = 5;

  numberEl.style.animation = 'introNumIn 0.95s cubic-bezier(0.4, 0, 0.2, 1) forwards';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { progressBar.style.width = '100%'; });
  });

  const ticker = setInterval(() => {
    count--;
    if (count < 0) {
      clearInterval(ticker);
      showWelcome();
      return;
    }
    numberEl.textContent = count;
    numberEl.style.animation = 'none';
    void numberEl.offsetWidth;
    numberEl.style.animation = 'introNumIn 0.95s cubic-bezier(0.4, 0, 0.2, 1) forwards';
  }, 1000);

  function showWelcome() {
    numberEl.textContent = '¡Bienvenidos!';
    numberEl.classList.add('intro-welcome');
    numberEl.style.animation = 'none';
    void numberEl.offsetWidth;
    numberEl.style.animation = 'introWelcomeIn 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(triggerSplit, 1400);
  }

  function triggerSplit() {
    setTimeout(() => {
      screen.classList.add('splitting');
      setTimeout(() => {
        screen.remove();
        document.body.style.overflow = '';
        sessionStorage.setItem(INTRO_KEY, '1');
        window.dispatchEvent(new CustomEvent('introComplete'));
      }, 750);
    }, 300);
  }
})();

/* ── Hero Character Split Reveal ── */
(function initHeroSplit() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  title.classList.remove('reveal-up');

  const nodes = Array.from(title.childNodes);
  title.innerHTML = '';
  let idx = 0;

  nodes.forEach(node => {
    if (node.nodeName === 'BR') {
      title.appendChild(document.createElement('br'));
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const cleaned = node.textContent.replace(/^\s*\n\s*/, '').replace(/\s*\n\s*$/, '');
      [...cleaned].forEach(char => {
        if (!char.trim()) {
          title.appendChild(document.createTextNode(' '));
          return;
        }
        const wrap = document.createElement('span');
        wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
        const inner = document.createElement('span');
        inner.className = 'char';
        inner.style.transitionDelay = (idx++ * 50) + 'ms';
        inner.textContent = char;
        wrap.appendChild(inner);
        title.appendChild(wrap);
      });
    } else {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-right:15px;margin-right:-15px;';
      const inner = document.createElement('span');
      inner.className = 'char';
      inner.style.transitionDelay = (idx++ * 50) + 'ms';
      inner.appendChild(node.cloneNode(true));
      wrap.appendChild(inner);
      title.appendChild(wrap);
    }
  });

  function reveal() {
    requestAnimationFrame(() => title.classList.add('chars-ready'));
  }

  if (!sessionStorage.getItem('intro_shown')) {
    window.addEventListener('introComplete', reveal, { once: true });
  } else {
    setTimeout(reveal, 150);
  }
})();

/* ── Cursor personalizado ── */
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

const hoverTargets = 'a, button, .service-card, .gallery-item, .dot';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── Navbar scroll + glitch logo ── */
const navbar = document.getElementById('navbar');
let hasGlitched = false;
window.addEventListener('scroll', () => {
  const isScrolled = window.scrollY > 60;
  const wasScrolled = navbar.classList.contains('scrolled');
  navbar.classList.toggle('scrolled', isScrolled);
  if (isScrolled && !wasScrolled && !hasGlitched) {
    hasGlitched = true;
    const logoMain = navbar.querySelector('.logo-main');
    if (logoMain) {
      logoMain.classList.add('glitch-once');
      logoMain.addEventListener('animationend', () => logoMain.classList.remove('glitch-once'), { once: true });
    }
  }
}, { passive: true });

/* ── Hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navClose  = document.getElementById('navClose');

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navClose.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Stat counter ── */
const counterEls = document.querySelectorAll('.stat-number[data-target]');

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Testimonials carousel ── */
const slides = document.querySelectorAll('.testimonial-slide');
const dots   = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let current = 0;

function goToSlide(index) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (index + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

prevBtn.addEventListener('click', () => goToSlide(current - 1));
nextBtn.addEventListener('click', () => goToSlide(current + 1));

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goToSlide(i));
});

/* Auto-advance every 5s */
let autoSlide = setInterval(() => goToSlide(current + 1), 5000);

[prevBtn, nextBtn, ...dots].forEach(el => {
  el.addEventListener('click', () => {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goToSlide(current + 1), 5000);
  });
});

/* ── Lightbox ── */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');

const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
let lightboxIndex  = 0;
let lightboxVid    = null;

function getLightboxVid() {
  if (!lightboxVid) {
    lightboxVid = document.createElement('video');
    lightboxVid.className = 'lightbox-vid';
    lightboxVid.controls = true;
    lightbox.insertBefore(lightboxVid, lightboxClose);
  }
  return lightboxVid;
}

function setLightboxContent(index) {
  const item    = galleryItems[index];
  const isVideo = item.dataset.type === 'video';
  const vid     = getLightboxVid();

  if (isVideo) {
    vid.src = item.querySelector('video').src;
    vid.style.display = 'block';
    lightboxImg.style.display = 'none';
  } else {
    vid.pause();
    vid.src = '';
    vid.style.display = 'none';
    const img = item.querySelector('.gallery-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxImg.style.display = 'block';
  }
  lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
}

function openLightbox(index) {
  lightboxIndex = index;
  setLightboxContent(index);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (lightboxVid) { lightboxVid.pause(); lightboxVid.src = ''; lightboxVid.style.display = 'none'; }
  lightboxImg.style.display = 'block';
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
  setLightboxContent(lightboxIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => shiftLightbox(-1));
lightboxNext.addEventListener('click', () => shiftLightbox(1));

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   shiftLightbox(-1);
  if (e.key === 'ArrowRight')  shiftLightbox(1);
});

/* ── Magnetic Buttons ── */
if (window.matchMedia('(pointer: fine)').matches) {
  const magnetBtns = Array.from(document.querySelectorAll('.btn-gold, .btn-outline'));
  document.addEventListener('mousemove', e => {
    magnetBtns.forEach(btn => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 90) {
        btn.style.transform  = `translate(${dx * 0.32}px, ${dy * 0.32}px)`;
        btn.style.transition = 'transform 0.1s ease';
      } else if (btn.style.transform) {
        btn.style.transform  = '';
        btn.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    });
  });
}

/* ── Card Tilt 3D ── */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.service-card').forEach(card => {
    const icon  = card.querySelector('.card-icon');
    const title = card.querySelector('.card-title');

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      const rx = -y * 9;
      const ry =  x * 9;
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.transition = 'transform 0.08s ease';
      if (icon)  icon.style.transform  = `translate(${ry * 0.6}px, ${-rx * 0.6}px) rotate(15deg)`;
      if (title) title.style.transform = `translate(${ry * 0.3}px, ${-rx * 0.3}px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
      if (icon)  { icon.style.transform  = ''; icon.style.transition  = 'transform 0.65s ease'; }
      if (title) { title.style.transform = ''; title.style.transition = 'transform 0.65s ease'; }
    });
  });
}

/* ── Section Wipe Curtain ── */
const sectionWipeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('wipe-visible');
      sectionWipeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.section').forEach(s => sectionWipeObserver.observe(s));

/* ── Marquee Speed Throttle ── */
const marqueeStrip = document.querySelector('.marquee-strip');
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeStrip && marqueeTrack) {
  marqueeStrip.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationDuration = '90s';
  });
  marqueeStrip.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationDuration = '';
  });
}

/* ── Parallax hero (suave) ── */
const heroBg = document.querySelector('.hero-bg-pattern');
window.addEventListener('scroll', () => {
  const offset = window.scrollY;
  if (heroBg && offset < window.innerHeight) {
    heroBg.style.transform = `translateY(${offset * 0.3}px)`;
  }
}, { passive: true });
