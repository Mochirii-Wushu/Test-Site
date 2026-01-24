/* ranks.js
   Optional renderer for ranks.html using /data/ranks.json
   GitHub Pages safe: static JSON + static assets
*/

"use strict";

const DATA_URL = "./data/ranks.json";

/* ---------- helpers ---------- */
function qs(sel, root = document) {
  return root.querySelector(sel);
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
function safeText(value, fallback) {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}
function safeSrc(value, fallback) {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}

/* ---------- reveal ---------- */
function setupReveal() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
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

/* ---------- rendering ---------- */
function applyHero(data) {
  const heroImg = qs('[data-role="ranks-hero-image"]');
  const heroTitle = qs('[data-role="ranks-hero-title"]');
  const heroDesc = qs('[data-role="ranks-hero-desc"]');
  const heroPill = qs('[data-role="ranks-hero-pill"]');

  const hero = data.hero || {};
  if (heroImg && hero.image) heroImg.src = safeSrc(hero.image, heroImg.getAttribute("src") || "");
  if (heroTitle && hero.title) heroTitle.textContent = safeText(hero.title, heroTitle.textContent);
  if (heroDesc && hero.description) heroDesc.textContent = safeText(hero.description, heroDesc.textContent);
  if (heroPill && hero.pill) heroPill.textContent = safeText(hero.pill, heroPill.textContent);
}

function applyLadder(data) {
  const ladderImg = qs('[data-role="ranks-ladder-image"]');
  const ladderTitle = qs('[data-role="ranks-ladder-title"]');
  const ladderDesc = qs('[data-role="ranks-ladder-desc"]');
  const ladderCapTitle = qs('[data-role="ranks-ladder-cap-title"]');
  const ladderCapDesc = qs('[data-role="ranks-ladder-cap-desc"]');

  const ladder = data.ladder || {};
  if (ladderImg && ladder.image) ladderImg.src = safeSrc(ladder.image, ladderImg.getAttribute("src") || "");
  if (ladderTitle && ladder.title) ladderTitle.textContent = safeText(ladder.title, ladderTitle.textContent);
  if (ladderDesc && ladder.description) ladderDesc.textContent = safeText(ladder.description, ladderDesc.textContent);
  if (ladderCapTitle && ladder.captionTitle) ladderCapTitle.textContent = safeText(ladder.captionTitle, ladderCapTitle.textContent);
  if (ladderCapDesc && ladder.caption) ladderCapDesc.textContent = safeText(ladder.caption, ladderCapDesc.textContent);
}

function buildRankCard(rank) {
  const card = el("div", "bg-black/25 rounded-2xl p-4 sm:p-5");

  const h = el("h3", "text-lg sm:text-xl leading-tight text-white");
  h.textContent = safeText(rank.name, "Rank name");

  const p = el("p", "mt-2 text-sm sm:text-base leading-snug text-white/90");
  p.textContent = safeText(rank.description, "Brief description goes here.");

  card.appendChild(h);
  card.appendChild(p);
  return card;
}

function applyTier(tierKey, tierData) {
  const section = qs(`[data-tier="${tierKey}"]`);
  if (!section) return;

  const titleEl = qs('[data-role="tier-title"]', section);
  const descEl = qs('[data-role="tier-desc"]', section);
  const badgeEl = qs('[data-role="tier-badge"]', section);
  const imgEl = qs('[data-role="tier-image"]', section);
  const noteEl = qs('[data-role="tier-note"]', section);
  const listEl = qs('[data-role="tier-list"]', section);

  if (titleEl && tierData.title) titleEl.textContent = safeText(tierData.title, titleEl.textContent);
  if (descEl && tierData.description) descEl.textContent = safeText(tierData.description, descEl.textContent);
  if (badgeEl && tierData.badge) badgeEl.textContent = safeText(tierData.badge, badgeEl.textContent);
  if (noteEl && tierData.note) noteEl.textContent = safeText(tierData.note, noteEl.textContent);
  if (imgEl && tierData.image) imgEl.src = safeSrc(tierData.image, imgEl.getAttribute("src") || "");

  if (listEl && Array.isArray(tierData.ranks) && tierData.ranks.length) {
    listEl.innerHTML = "";
    tierData.ranks.forEach((r) => listEl.appendChild(buildRankCard(r)));
  }
}

function applyFooter(data) {
  const footer = qs('[data-role="ranks-footer-text"]');
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
  data.ladder = data.ladder || {};
  data.tiers = data.tiers || {};
  data.footer = data.footer || {};
  return data;
}

/* ---------- init ---------- */
(async function init() {
  try {
    const raw = await loadData();
    const data = normalize(raw);

    applyHero(data);
    applyLadder(data);

    applyTier("senior", data.tiers.senior || {});
    applyTier("middle", data.tiers.middle || {});
    applyTier("members", data.tiers.members || {});

    applyFooter(data);
    setupReveal();
  } catch (err) {
    // Fail gracefully: ranks.html still works as static content.
    console.error(err);
  }
})();
