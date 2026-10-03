"use client";

import { useEffect } from "react";

/** Keep native/Next locale navigation between pages; re-scroll every local anchor click. */
export function HomepageAnchorNavigation() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target?.matches(".homepage section[id]")) return;

      // Capture runs before Next Link, which honors defaultPrevented. Its supplied
      // onClick still runs, so MobileNav can close normally without a second route push.
      event.preventDefault();
      if (window.location.hash !== url.hash) window.history.pushState(null, "", url.href);
      // Let the mobile dialog release its scroll lock and restore trigger focus first.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          block: "start",
        });
      }));
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
