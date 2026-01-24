/* leaders.js
   Renders Leaders Hall page content from /data/leaders.json
   GitHub Pages safe: static JSON + static assets
*/

"use strict";

const DATA_URL = "./data/leaders.json";

/* ---------- small helpers ---------- */
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
function safeHref(value, fallback = "#") {
  const s = (value ?? "").toString().trim();
  return s.length ? s : fallback;
}

/* ---------- scroll reveal (same feel as homepage, minimal) ---------- */
function setupReveal() {
  const targets = [qs("#leadersGrid")].filter(Boolean);
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
function renderHero(data) {
  // Optional: allow leaders.json to control hero image and descriptor
  const hero = data.hero || {};
  const heroImg = qs("#leadersHeroImage");

  if (heroImg && hero.image) {
    heroImg.src = safeText(hero.image, heroImg.getAttribute("src") || "./assets/img/leaders/hero.webp");
  }
}

function renderLeaders(data) {
  const grid = qs("#leadersGrid");
  if (!grid) return;

  const leaders = Array.isArray(data.leaders) ? data.leaders : null;
  if (!leaders || leaders.length === 0) return; // Keep the static HTML cards if no data exists

  grid.innerHTML = "";

  const max = Math.min(leaders.length, 12);

  for (let i = 0; i < max; i++) {
    const item = leaders[i] || {};

    const card = el("article", "group relative overflow-hidden rounded-3xl");

    const media = el("div", "relative aspect-[4/5]");

    const img = el(
      "img",
      "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
      {
        src: safeText(item.image, "./assets/img/leaders/leader.webp"),
        alt: safeText(item.alt, "Leader portrait"),
        loading: "lazy",
      }
    );

    const scrim = el("div", "absolute inset-0 bg-black/35");

    const plateWrap = el("div", "absolute left-5 right-5 bottom-5 sm:left-7 sm:right-7 sm:bottom-7");
    const plate = el("div", "bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5");

    const top = el("div", "flex items-center justify-between gap-3");
    const role = el(
      "span",
      "bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs sm:text-sm text-white/95"
    );
    role.textContent = safeText(item.role, "Role goes here.");

    const avail = el("span", "text-xs sm:text-sm text-white/80");
    avail.textContent = safeText(item.availability, "Brief availability note goes here.");

    top.appendChild(role);
    top.appendChild(avail);

    const name = el("h3", "mt-3 text-xl sm:text-2xl leading-tight text-white line-clamp-1");
    name.textContent = safeText(item.name, "Leader name goes here.");

    const desc = el("p", "mt-2 text-sm sm:text-base leading-snug text-white/90 line-clamp-2");
    desc.textContent = safeText(item.summary, "Brief description of responsibilities goes here.");

    plate.appendChild(top);
    plate.appendChild(name);
    plate.appendChild(desc);

    // Optional contact links (kept minimal; no Discord CTA repetition)
    const contacts = Array.isArray(item.contacts) ? item.contacts : [];
    if (contacts.length) {
      const links = el("div", "mt-3 flex flex-wrap gap-3");

      contacts.slice(0, 4).forEach((c) => {
        const label = safeText(c.label, "");
        const href = safeHref(c.href, "");
        if (!label.length || !href.length) return;

        const a = el(
          "a",
          "text-sm underline underline-offset-4 decoration-white/40 hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded",
          { href, target: "_blank", rel: "noopener noreferrer" }
        );
        a.textContent = label;
        links.appendChild(a);
      });

      if (links.childElementCount) plate.appendChild(links);
    }

    plateWrap.appendChild(plate);

    media.appendChild(img);
    media.appendChild(scrim);
    media.appendChild(plateWrap);

    card.appendChild(media);

    // Gentle stagger for the grid
    card.style.transitionDelay = `${Math.min(220, i * 60)}ms`;

    grid.appendChild(card);
  }
}

/* ---------- data load ---------- */
async function loadData() {
  const res = await fetch(DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  return res.json();
}
function normalizeData(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  data.hero = data.hero || {};
  data.leaders = Array.isArray(data.leaders) ? data.leaders : [];
  return data;
}

/* ---------- init ---------- */
(async function init() {
  try {
    const raw = await loadData();
    const data = normalizeData(raw);

    renderHero(data);
    renderLeaders(data);
    setupReveal();
  } catch (err) {
    // Fail gracefully: keep the static HTML cards visible
    console.error(err);
  }
})();
