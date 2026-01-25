/* events.js
   Minimal wiring for events.html.
   Loads ./data/events.json and binds content into existing data-role hooks.
*/

(function () {
  "use strict";

  const DATA_URL = "./data/events.json";

  const $ = (sel) => document.querySelector(sel);

  function setText(selector, value) {
    const el = $(selector);
    if (!el) return;
    el.textContent = value ?? "";
  }

  function setAttr(selector, attr, value) {
    const el = $(selector);
    if (!el || !value) return;
    el.setAttribute(attr, value);
  }

  function safeArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function buildUpcomingCard(item) {
    const article = document.createElement("article");
    article.className =
      "bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden";

    const href = item?.href || "https://discord.com/invite/dPafqMwWPK";
    const imgSrc = item?.image || "./assets/img/events/event-01.webp";
    const title = item?.title || "Event title goes here";
    const date = item?.date || "YYYY-MM-DD";
    const time = item?.time || "Time / timezone";
    const summary =
      item?.summary ||
      "Brief description of what belongs here: one-line purpose and how to join.";

    article.innerHTML = `
      <div class="relative aspect-[16/10]">
        <img
          src="${imgSrc}"
          alt="Event artwork"
          class="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-black/35"></div>
      </div>

      <div class="p-5">
        <div class="flex items-center justify-between gap-3 text-xs sm:text-sm text-white/70">
          <span>${date}</span>
          <span>${time}</span>
        </div>

        <h3 class="mt-3 font-[var(--font-display)] text-xl leading-tight">
          ${title}
        </h3>

        <p class="mt-2 text-sm leading-snug text-white/80">
          ${summary}
        </p>

        <div class="mt-4">
          <a
            href="${href}"
            ${href.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}
            class="text-sm text-white/80 underline underline-offset-4 decoration-white/25 hover:decoration-white/60"
          >
            Open details
          </a>
        </div>
      </div>
    `;

    return article;
  }

  async function load() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
      const data = await res.json();

      // Page hero copy
      if (data?.page) {
        setText('[data-role="events-pill"]', data.page.pill);
        setText('[data-role="events-title"]', data.page.title);
        setText('[data-role="events-desc"]', data.page.description);
      }

      // Featured
      if (data?.featured) {
        setAttr('[data-role="featured-image"]', "src", data.featured.image);
        setText('[data-role="featured-tag"]', data.featured.tag);
        setText('[data-role="featured-date"]', data.featured.date);
        setText('[data-role="featured-time"]', data.featured.time);
        setText('[data-role="featured-title"]', data.featured.title);
        setText('[data-role="featured-summary"]', data.featured.summary);
        setAttr('[data-role="featured-cta"]', "href", data.featured.ctaHref);
        setText('[data-role="featured-cta"]', data.featured.ctaLabel);
      }

      // Upcoming (replace the static placeholder cards if JSON provides items)
      const upcomingRoot = $('[data-role="events-upcoming"]');
      const upcomingItems = safeArray(data?.upcoming);

      if (upcomingRoot && upcomingItems.length) {
        upcomingRoot.innerHTML = "";
        for (const item of upcomingItems) {
          upcomingRoot.appendChild(buildUpcomingCard(item));
        }
      }

      // Recurring (optional wiring if you later add data)
      // We keep this minimal: HTML already contains editable blocks.
      // If you add data.recurring, you can extend here to render it dynamically.

    } catch (err) {
      // Silent fail: page still shows placeholder content.
      // Uncomment next line if you want debugging during development.
      // console.warn("events.js:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
