(() => {
  const display = document.querySelector('[data-scenario-display]');
  if (!display) return;
  const find = (name) => display.querySelector('[data-' + name + ']');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = {
    nightwalk: { number: '01', name: '夜間の移動', title: '進む先に、足元の光を。', caption: '矢印は移動の方向。進む先が点灯し、通過した光はゆっくり消えます。' },
    rest: { number: '02', name: '休息', title: 'くつろぐ場所に、暖かな光を。', caption: '部屋の明るさをゆっくり抑え、椅子のまわりに柔らかな光を残します。' },
    arrival: { number: '03', name: '帰室', title: '帰室を迎える、穏やかな明るさ。', caption: '矢印は室内へ向かう動き。部屋全体の光がゆっくり広がります。' },
  };
  const buttons = document.querySelectorAll('[data-scenario-button]');
  const lights = display.querySelectorAll('[data-path-light]');
  const ease = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const between = (t, a, b) => ease((t - a) / (b - a));
  const opacity = (name, value) => { find(name).style.opacity = value.toFixed(3); };
  const stage = display.querySelector('.reactive-stage');
  let selected = 'nightwalk', frame = 0, elapsed = 0, last = 0, visible = false;
  const duration = 5000;

  // One arrow shows direction; the room stays the same across all three scenes.
  const render = (t) => {
    let position = 18, wash = 0, bedside = 0, lamp = 0;
    const arrow = find('story-arrow');
    if (selected === 'rest') {
      wash = .55 * (1 - between(t, 0, .8));
      lamp = .65 * (1 - between(t, 0, .8));
      bedside = .2 + .8 * between(t, .1, .8);
    } else if (selected === 'arrival') {
      position = 88 - 30 * between(t, .08, .75);
      wash = .85 * between(t, .1, .95);
      lamp = between(t, .1, .95);
    } else {
      position = 18 + 62 * between(t, .12, .9);
    }
    arrow.style.left = position + '%';
    arrow.style.opacity = selected === 'rest' ? '0' : '1';
    arrow.style.transform = 'translateX(-50%)' + (selected === 'arrival' ? ' rotate(180deg)' : '');
    stage.style.setProperty('--response-level', lamp.toFixed(3));
    opacity('room-wash', wash);
    opacity('bed-glow', bedside);
    lights.forEach((light, i) => {
      const value = selected === 'nightwalk'
        ? between(t, i * .23, .15 + i * .23) * (1 - .9 * between(t, .45 + i * .2, .65 + i * .17))
        : 0;
      light.style.opacity = value.toFixed(3);
    });
  };
  const tick = (now) => {
    if (!visible || document.hidden) { frame = 0; last = 0; return; }
    if (last) elapsed = Math.min(duration, elapsed + now - last);
    last = now;
    render(elapsed / duration);
    frame = elapsed < duration ? requestAnimationFrame(tick) : 0;
  };
  const resume = () => {
    if (!motion.matches && visible && !document.hidden && elapsed < duration && !frame) {
      last = 0; frame = requestAnimationFrame(tick);
    }
  };
  const activate = (name) => {
    if (!scenes[name]) return;
    cancelAnimationFrame(frame); frame = 0; last = 0; elapsed = 0; selected = name;
    display.dataset.scenario = name;
    find('story-title').textContent = scenes[name].title;
    find('story-number').textContent = scenes[name].number;
    find('story-name').textContent = scenes[name].name;
    find('story-caption').textContent = scenes[name].caption;
    buttons.forEach((button) => {
      const active = button.dataset.scenarioButton === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    // Reduced motion shows a readable illuminated state without movement.
    render(motion.matches ? (name === 'nightwalk' ? .55 : 1) : 0);
    resume();
  };
  buttons.forEach((button) => button.addEventListener('click', () => activate(button.dataset.scenarioButton)));
  find('story-replay').addEventListener('click', () => activate(selected));
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', () => activate(selected));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      resume();
    }, { threshold: .15 }).observe(display);
  } else { visible = true; }
  activate(selected);
})();
