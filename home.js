/* home.js
   Renders the Mōchirīī homepage from /data/home.json
   GitHub Pages safe: static JSON + static assets
*/

"use strict";

const DATA_URL = "./data/home.json";

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
  if (!s.length) return fallback;
  return s;
}
function setImg(imgEl, src, alt) {
  if (!imgEl) return;
  imgEl.src = src;
  if (typeof alt === "string") imgEl.alt = alt;
}
function fmtDate(dateStr) {
  // Expect ISO or YYYY-MM-DD; keep formatting simple and predictable
  const s = (dateStr ?? "").toString().trim();
  return s.length ? s : "Date goes here.";
}
function typeLabel(type) {
  // Keep tags short; these are labels, not content.
  const t = (type ?? "").toString().trim().toLowerCase();
  const map = {
    event: "Event",
    raffle: "Raffle",
    member: "Member",
    announcement: "News",
    meta: "Meta",
  };
  return map[t] || "Update";
}

/* ---------- modal (gallery) ---------- */
const modalRoot = qs("#modalRoot");
const modalBackdrop = qs("#modalBackdrop");
const modalImage = qs("#modalImage");
const modalClose = qs("#modalClose");

function openModal(src, alt) {
  if (!modalRoot || !modalImage) return;
  modalImage.src = src;
  modalImage.alt = alt || "";
  modalRoot.classList.remove("hidden");
  modalRoot.classList.add("flex");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  if (!modalRoot || !modalImage) return;
  modalRoot.classList.add("hidden");
  modalRoot.classList.remove("flex");
  modalImage.src = "";
  modalImage.alt = "";
  document.body.style.overflow = "";
}

if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
if (modalClose) modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------- reveal on scroll ---------- */
function setupReveals() {
  const sections = [
    qs("#bulletinsSection"),
    qs("#doorsSection"),
    qs("#spotlightSection"),
    qs("#gallerySection"),
  ].filter(Boolean);

  const hiddenCls = ["opacity-0", "translate-y-4"];
  const shownCls = ["opacity-100", "translate-y-0", "transition", "duration-700", "ease-out"];

  sections.forEach((s) => hiddenCls.forEach((c) => s.classList.add(c)));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hiddenCls.forEach((c) => entry.target.classList.remove(c));
        shownCls.forEach((c) => entry.target.classList.add(c));
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((s) => io.observe(s));
}

/* ---------- renderers ---------- */
function renderHero(data) {
  const hero = data.hero || {};
  const heroImg = qs("#heroImage");
  const heroAtmos = qs("#heroAtmosphere");
  const heroDesc = qs("#heroDescriptor");
  const badgesWrap = qs("#heroBadges");

  setImg(heroImg, safeText(hero.image, "./assets/img/hero/hero.webp"), "Hero artwork for Mōchirīī guild");

  // Optional atmosphere overlay asset (real file); empty string hides it
  const atmosSrc = (hero.atmosphereImage || "").toString().trim();
  if (heroAtmos) {
    if (atmosSrc.length) {
      heroAtmos.src = atmosSrc;
      heroAtmos.classList.remove("opacity-0");
      heroAtmos.classList.add("opacity-40");
      heroAtmos.style.animation = "float 14s ease-in-out infinite";
    } else {
      heroAtmos.src = "";
      heroAtmos.classList.add("opacity-0");
      heroAtmos.classList.remove("opacity-40");
      heroAtmos.style.animation = "";
    }
  }

  if (heroDesc) heroDesc.textContent = safeText(hero.descriptor, "Quiet, cozy guild. Mochirii welcomes pretty people from all over the world to a yummy Cupcake home. No pressure, be sweet like frosting, support each other at all times. 30-day Cupcake nap ok if you let us know. Visit us @ Mochirii . com");

  if (badgesWrap) {
    badgesWrap.innerHTML = "";
    const badges = Array.isArray(hero.badges) ? hero.badges : [];
    badges.slice(0, 6).forEach((b) => {
      const label = safeText(b, "").slice(0, 28);
      if (!label.length) return;
      const pill = el(
        "span",
        "bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs sm:text-sm text-white/90"
      );
      pill.textContent = label;
      badgesWrap.appendChild(pill);
    });
  }
}

