/* recruitment.js
   Lightweight logic for recruitment.html
   Designed for future expansion without breaking layout
*/

(() => {
  "use strict";

  const DATA_URL = "./data/recruitment.json";

  const $ = (selector) => document.querySelector(selector);

  async function loadRecruitmentData() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();

      // Optional future hooks:
      // If you later add data-role elements, this will support them
      if (data?.page?.title) {
        const title = $('[data-role="recruitment-title"]');
        if (title) title.textContent = data.page.title;
      }

      if (data?.page?.subtitle) {
        const subtitle = $('[data-role="recruitment-subtitle"]');
        if (subtitle) subtitle.textContent = data.page.subtitle;
      }

      // Reserved for future expansion:
      // sections, highlights, or dynamic lists
    } catch (err) {
      // Silent fail — page remains fully functional
      // Uncomment for debugging if needed:
      // console.warn("Recruitment data load skipped:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadRecruitmentData();
  });
})();
