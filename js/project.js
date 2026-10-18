(() => {
  const overview = document.querySelector('#lighting-overview');
  const spaces = {
    corridor: { number:'01 / CORRIDOR', title:'移動を、光でつなぐ。', description:'行き先がわかる低位の光と、空間の見通しを支える明るさを組み合わせます。', role:'連続する動線の誘導', day:'周囲との明るさの差に配慮', night:'足元を中心に必要な範囲を照らす', name:'廊下' },
    lounge: { number:'02 / SHARED LIVING', title:'集まる場所に、光の層を。', description:'壁面や天井のやわらかな光に、会話や食事を支える居場所の光を重ねます。', role:'滞在する場所の明るさをつくる', day:'昼光と人工照明のバランスを検討', night:'暖かな光でくつろぎの場をつくる', name:'共用空間' },
    bedroom: { number:'03 / PRIVATE ROOM', title:'休息に、そっと寄り添う。', description:'主照明、手元の光、足元の光を分け、過ごし方に応じて必要な場所を照らします。', role:'個人の時間と行動に合わせる', day:'起床や手元の作業に合わせて点灯', night:'主照明を落とし、手元と足元に光を残す', name:'居室' },
  };
  let selected = 'corridor', mode = 'day';
  const setText = (key, text) => { const el = overview.querySelector(`[data-plan-${key}]`); if (el) el.textContent = text; };
  const update = () => {
    const space = spaces[selected];
    overview.dataset.planMode = mode;
    overview.dataset.planSpace = selected;
    setText('number',space.number); setText('title',space.title); setText('description',space.description);
    setText('role',space.role); setText('time',space[mode]);
    overview.querySelector('[data-plan-time]').previousElementSibling.textContent = mode === 'day' ? '日中の考え方' : '夜間の考え方';
    const photo = overview.querySelector('[data-plan-photo]');
    const photos = { corridor: ['corridor', '廊下'], lounge: ['shared-ceiling', '共用空間の天井照明（写真上部）'], bedroom: ['room-entrance', '居室入口'] };
    photo.src = `assets/images/site/${photos[selected][0]}.jpg`;
    photo.alt = `Many People 広島石内の${photos[selected][1]}の現況写真。`;
    overview.querySelector('[data-plan-photo-label]').textContent = `現況写真 / ${photos[selected][1]}`;
    overview.querySelector('[data-plan-link]').href = `#space-${selected}`;
    overview.querySelectorAll('[data-space-button]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.spaceButton === selected)));
    overview.querySelectorAll('[data-plan-mode-button]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.planModeButton === mode)));
  };
  if (overview) {
    overview.querySelectorAll('[data-space-button]').forEach(button => button.addEventListener('click', () => { selected = button.dataset.spaceButton; update(); }));
    overview.querySelectorAll('[data-plan-mode-button]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.planModeButton; update(); }));
    document.querySelectorAll('[data-return-space]').forEach(link => link.addEventListener('click', () => { selected = link.dataset.returnSpace; update(); }));
    update();
  }
  document.querySelectorAll('[data-comparison]').forEach(article => {
    article.querySelectorAll('[data-compare-view]').forEach(button => button.addEventListener('click', () => {
      article.dataset.view = button.dataset.compareView;
      article.querySelectorAll('[data-compare-view]').forEach(candidate => candidate.setAttribute('aria-pressed',String(candidate === button)));
    }));
  });
  const menuButton = document.querySelector('.mobile-menu-button');
  const menu = document.querySelector('#main-navigation');
  const closeMenu = () => { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded',String(open)); menu.classList.toggle('is-open',open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width:1081px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
})();
