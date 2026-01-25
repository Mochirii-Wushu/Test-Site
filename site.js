/* site.js
   Global loader for header.html and footer.html + small UI behaviors.
   Usage per page:
     <div id="header"></div>
     ...page...
     <div id="footer"></div>
     <script src="./site.js" defer></script>
*/

(() => {
  "use strict";

  const HEADER_URL = "./header.html";
  const FOOTER_URL = "./footer.html";

  const $ = (sel) => document.querySelector(sel);

  function pathname() {
    const p = window.location.pathname || "";
    return p.split("/").pop() || "index.html";
  }

  function pageKeyFromFile(file) {
    const f = (file || "").toLowerCase();
    if (f === "" || f === "index.html") return "home";
    if (f.includes("events")) return "events";
    if (f.includes("leaders")) return "leaders";
    if (f.includes("ranks")) return "ranks";
    if (f.includes("join")) return "join";
    if (f.includes("codex")) return "codex";
    if (f.includes("recruitment")) return "recruitment";
    return "home";
  }

  function applyActiveNav(root, key) {
    if (!root) return;

    const links = root.querySelectorAll("[data-nav]");
    links.forEach((a) => {
      a.classList.remove("text-white");
      a.classList.remove("font-semibold");
      a.classList.remove("underline");
      a.classList.remove("underline-offset-4");
      a.classList.remove("decoration-white/40");
      a.classList.add("text-white/80");
    });

    const active = root.querySelector(`[data-nav="${key}"]`);
    if (!active) return;

    active.classList.remove("text-white/80");
    active.classList.add("text-white", "font-semibold", "underline", "underline-offset-4", "decoration-white/40");
  }

  function initMobileMenu(headerRoot) {
    if (!headerRoot) return;

    const btn = headerRoot.querySelector('[data-role="menu-button"]');
    const panel = headerRoot.querySelector('[data-role="mobile-panel"]');
    const mobileNav = headerRoot.querySelector("#mobile-nav");
    if (!btn || !panel || !mobileNav) return;

    const setOpen = (open) => {
      if (open) {
        panel.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
      } else {
        panel.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    };

    // Default closed
    setOpen(false);

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    // Close when a link is clicked
    mobileNav.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("a")) setOpen(false);
    });

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function setFooterYear(footerRoot) {
    if (!footerRoot) return;
    const year = new Date().getFullYear();
    const el = footerRoot.querySelector("#copyright-text");
    if (el) el.textContent = `© ${year} Mōchirīī`;
  }

  async function mount(url, mountSelector) {
    const mountEl = $(mountSelector);
    if (!mountEl) return null;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      const html = await res.text();
      mountEl.innerHTML = html;
      return mountEl;
    } catch {
      return null;
    }
  }

  async function boot() {
    const file = pathname();
    const key = pageKeyFromFile(file);

    // Header
    const headerMount = await mount(HEADER_URL, "#header");
    if (headerMount) {
      const headerRoot = headerMount.querySelector("header") || headerMount;
      applyActiveNav(headerRoot, key);
      initMobileMenu(headerRoot);
    }

    // Footer
    const footerMount = await mount(FOOTER_URL, "#footer");
    if (footerMount) {
      const footerRoot = footerMount.querySelector("footer") || footerMount;
      setFooterYear(footerRoot);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