function renderFeaturedBulletin(featured) {
  const a = qs("#featuredBulletin");
  const img = qs("#featuredBulletinImage");
  const t = qs("#featuredBulletinTitle");
  const s = qs("#featuredBulletinSummary");
  const d = qs("#featuredBulletinDate");
  const ty = qs("#featuredBulletinType");

  const href = safeHref(featured?.href, "#");
  if (a) a.href = href;

  setImg(img, safeText(featured?.image, "./assets/img/bulletins/featured.webp"), "Featured bulletin cover");

  if (ty) ty.textContent = safeText(featured?.typeLabel, typeLabel(featured?.type));
  if (d) d.textContent = fmtDate(featured?.date);
  if (t) t.textContent = safeText(featured?.title, "Featured update title goes here.");
  if (s) s.textContent = safeText(featured?.summary, "Brief description of what this featured update is about.");
}

function renderBulletinList(items) {
  const list = qs("#bulletinList");
  if (!list) return;
  list.innerHTML = "";

  const arr = Array.isArray(items) ? items : [];
  const max = Math.min(arr.length, 5);

  for (let i = 0; i < max; i++) {
    const it = arr[i] || {};

    const row = el(
      "a",
      "group relative overflow-hidden rounded-2xl aspect-[21/6] sm:aspect-[24/6] block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-transform duration-500 ease-out group-hover:-translate-y-1"
    , { href: safeHref(it.href, "#") });

    const img = el("img",
      "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    , {
      src: safeText(it.image, "./assets/img/bulletins/item.webp"),
      alt: safeText(it.imageAlt, "Bulletin cover image"),
      loading: "lazy"
    });

    const scrim = el("div", "absolute inset-0 bg-black/35");

    const tag = el(
      "div",
      "absolute left-5 top-5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs sm:text-sm text-white/95"
    );
    tag.textContent = safeText(it.typeLabel, typeLabel(it.type));

    const plateWrap = el("div", "absolute left-5 right-5 bottom-5 sm:left-7 sm:right-7 sm:bottom-7");
    const plate = el("div", "bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5");
    const top = el("div", "flex items-center justify-between gap-4");
    const date = el("span", "text-xs sm:text-sm text-white/80");
    date.textContent = fmtDate(it.date);

    const title = el("div", "mt-2 text-lg sm:text-xl leading-tight text-white line-clamp-1");
    title.textContent = safeText(it.title, "Update title goes here.");

    const summary = el("div", "mt-1 text-xs sm:text-sm leading-snug text-white/90 line-clamp-1");
    summary.textContent = safeText(it.summary, "Brief description of what this update contains.");

    top.appendChild(el("span", "text-xs sm:text-sm text-white/80", { "aria-hidden": "true" }));
    top.appendChild(date);

    plate.appendChild(top);
    plate.appendChild(title);
    plate.appendChild(summary);
    plateWrap.appendChild(plate);

    row.appendChild(img);
    row.appendChild(scrim);
    row.appendChild(tag);
    row.appendChild(plateWrap);

    // Optional stagger
    row.style.transitionDelay = `${Math.min(200, (i + 1) * 60)}ms`;

    list.appendChild(row);
  }
}

