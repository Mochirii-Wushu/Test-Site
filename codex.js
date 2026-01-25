/* codex.js
   Optional renderer for codex.html using /data/codex.json
   GitHub Pages safe: static JSON + static assets
*/

"use strict";

const DATA_URL = "./data/codex.json";

/* ---------- helpers ---------- */
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
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
function safeHref(value, fallback = "#") {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
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

/* ---------- builders ---------- */
function buildCard(title, description) {
  const card = el("div", "bg-black/25 rounded-2xl p-4 sm:p-5");
  const h = el("h3", "text-lg sm:text-xl leading-tight text-white");
  h.textContent = safeText(title, "Title");
  const p = el("p", "mt-2 text-sm sm:text-base leading-snug text-white/90");
  p.textContent = safeText(description, "Brief description goes here.");
  card.appendChild(h);
  card.appendChild(p);
  return card;
}
function buildListBlock(title, items) {
  const wrap = el("div", "bg-black/25 rounded-2xl p-4 sm:p-5");
  const h = el("h3", "text-lg sm:text-xl leading-tight text-white");
  h.textContent = safeText(title, "Section title");

  const ul = el("ul", "mt-3 space-y-2 text-sm sm:text-base text-white/90 list-disc list-inside");
  (items || []).forEach((it) => {
    const li = el("li", "");
    li.textContent = safeText(it, "Brief rule goes here.");
    ul.appendChild(li);
  });

  wrap.appendChild(h);
  wrap.appendChild(ul);
  return wrap;
}

/* ---------- apply: hero ---------- */
function applyHero(data) {
  const hero = data.hero || {};

  const img = qs('[data-role="codex-hero-image"]');
  const title = qs('[data-role="codex-hero-title"]');
  const desc = qs('[data-role="codex-hero-desc"]');
  const pill = qs('[data-role="codex-hero-pill"]');
  const homeLink = qs('[data-role="codex-link-home"]');
  const joinLink = qs('[data-role="codex-link-join"]');

  if (img && hero.image) img.src = safeSrc(hero.image, img.getAttribute("src") || "");
  if (title && hero.title) title.textContent = safeText(hero.title, title.textContent);
  if (desc && hero.description) desc.textContent = safeText(hero.description, desc.textContent);
  if (pill && hero.pill) pill.textContent = safeText(hero.pill, pill.textContent);

  if (homeLink && hero.homeHref) homeLink.href = safeHref(hero.homeHref, homeLink.getAttribute("href") || "");
  if (joinLink && hero.joinHref) joinLink.href = safeHref(hero.joinHref, joinLink.getAttribute("href") || "");
}

/* ---------- apply: tenets ---------- */
function applyTenets(data) {
  const tenets = data.tenets || {};

  const sectionTitle = qs('[data-role="tenets-title"]');
  const sectionDesc = qs('[data-role="tenets-desc"]');

  const img = qs('[data-role="tenets-image"]');
  const capTitle = qs('[data-role="tenets-cap-title"]');
  const capDesc = qs('[data-role="tenets-cap-desc"]');

  const list = qs('[data-role="tenets-list"]');
  const note = qs('[data-role="tenets-note"]');

  if (sectionTitle && tenets.title) sectionTitle.textContent = safeText(tenets.title, sectionTitle.textContent);
  if (sectionDesc && tenets.description) sectionDesc.textContent = safeText(tenets.description, sectionDesc.textContent);

  if (img && tenets.image) img.src = safeSrc(tenets.image, img.getAttribute("src") || "");
  if (capTitle && tenets.captionTitle) capTitle.textContent = safeText(tenets.captionTitle, capTitle.textContent);
  if (capDesc && tenets.caption) capDesc.textContent = safeText(tenets.caption, capDesc.textContent);

  if (note && tenets.note) note.textContent = safeText(tenets.note, note.textContent);

  if (list && Array.isArray(tenets.items) && tenets.items.length) {
    list.innerHTML = "";
    tenets.items.slice(0, 12).forEach((it) => {
      list.appendChild(buildCard(it.title, it.description));
    });
  }
}

/* ---------- apply: etiquette ---------- */
function applyEtiquette(data) {
  const etiquette = data.etiquette || {};

  const sectionTitle = qs('[data-role="etiquette-title"]');
  const sectionDesc = qs('[data-role="etiquette-desc"]');

  const img = qs('[data-role="etiquette-image"]');
  const blocksWrap = qs('[data-role="etiquette-blocks"]');
  const note = qs('[data-role="etiquette-note"]');

  if (sectionTitle && etiquette.title) sectionTitle.textContent = safeText(etiquette.title, sectionTitle.textContent);
  if (sectionDesc && etiquette.description) sectionDesc.textContent = safeText(etiquette.description, sectionDesc.textContent);

  if (img && etiquette.image) img.src = safeSrc(etiquette.image, img.getAttribute("src") || "");
  if (note && etiquette.note) note.textContent = safeText(etiquette.note, note.textContent);

  if (blocksWrap && Array.isArray(etiquette.blocks) && etiquette.blocks.length) {
    blocksWrap.innerHTML = "";
    etiquette.blocks.slice(0, 6).forEach((b) => {
      blocksWrap.appendChild(buildListBlock(b.title, b.items));
    });
  }
}

/* ---------- apply: rhythm ---------- */
function applyRhythm(data) {
  const rhythm = data.rhythm || {};

  const sectionTitle = qs('[data-role="rhythm-title"]');
  const sectionDesc = qs('[data-role="rhythm-desc"]');

  const img = qs('[data-role="rhythm-image"]');
  const capTitle = qs('[data-role="rhythm-cap-title"]');
  const capDesc = qs('[data-role="rhythm-cap-desc"]');

  const list = qs('[data-role="rhythm-list"]');
  const note = qs('[data-role="rhythm-note"]');

  if (sectionTitle && rhythm.title) sectionTitle.textContent = safeText(rhythm.title, sectionTitle.textContent);
  if (sectionDesc && rhythm.description) sectionDesc.textContent = safeText(rhythm.description, sectionDesc.textContent);

  if (img && rhythm.image) img.src = safeSrc(rhythm.image, img.getAttribute("src") || "");
  if (capTitle && rhythm.captionTitle) capTitle.textContent = safeText(rhythm.captionTitle, capTitle.textContent);
  if (capDesc && rhythm.caption) capDesc.textContent = safeText(rhythm.caption, capDesc.textContent);

  if (note && rhythm.note) note.textContent = safeText(rhythm.note, note.textContent);

  if (list && Array.isArray(rhythm.items) && rhythm.items.length) {
    list.innerHTML = "";
    rhythm.items.slice(0, 12).forEach((it) => {
      list.appendChild(buildCard(it.title, it.description));
    });
  }
}

/* ---------- apply: recognition ---------- */
function applyRecognition(data) {
  const rec = data.recognition || {};

  const sectionTitle = qs('[data-role="recognition-title"]');
  const sectionDesc = qs('[data-role="recognition-desc"]');

  const list = qs('[data-role="recognition-list"]');
  const link = qs('[data-role="recognition-link"]');

  if (sectionTitle && rec.title) sectionTitle.textContent = safeText(rec.title, sectionTitle.textContent);
  if (sectionDesc && rec.description) sectionDesc.textContent = safeText(rec.description, sectionDesc.textContent);

  if (link && rec.ranksHref) link.href = safeHref(rec.ranksHref, link.getAttribute("href") || "");

  if (list && Array.isArray(rec.items) && rec.items.length) {
    list.innerHTML = "";
    rec.items.slice(0, 6).forEach((it) => {
      list.appendChild(buildCard(it.title, it.description));
    });
  }
}

/* ---------- apply: footer ---------- */
function applyFooter(data) {
  const footer = qs('[data-role="codex-footer-text"]');
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
  data.tenets = data.tenets || {};
  data.etiquette = data.etiquette || {};
  data.rhythm = data.rhythm || {};
  data.recognition = data.recognition || {};
  data.footer = data.footer || {};
  return data;
}

/* ---------- init ---------- */
(async function init() {
  try {
    const raw = await loadData();
    const data = normalize(raw);

    applyHero(data);
    applyTenets(data);
    applyEtiquette(data);
    applyRhythm(data);
    applyRecognition(data);
    applyFooter(data);

    setupReveal();
  } catch (err) {
    // Fail gracefully: codex.html still works as static content.
    console.error(err);
  }
})();
