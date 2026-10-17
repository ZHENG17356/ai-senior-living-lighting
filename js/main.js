(() => {
  if (window.__lumaExperienceLoaded) return;
  window.__lumaExperienceLoaded = true;

  const root = document.documentElement;
  const hero = document.querySelector("[data-hero]");
  const header = document.querySelector("[data-header]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  let scrollFrame = 0;

  const updateScrollExperience = () => {
    scrollFrame = 0;

    if (hero) {
      const heroRange = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = clamp(-hero.getBoundingClientRect().top / heroRange);
      root.style.setProperty("--hero-progress", progress.toFixed(4));
    }

    root.style.setProperty("--header-alpha", clamp(window.scrollY / 130).toFixed(3));

    if (header) {
      const probe = window.scrollY + 44;
      const darkSections = document.querySelectorAll(
        ".hero, .project-intro, .lighting-overview, .timeline-section, .scenario-section, .closing, .site-footer"
      );
      const isDark = Array.from(darkSections).some((section) => {
        const start = section.offsetTop;
        const end = start + section.offsetHeight;
        return probe >= start && probe < end;
      });
      header.classList.toggle("is-light", !isDark);
    }
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollExperience);
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  updateScrollExperience();

  const revealElements = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const lightingScenes = {
    morning: {
      time: "07:00",
      name: "目覚めの光",
      title: "身体をゆっくり起こす",
      copy: "暖かな低照度から始まり、覚醒を促す白い光へ段階的に移行します。",
      temperature: 3500,
      brightness: 65,
      sensing: "起床・在室",
    },
    day: {
      time: "12:00",
      name: "活動の光",
      title: "見やすさと活動を支える",
      copy: "昼光を活かしながら、食事や会話、作業に必要な均一な明るさを補います。",
      temperature: 5000,
      brightness: 88,
      sensing: "昼光・活動量",
    },
    evening: {
      time: "18:00",
      name: "くつろぎの光",
      title: "一日の緊張をほどく",
      copy: "光の位置を低くし、色温度と明るさを抑えて、休息へ向かう雰囲気をつくります。",
      temperature: 3000,
      brightness: 48,
      sensing: "時間・共用活動",
    },
    night: {
      time: "23:30",
      name: "見守りの光",
      title: "眠りを壊さず、安全を示す",
      copy: "通常は暗さを保ち、移動を検知した時だけ足元へ暖色の誘導光を点灯します。",
      temperature: 2200,
      brightness: 14,
      sensing: "離床・進行方向",
    },
  };

  const timeline = document.querySelector("[data-timeline]");

  const valueFrames = new WeakMap();
  const animateValue = (element, nextValue) => {
    if (!element) return;
    window.cancelAnimationFrame(valueFrames.get(element));
    const previousValue = Number(element.textContent) || nextValue;
    if (reducedMotion || previousValue === nextValue) {
      element.textContent = String(nextValue);
      return;
    }

    const duration = 520;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = clamp((now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(previousValue + (nextValue - previousValue) * eased));
      if (progress < 1) valueFrames.set(element, window.requestAnimationFrame(tick));
    };
    valueFrames.set(element, window.requestAnimationFrame(tick));
  };

  if (timeline) {
    const stage = timeline.querySelector("[data-scene-stage]");
    const buttons = timeline.querySelectorAll("[data-scene-button]");
    const fields = {
      time: timeline.querySelector("[data-scene-time]"),
      name: timeline.querySelector("[data-scene-name]"),
      title: timeline.querySelector("[data-intent-title]"),
      copy: timeline.querySelector("[data-intent-copy]"),
      temperature: timeline.querySelector("[data-temperature]"),
      brightness: timeline.querySelector("[data-brightness]"),
      sensing: timeline.querySelector("[data-sensing]"),
    };

    const activateScene = (sceneName) => {
      const scene = lightingScenes[sceneName];
      if (!scene || !stage) return;

      stage.dataset.scene = sceneName;
      fields.time.textContent = scene.time;
      fields.name.textContent = scene.name;
      fields.title.textContent = scene.title;
      fields.copy.textContent = scene.copy;
      fields.sensing.textContent = scene.sensing;
      animateValue(fields.temperature, scene.temperature);
      animateValue(fields.brightness, scene.brightness);

      buttons.forEach((button) => {
        const selected = button.dataset.sceneButton === sceneName;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => activateScene(button.dataset.sceneButton));
    });
  }

})();
