document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.gallery-track');
  const prevBtn = document.querySelector('.nav-btn.prev');
  const nextBtn = document.querySelector('.nav-btn.next');

  const getGap = () => {
    if (!track) return 0;
    const style = getComputedStyle(track);
    const candidates = [style.columnGap, style.gap];
    for (const value of candidates) {
      const gap = Number.parseFloat(value);
      if (!Number.isNaN(gap)) return gap;
    }
    return 0;
  };

  const getStep = () => {
    if (!track) return 300;
    const card = track.querySelector('.gallery-card');
    if (!card) return Math.max(track.clientWidth * 0.6, 200);
    return card.getBoundingClientRect().width + getGap();
  };

  const clampScroll = (target) => {
    if (!track) return 0;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    return Math.min(Math.max(0, target), maxScroll);
  };

  const updateNavState = () => {
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const current = track.scrollLeft;
    if (prevBtn) prevBtn.disabled = current <= 4;
    if (nextBtn) nextBtn.disabled = current >= maxScroll - 4;
  };

  const scrollByStep = (direction) => {
    if (!track) return;
    const step = getStep();
    if (!step) return;
    const target = clampScroll(track.scrollLeft + direction * step);
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left: target, behavior: 'smooth' });
    } else {
      track.scrollLeft = target;
    }
  };

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByStep(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByStep(1));

  if (track) {
    updateNavState();
    track.addEventListener('scroll', updateNavState);
    window.addEventListener('resize', () => {
      const currentBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      updateNavState();
      requestAnimationFrame(() => {
        track.style.scrollBehavior = currentBehavior || 'smooth';
      });
    });
  }

  // Lightbox
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImg = lightbox?.querySelector('.gallery-lightbox__img');
  const lightboxCaption = lightbox?.querySelector('.gallery-lightbox__caption');
  const closeBtn = lightbox?.querySelector('.gallery-lightbox__close');

  const openLightbox = (imgEl) => {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    const title = imgEl.dataset.title || imgEl.alt || 'Imagen';
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = title;
    lightboxCaption.textContent = title;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!lightbox.classList.contains('is-open')) {
        lightbox.hidden = true;
      }
    }, 200);
  };

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  track?.querySelectorAll('img').forEach((imgEl) => {
    imgEl.addEventListener('click', () => openLightbox(imgEl));
  });
});
