/* =========================================================
   loader.js — page loader controller
   Loaded (blocking, tiny) in <head> so the loader is on
   screen before the first paint.

   Behaviour:
   - adds .is-loading to <html>  → overlay visible
   - once the page has fully loaded AND the animation has
     played for at least MIN_MS → removes .is-loading
     (overlay lifts, reveal animations start)
   - hard fail-safe after MAX_MS so the overlay can never
     get stuck on a slow or failed asset
========================================================= */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tweak these two numbers to make the loader shorter / longer
    var MIN_MS = reduceMotion ? 400 : 1300;   // minimum time on screen
    var MAX_MS = 8000;                        // never longer than this

    var startedAt = Date.now();
    var finished = false;

    root.classList.add('is-loading');

    function removeOverlay() {
        var el = document.querySelector('.page-loader');
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function finish() {
        if (finished) return;
        finished = true;
        root.classList.remove('is-loading');
        root.classList.add('is-loaded');
        // Take the overlay out of the DOM once its exit transition is done
        setTimeout(removeOverlay, 1200);
    }

    function onPageReady() {
        var elapsed = Date.now() - startedAt;
        setTimeout(finish, Math.max(0, MIN_MS - elapsed));
    }

    if (document.readyState === 'complete') {
        onPageReady();
    } else {
        window.addEventListener('load', onPageReady);
    }

    setTimeout(finish, MAX_MS);

    // Coming back via the browser's back/forward cache: never show a stale loader
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) finish();
    });
})();
