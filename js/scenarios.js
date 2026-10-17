(() => {
  const display = document.querySelector('[data-scenario-display]');
  if (!display) return;
  const find = (name) => display.querySelector('[data-' + name + ']');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = {
    nightwalk: { title: '01 / NIGHT WALK', caption: '移動に合わせて、足元の光が順に点灯。' },
    rest: { title: '02 / REST', caption: 'ベッドで休むと、明るさを抑えて暖かな光に。' },
    arrival: { title: '03 / ARRIVAL', caption: '帰室すると、部屋の光がゆっくり点灯。' },
  };
  const buttons = document.querySelectorAll('[data-scenario-button]');
  const lights = display.querySelectorAll('[data-path-light]');
  const ease = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const between = (t, a, b) => ease((t - a) / (b - a));
  const opacity = (name, value) => find(name).setAttribute('opacity', value.toFixed(3));
  let selected = 'nightwalk', frame = 0, elapsed = 0, last = 0, visible = false;
  const duration = 5000;

  // A single figure changes pose as a whole, so its head and body stay together.
  const render = (t) => {
    let transform, wash = 0, bedside = 0;
    if (selected === 'rest') {
      // Head at (117, 194), body and feet across the mattress at y=194.
      transform = 'translate(186 194) rotate(-90)';
      wash = .22 * (1 - between(t, 0, .8));
      bedside = .25 + .55 * between(t, .1, .8);
    } else if (selected === 'arrival') {
      transform = 'translate(' + (550 - 105 * between(t, .08, .65)) + ' 250)';
      wash = .24 * between(t, .15, .95);
    } else {
      transform = 'translate(' + (285 + 210 * between(t, .12, .9)) + ' 250)';
    }
    find('story-person').setAttribute('transform', transform);
    opacity('room-wash', wash);
    opacity('bed-glow', bedside);
    lights.forEach((light, i) => {
      const value = selected === 'nightwalk'
        ? between(t, i * .23, .15 + i * .23) * (1 - .9 * between(t, .45 + i * .2, .65 + i * .17))
        : 0;
      light.setAttribute('opacity', value.toFixed(3));
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
