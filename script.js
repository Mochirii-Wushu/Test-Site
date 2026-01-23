// script.js
(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  const acrobat = document.getElementById("acrobat");
  const moveName = document.getElementById("moveName");
  const moveDesc = document.getElementById("moveDesc");
  const calloutText = document.getElementById("calloutText");

  const btnTrails = document.getElementById("toggleTrails");
  const btnParticles = document.getElementById("toggleParticles");
  const btnCamera = document.getElementById("toggleCamera");

  const state = {
    dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
    w: 0,
    h: 0,
    t: 0,
    trailsOn: true,
    particlesOn: true,
    parallaxOn: true,
    frozen: false,
    pointer: { x: 0.5, y: 0.5, vx: 0, vy: 0, down: false },
    cam: { x: 0, y: 0 },
  };

  const moves = [
    {
      key: "aerial-kick",
      title: "腾空飞踢 — Aerial Flying Kick",
      desc: "Explosive takeoff, knee chamber, extension at apex, controlled landing.",
      notes: "Emphasis: straight-line extension, stable core, quiet landing mechanics."
    },
    {
      key: "tornado-kick",
      title: "旋风腿 — Tornado Kick",
      desc: "Step-in, rotational lift, whipping extension, re-spot on descent.",
      notes: "Emphasis: turn speed from hips, head spotting, crisp re-alignment."
    },
    {
      key: "crane-stance",
      title: "鹤形起势 — Crane Stance Entry",
      desc: "One-leg balance, lifted knee line, open guard, poised breath.",
      notes: "Emphasis: vertical structure, relaxed shoulders, rooted supporting foot."
    },
    {
      key: "fish-flip",
      title: "鱼跃翻身 — Fish-Leap Flip",
      desc: "Forward dive line into a compact rotation, open to a soft recovery.",
      notes: "Emphasis: tight tuck timing, safe shoulder path, clean exit posture."
    }
  ];

  let moveIndex = 0;

  // Canvas resize
  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.w = Math.floor(rect.width);
    state.h = Math.floor(rect.height);

    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  // FX primitives
  const particles = [];
  const ribbons = [];

  function spawnParticles(n = 6) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * state.w,
        y: state.h + Math.random() * 40,
        r: 1.2 + Math.random() * 2.2,
        vy: -0.25 - Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.3,
        a: 0.35 + Math.random() * 0.5,
        hue: 160 + Math.random() * 170,
        life: 380 + Math.random() * 280
      });
    }
  }

  function addRibbon(x, y, power = 1) {
    ribbons.push({
      pts: [{ x, y }],
      hue: 160 + Math.random() * 170,
      a: 0.55 * power,
      w: 1.2 + Math.random() * 2.2,
      life: 120 + Math.random() * 60
    });
  }

  function setMove(i) {
    moveIndex = (i + moves.length) % moves.length;
    const m = moves[moveIndex];
    acrobat.dataset.move = m.key;
    moveName.textContent = m.title;
    moveDesc.textContent = m.desc;
    calloutText.textContent = m.notes;
  }

  // Controls
  function setBtn(btn, on, labelOn, labelOff) {
    btn.classList.toggle("off", !on);
    btn.textContent = on ? labelOn : labelOff;
  }

  btnTrails.addEventListener("click", () => {
    state.trailsOn = !state.trailsOn;
    setBtn(btnTrails, state.trailsOn, "Qi Trails: On", "Qi Trails: Off");
  });

  btnParticles.addEventListener("click", () => {
    state.particlesOn = !state.particlesOn;
    setBtn(btnParticles, state.particlesOn, "Particles: On", "Particles: Off");
  });

  btnCamera.addEventListener("click", () => {
    state.parallaxOn = !state.parallaxOn;
    setBtn(btnCamera, state.parallaxOn, "Parallax: On", "Parallax: Off");
  });

  // Input
  function onPointerMove(clientX, clientY) {
    const x = clientX / state.w;
    const y = clientY / state.h;
    const dx = x - state.pointer.x;
    const dy = y - state.pointer.y;

    state.pointer.vx = dx;
    state.pointer.vy = dy;
    state.pointer.x = x;
    state.pointer.y = y;

    if (state.trailsOn) addRibbon(clientX, clientY, state.pointer.down ? 1.1 : 0.7);
  }

  window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener("mousedown", () => (state.pointer.down = true), { passive: true });
  window.addEventListener("mouseup", () => (state.pointer.down = false), { passive: true });

  window.addEventListener("touchstart", (e) => {
    state.pointer.down = true;
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("touchend", () => (state.pointer.down = false), { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      state.frozen = !state.frozen;
      acrobat.style.animationPlayState = state.frozen ? "paused" : "running";
      acrobat.querySelectorAll(".arm,.leg,.qiAura").forEach(el => {
        el.style.animationPlayState = state.frozen ? "paused" : "running";
      });
      e.preventDefault();
    }
  });

  // Parallax background “camera”
  function applyParallax() {
    if (!state.parallaxOn) {
      document.documentElement.style.setProperty("--camx", `0px`);
      document.documentElement.style.setProperty("--camy", `0px`);
      return;
    }
    const cx = (state.pointer.x - 0.5) * 18;
    const cy = (state.pointer.y - 0.5) * 14;

    state.cam.x += (cx - state.cam.x) * 0.07;
    state.cam.y += (cy - state.cam.y) * 0.07;

    // subtle: used only as CSS variables if you want to extend later
    document.documentElement.style.setProperty("--camx", `${state.cam.x}px`);
    document.documentElement.style.setProperty("--camy", `${state.cam.y}px`);
  }

  // Render loop
  function clear() {
    // Soft fade for trails
    ctx.fillStyle = "rgba(5, 6, 13, 0.14)";
    ctx.fillRect(0, 0, state.w, state.h);
  }

  function drawParticles() {
    if (!state.particlesOn) return;

    if (particles.length < 160 && Math.random() < 0.65) spawnParticles(3);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx + Math.sin((state.t * 0.004) + p.x * 0.01) * 0.08;
      p.y += p.vy;
      p.life -= 1;

      const alpha = Math.max(0, Math.min(1, p.a * (p.life / 300)));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // bloom-ish halo
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${alpha * 0.25})`;
      ctx.arc(p.x, p.y, p.r * 4.2, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0 || p.y < -40 || p.x < -80 || p.x > state.w + 80) {
        particles.splice(i, 1);
      }
    }
  }

  function drawRibbons() {
    if (!state.trailsOn) return;

    // passive ribbons around stage center for “wuxia breathing”
    if (Math.random() < 0.28) {
      const x = state.w * (0.5 + Math.sin(state.t * 0.002) * 0.14);
      const y = state.h * (0.56 + Math.cos(state.t * 0.0016) * 0.10);
      addRibbon(x, y, 0.55);
    }

    for (let i = ribbons.length - 1; i >= 0; i--) {
      const r = ribbons[i];
      r.life -= 1;

      // add a point that “flows”
      const last = r.pts[r.pts.length - 1];
      const flow = {
        x: last.x + (Math.random() - 0.5) * 6 + Math.sin(state.t * 0.01 + r.hue) * 1.2,
        y: last.y + (Math.random() - 0.5) * 6 + Math.cos(state.t * 0.012 + r.hue) * 1.1
      };
      r.pts.push(flow);
      if (r.pts.length > 18) r.pts.shift();

      const alpha = Math.max(0, Math.min(1, r.a * (r.life / 120)));

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = `hsla(${r.hue}, 95%, 66%, ${alpha})`;
      ctx.lineWidth = r.w;

      ctx.beginPath();
      for (let j = 0; j < r.pts.length; j++) {
        const pt = r.pts[j];
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // halo
      ctx.strokeStyle = `hsla(${r.hue}, 95%, 70%, ${alpha * 0.18})`;
      ctx.lineWidth = r.w * 6.5;
      ctx.stroke();

      if (r.life <= 0) ribbons.splice(i, 1);
    }
  }

  function frame() {
    state.t += 1;

    applyParallax();
    clear();
    drawRibbons();
    drawParticles();

    requestAnimationFrame(frame);
  }

  // Move cycling
  setMove(0);
  setInterval(() => setMove(moveIndex + 1), 5200);

  // Resize handling
  const ro = new ResizeObserver(() => resize());
  ro.observe(document.body);
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // First fill (avoid black flash)
  ctx.fillStyle = "rgba(5, 6, 13, 1)";
  ctx.fillRect(0, 0, state.w, state.h);

  // Respect reduced motion
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    state.trailsOn = false;
    state.particlesOn = false;
    setBtn(btnTrails, false, "Qi Trails: On", "Qi Trails: Off");
    setBtn(btnParticles, false, "Particles: On", "Particles: Off");
  } else {
    setBtn(btnTrails, true, "Qi Trails: On", "Qi Trails: Off");
    setBtn(btnParticles, true, "Particles: On", "Particles: Off");
    setBtn(btnCamera, true, "Parallax: On", "Parallax: Off");
  }

  frame();
})();
