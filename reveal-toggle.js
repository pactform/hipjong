/* =========================================================
   reveal-toggle.js
   Additive script — loaded AFTER script.js so it never edits,
   overrides, or removes any existing behaviour or file.

   What it does:
   Every element already using the site's .reveal / .reveal-left
   / .reveal-right / .reveal-scale system (used for both text
   and photos across the site) currently only fades IN once,
   the first time it scrolls into view, and then stays visible
   forever.

   This script keeps observing those same elements for the
   whole life of the page, so the "active" class (which is what
   style.css uses to show/hide them) gets toggled every time an
   element enters OR leaves the viewport, each with a short
   pause instead of happening instantly:
     - scrolls into view    -> waits ENTER_DELAY, then fades in
       (active added)
     - scrolls out of view  -> waits EXIT_DELAY, then fades out
       (active removed)
     - either timer is cancelled if the element crosses back
       before it fires, so a quick back-and-forth scroll
       doesn't cause flicker

   No HTML structure, classes, or other stylesheets/scripts are
   changed — this only toggles the same "active" class the site
   already relies on.
========================================================= */
(function () {
    'use strict';

    if (!('IntersectionObserver' in window)) return;

    // How long (ms) an element must stay IN view before it fades in.
    var ENTER_DELAY = 200;
    // How long (ms) an element must stay OUT of view before it fades out.
    var EXIT_DELAY = 600;

    var prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setup() {
        var targets = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale'
        );
        if (!targets.length) return;

        // Respect reduced-motion users: just show everything, no toggling.
        if (prefersReducedMotion) {
            targets.forEach(function (el) { el.classList.add('active'); });
            return;
        }

        // Tracks any pending timer per element (either an "enter" or an
        // "exit" timer), so it can be cancelled if the element crosses
        // back over the viewport edge before the timer fires.
        var pendingTimers = new WeakMap();

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var el = entry.target;
                var timer = pendingTimers.get(el);

                if (timer) {
                    clearTimeout(timer);
                    pendingTimers.delete(el);
                }

                if (entry.isIntersecting) {
                    // Just entered: wait a beat, then fade in.
                    timer = window.setTimeout(function () {
                        el.classList.add('active');
                        pendingTimers.delete(el);
                    }, ENTER_DELAY);
                } else {
                    // Just left: wait a bit longer, then fade out.
                    timer = window.setTimeout(function () {
                        el.classList.remove('active');
                        pendingTimers.delete(el);
                    }, EXIT_DELAY);
                }
                pendingTimers.set(el, timer);
            });
        }, {
            root: null,
            // Trigger a little before the element fully reaches the edge,
            // matching the feel of the original one-shot reveal.
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12
        });

        targets.forEach(function (el) { observer.observe(el); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
