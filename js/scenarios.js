(() => {
  const display = document.querySelector('[data-scenario-display]');
  if (!display) return;
  const find = (name) => display.querySelector(`[data-${name}]`);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = {
    nightwalk: { title: '01 / NIGHT WALK', signal: 'ベッド付近の離床と進行方向', response: '足元から進行方向へ順に点灯。通過後はゆっくり消灯', captions: ['ベッドからの起き上がりを検知', '進行方向を読み、足元の光を準備', '進む先を照らし、通過した光は消灯'] },
    rest: { title: '02 / REST', signal: '着座後の動きの減少と休息', response: '主照明をゆっくり落とし、暖かなベッドサイド光を残す', captions: ['ベッドに腰かけ、動きが落ち着く', '休息の場面と判断し、光を切り替える', '主照明を抑え、手元に暖かな光を残す'] },
    arrival: { title: '03 / ARRIVAL', signal: '入口の動きと室内の暗さ', response: '入口から室内へ、視界に配慮して段階的に点灯', captions: ['扉が開き、入口で人の動きを検知', '室内の暗さを読み、入口の光を準備', '入口から室内へ、光がゆっくり広がる'] },
  };
  const buttons = document.querySelectorAll('[data-scenario-button]');
  const phases = display.querySelectorAll('[data-story-phase]');
  const lights = display.querySelectorAll('[data-path-light]');
  const ease = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const between = (t, a, b) => ease((t - a) / (b - a));
  const opacity = (name, value) => find(name).setAttribute('opacity', value.toFixed(3));
  let selected = 'nightwalk', frame = 0, elapsed = 0, last = 0, visible = false, phase = -1;
  const duration = 9000;

  // One clock drives the figure, lighting and captions, including rapid scene changes.
  const render = (t) => {
    const scene = scenes[selected];
    let x = 250, y = 350, sit = 0, walk = 0, wash = 0, bedside = 0, door = 0;
    if (selected === 'nightwalk') {
      sit = 1 - between(t, 0, .2);
      walk = between(t, .34, .88);
      x += 325 * walk;
      y -= 27 * walk;
      bedside = .22 * (1 - between(t, .35, .7));
      lights.forEach((light, i) => light.setAttribute('opacity', between(t, .23 + i * .12, .34 + i * .12) * (1 - .94 * between(t, .58 + i * .12, .76 + i * .1))));
    } else if (selected === 'rest') {
      x = 250; sit = between(t, .06, .31);
      wash = .8 * (1 - between(t, .35, .85));
      bedside = .15 + .65 * between(t, .35, .75);
      lights.forEach((light) => light.setAttribute('opacity', 0));
    } else {
      door = between(t, 0, .2) * (1 - between(t, .72, 1));
      walk = between(t, .18, .78);
      x = 606 - 188 * walk; y = 307 + 38 * walk;
      wash = .9 * between(t, .43, .95);
      bedside = .5 * between(t, .62, .96);
      lights.forEach((light, i) => light.setAttribute('opacity', .75 * between(t, .24 + (2 - i) * .1, .42 + (2 - i) * .1)));
    }
    const stride = walk > 0 && walk < 1 ? Math.sin(walk * Math.PI * 12) * 10 : 0;
    find('story-person').setAttribute('transform', `translate(${x} ${y})`);
    find('person-body').setAttribute('transform', `translate(0 ${sit * 24})`);
    find('leg-left').setAttribute('d', `M-6 ${-42 + sit * 24} L${-9 - sit * 23 + stride} ${-4 - sit * 16}`);
    find('leg-right').setAttribute('d', `M6 ${-42 + sit * 24} L${10 - sit * 23 - stride} ${-4 - sit * 16}`);
    find('story-door').setAttribute('transform', `translate(${651 * door * .7} 0) scale(${1 - door * .7} 1)`);
    opacity('door-glow', door * .8);
    opacity('room-wash', wash);
    opacity('ceiling-lamp', .15 + wash * .85);
    opacity('bed-glow', bedside);
    const pulse = t < .36 ? Math.sin(Math.PI * Math.min(1, t / .36)) : .1;
    find('sensor-rings').setAttribute('transform', `translate(${x} ${y + 5}) scale(${.85 + pulse * .35})`);
    opacity('sensor-rings', .12 + pulse * .75);
    find('story-progress').style.transform = `scaleX(${t})`;
    const nextPhase = t < .23 ? 0 : t < .43 ? 1 : 2;
    if (nextPhase !== phase) {
      phase = nextPhase;
      find('story-step').textContent = ['01 — 検知', '02 — 判断', '03 — 応答'][phase];
      find('story-caption').textContent = scene.captions[phase];
      phases.forEach((element, i) => {
        element.classList.toggle('is-current', i === phase);
        element.classList.toggle('is-complete', i < phase);
      });
    }
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
    cancelAnimationFrame(frame); frame = 0; last = 0; elapsed = 0; phase = -1; selected = name;
    display.dataset.scenario = name;
    find('story-title').textContent = scenes[name].title;
    find('scenario-signal').textContent = scenes[name].signal;
    find('scenario-response').textContent = scenes[name].response;
    buttons.forEach((button) => {
      const active = button.dataset.scenarioButton === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render(motion.matches ? 1 : 0);
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
