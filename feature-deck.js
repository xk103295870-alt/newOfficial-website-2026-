/* Feature deck: hovering / tapping a card lifts it out of the box and
   mirrors its title and description into the side panel. */
(function () {
  const cards = [...document.querySelectorAll('.deck-card')];
  const info = document.querySelector('.deck-info');
  const world = document.querySelector('.deck-world');
  const stage = document.querySelector('.deck-stage');
  if (!cards.length || !info) return;

  const infoNum = info.querySelector('.deck-info-num');
  const infoTitle = info.querySelector('.deck-info-title');
  const infoDesc = info.querySelector('.deck-info-desc');

  /* Center the rotated box inside its stage: transformed content extends
     well beyond the world origin, so measure the real bounds and shift. */
  function centerWorld() {
    if (!world || !stage || window.matchMedia('(max-width:760px)').matches) {
      if (world) world.style.transform = '';
      return;
    }
    world.style.transform = 'rotateX(55deg) rotateZ(-38deg)';
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    world.querySelectorAll('.deck-face,.deck-card').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      left = Math.min(left, r.left); top = Math.min(top, r.top);
      right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
    });
    if (left === Infinity) return;
    const s = stage.getBoundingClientRect();
    const dx = s.left + s.width / 2 - (left + right) / 2;
    const dy = s.top + s.height / 2 - (top + bottom) / 2;
    world.style.transform = `translate(${dx}px,${dy}px) rotateX(55deg) rotateZ(-38deg)`;
  }

  window.addEventListener('resize', centerWorld);
  window.addEventListener('load', centerWorld);
  centerWorld();

  function render(card) {
    const title = card.querySelector('.deck-label');
    const desc = card.querySelector('.deck-desc');
    const num = card.querySelector('.deck-num');
    info.classList.add('is-switching');
    window.setTimeout(() => {
      infoTitle.textContent = title.textContent;
      infoDesc.textContent = desc.textContent;
      infoNum.textContent = num.textContent;
      info.style.setProperty('--accent', card.style.getPropertyValue('--accent'));
      info.classList.remove('is-switching');
    }, 160);
  }

  function activate(card) {
    if (card.classList.contains('is-active')) return;
    cards.forEach(c => c.classList.toggle('is-active', c === card));
    render(card);
  }

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => activate(card));
    card.addEventListener('focus', () => activate(card));
    card.addEventListener('click', () => activate(card));
  });

  // Re-sync the panel after the site-wide language switch.
  document.addEventListener('wntc:language', () => {
    const active = cards.find(c => c.classList.contains('is-active')) || cards[0];
    const title = active.querySelector('.deck-label');
    const desc = active.querySelector('.deck-desc');
    infoTitle.textContent = title.textContent;
    infoDesc.textContent = desc.textContent;
  });

  cards[0].classList.add('is-active');
})();
