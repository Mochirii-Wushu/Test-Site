/* join.js
   Optional renderer for join.html using /data/join.json
   GitHub Pages safe: static JSON + static assets
*/

"use strict";

const DATA_URL = "./data/join.json";

/* ---------- helpers ---------- */
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}
function safeText(value, fallback) {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}
function safeSrc(value, fallback) {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}
function safeHref(value, fallback = "#") {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}
function el(tag, className = "", attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    node.setAttribute(k, String(v));
  }
  return node;
}

/* ---------- reveal ---------- */
function setupReveal() {
  const targets = qsa("[data-reveal]");
  if (!targets.length) return;

  const hidden = ["opacity-0", "translate-y-4"];
  const shown = ["opacity-100", "translate-y-0", "transition", "duration-700", "ease-out"];

  targets.forEach((t) => hidden.forEach((c) => t.classList.add(c)));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hidden.forEach((c) => entry.target.classList.remove(c));
        shown.forEach((c) => entry.target.classList.add(c));
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((t) => io.observe(t));
}

/* ---------- renderers ---------- */
function applyHero(data) {
  const hero = data.hero || {};

  const img = qs('[data-role="join-hero-image"]');
  const title = qs('[data-role="join-hero-title"]');
  const desc = qs('[data-role="join-hero-desc"]');
  const pill = qs('[data-role="join-hero-pill"]');
  const cta = qs('[data-role="join-cta"]');

  if (img && hero.image) img.src = safeSrc(hero.image, img.getAttribute("src") || "");
  if (title && hero.title) title.textContent = safeText(hero.title, title.textContent);
  if (desc && hero.description) desc.textContent = safeText(hero.description, desc.textContent);
  if (pill && hero.pill) pill.textContent = safeText(hero.pill, pill.textContent);

  // One primary CTA only (page already contains it; this just allows updating URL safely)
  if (cta && hero.ctaHref) cta.href = safeHref(hero.ctaHref, cta.getAttribute("href") || "");
}

function applyPanels(data) {
  const panels = data.panels || {};

  const stepsImg = qs('[data-role="join-steps-image"]');
  const stepsCapTitle = qs('[data-role="join-steps-cap-title"]');
  const stepsCapDesc = qs('[data-role="join-steps-cap-desc"]');

  if (stepsImg && panels.stepsImage) stepsImg.src = safeSrc(panels.stepsImage, stepsImg.getAttribute("src") || "");
  if (stepsCapTitle && panels.stepsCaptionTitle) stepsCapTitle.textContent = safeText(panels.stepsCaptionTitle, stepsCapTitle.textContent);
  if (stepsCapDesc && panels.stepsCaption) stepsCapDesc.textContent = safeText(panels.stepsCaption, stepsCapDesc.textContent);

  const expImg = qs('[data-role="join-expectations-image"]');
  if (expImg && panels.expectationsImage) expImg.src = safeSrc(panels.expectationsImage, expImg.getAttribute("src") || "");
}

function buildStepCard(step) {
  const card = el("div", "bg-black/25 rounded-2xl p-4 sm:p-5");
  const row = el("div", "flex items-start gap-3");

  const badge = el(
    "span",
    "inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-2xl bg-black/30 text-white/90 text-sm"
  );
  badge.textContent = safeText(step.number, "");

  const body = el("div", "");

  const h = el("h3", "text-lg sm:text-xl leading-tight text-white");
  h.textContent = safeText(step.title, "Step title");

  const p = el("p", "mt-2 text-sm sm:text-base leading-snug text-white/90");
  p.textContent = safeText(step.description, "Brief instruction goes here.");

  body.appendChild(h);
  body.appendChild(p);

  row.appendChild(badge);
  row.appendChild(body);
  card.appendChild(row);
  return card;
}

function buildCultureCard(item) {
  const card = el("div", "bg-black/25 rounded-2xl p-4 sm:p-5");

  const h = el("h3", "text-lg sm:text-xl leading-tight text-white");
  h.textContent = safeText(item.title, "Card title");

  const p = el("p", "mt-2 text-sm sm:text-base leading-snug text-white/90");
  p.textContent = safeText(item.description, "Brief description goes here.");

  card.appendChild(h);
  card.appendChild(p);

  return card;
}

function applySteps(data) {
  const stepsWrap = qs('[data-role="join-steps-list"]');
  if (!stepsWrap) return;

  const steps = Array.isArray(data.steps) ? data.steps : [];
  if (!steps.length) return; // Keep static HTML if no data

  stepsWrap.innerHTML = "";
  steps.slice(0, 8).forEach((s, idx) => {
    const step = {
      number: safeText(s.number, String(idx + 1)),
      title: s.title,
      description: s.description
    };
    stepsWrap.appendChild(buildStepCard(step));
  });
}

function applyCulture(data) {
  const cultureWrap = qs('[data-role="join-culture-list"]');
  if (!cultureWrap) return;

  const items = Array.isArray(data.culture) ? data.culture : [];
  if (!items.length) return; // Keep static HTML if no data

  cultureWrap.innerHTML = "";
  items.slice(0, 6).forEach((it) => cultureWrap.appendChild(buildCultureCard(it)));
}

function applyFooter(data) {
  const footer = qs('[data-role="join-footer-text"]');
  if (footer && data.footer && data.footer.text) {
    footer.textContent = safeText(data.footer.text, footer.textContent);
  }
}

/* ---------- data ---------- */
async function loadData() {
  const res = await fetch(DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  return res.json();
}
function normalize(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  data.hero = data.hero || {};
  data.panels = data.panels || {};
  data.steps = Array.isArray(data.steps) ? data.steps : [];
  data.culture = Array.isArray(data.culture) ? data.culture : [];
  data.footer = data.footer || {};
  return data;
}

/* ---------- init ---------- */
(async function init() {
  try {
    const raw = await loadData();
    const data = normalize(raw);

    applyHero(data);
    applyPanels(data);
    applySteps(data);
    applyCulture(data);
    applyFooter(data);
    setupReveal();
  } catch (err) {
    // Fail gracefully: join.html still works as static content.
    console.error(err);
  }
})();