function renderDoors(tiles) {
  const grid = qs("#doorsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const arr = Array.isArray(tiles) ? tiles : [];
  const max = Math.min(arr.length, 4);

  for (let i = 0; i < max; i++) {
    const it = arr[i] || {};

    const tile = el(
      "a",
      "group relative overflow-hidden rounded-3xl aspect-[16/10] block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-transform duration-500 ease-out group-hover:-translate-y-1"
    , { href: safeHref(it.href, "#") });

    const img = el("img",
      "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    , { src: safeText(it.image, "./assets/img/tiles/tile.webp"), alt: safeText(it.alt, "Navigation tile image"), loading: "lazy" });

    const scrim = el("div", "absolute inset-0 bg-black/35");

    const label = el("div", "absolute left-5 top-5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs sm:text-sm text-white/95");
    label.textContent = safeText(it.label, "Destination label goes here.");

    const plateWrap = el("div", "absolute left-5 right-5 bottom-5 sm:left-7 sm:right-7 sm:bottom-7");
    const plate = el("div", "bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5");
    const title = el("div", "text-xl sm:text-2xl leading-tight text-white line-clamp-1");
    title.textContent = safeText(it.title, "Door title goes here.");
    const desc = el("div", "mt-2 text-sm sm:text-base leading-snug text-white/90 line-clamp-2");
    desc.textContent = safeText(it.subtitle, "Brief description of what this door leads to.");

    plate.appendChild(title);
    plate.appendChild(desc);
    plateWrap.appendChild(plate);

    tile.appendChild(img);
    tile.appendChild(scrim);
    tile.appendChild(label);
    tile.appendChild(plateWrap);

    grid.appendChild(tile);
  }
}

function renderSpotlight(spotlight) {
  const card = qs("#spotlightCard");
  const img = qs("#spotlightImage");
  const tag = qs("#spotlightTag");
  const title = qs("#spotlightTitle");
  const summary = qs("#spotlightSummary");

  if (card) card.href = safeHref(spotlight?.href, "#");
  setImg(img, safeText(spotlight?.image, "./assets/img/featured/spotlight.webp"), "Spotlight cover");

  if (tag) tag.textContent = safeText(spotlight?.tag, "Spotlight tag goes here.");
  if (title) title.textContent = safeText(spotlight?.title, "Guild member of the month");
  if (summary) summary.textContent = safeText(spotlight?.summary, "Every month one guild member is chosen who has been conistently present & engaging with the community. They receive a special spotlight feature and a yummy cupcake reward!");
}

function renderGallery(items) {
  const grid = qs("#galleryGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const arr = Array.isArray(items) ? items : [];
  const max = Math.min(arr.length, 12);

  for (let i = 0; i < max; i++) {
    const it = arr[i] || {};
    const src = safeText(it.image, "");
    if (!src.length) continue;

    const btn = el(
      "button",
      "group relative overflow-hidden rounded-2xl aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-transform duration-500 ease-out hover:-translate-y-1"
    );
    btn.type = "button";

    const img = el("img",
      "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    , { src, alt: safeText(it.alt, ""), loading: "lazy" });

    const scrim = el("div", "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500");

    btn.appendChild(img);
    btn.appendChild(scrim);

    btn.addEventListener("click", () => openModal(src, safeText(it.alt, "")));

    grid.appendChild(btn);
  }
}

function renderFooter(data) {
  const footerMeta = qs("#footerMeta");
  if (!footerMeta) return;

  const meta = data.footer || {};
  footerMeta.textContent = safeText(meta.text, "Brief site footer metadata goes here.");
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
  data.bulletins = Array.isArray(data.bulletins) ? data.bulletins : [];
  data.tiles = Array.isArray(data.tiles) ? data.tiles : [];
  data.spotlight = data.spotlight || {};
  data.gallery = Array.isArray(data.gallery) ? data.gallery : [];
  data.footer = data.footer || {};
  return data;
}

function pickFeaturedBulletin(bulletins) {
  const arr = Array.isArray(bulletins) ? bulletins : [];
  const pinned = arr.find((b) => b && b.pinned === true);
  return pinned || arr[0] || {};
}

function nonFeaturedList(bulletins, featured) {
  const arr = Array.isArray(bulletins) ? bulletins : [];
  return arr.filter((b) => b !== featured && b);
}

/* ---------- init ---------- */
(async function init() {
  try {
    const raw = await loadData();
    const data = normalizeData(raw);

    renderHero(data);

    const featured = pickFeaturedBulletin(data.bulletins);
    renderFeaturedBulletin(featured);
    renderBulletinList(nonFeaturedList(data.bulletins, featured));

    renderDoors(data.tiles);
    renderSpotlight(data.spotlight);
    renderGallery(data.gallery);
    renderFooter(data);

    setupReveals();
  } catch (err) {
    // Fail gracefully: keep static skeleton visible with default descriptors
    console.error(err);
  }
})();
