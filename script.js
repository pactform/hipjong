/* =========================================================
   HIPJONG — script.js
   1. Mobile drawer (overlay, scroll lock, Escape, resize)
   2. Scroll reveal (IntersectionObserver)
   3. Day / Night image morph
   4. Filter chips (Shop)
   5. Penanda halaman aktif di navigasi
   ========================================================= */
(function () {
    'use strict';

    /* Kalau file ini jalan, tandai <html> supaya CSS boleh
       menyembunyikan elemen reveal. Tanpa JS, semua tetap
       terlihat (tidak ada halaman kosong). */
    document.documentElement.classList.add('js');

    var ready = function (fn) {
        if (document.readyState !== 'loading') { fn(); }
        else { document.addEventListener('DOMContentLoaded', fn); }
    };

    ready(function () {

        /* ---------- 1. MOBILE DRAWER ---------- */
        var toggle = document.querySelector('.menu-toggle');
        var drawer = document.querySelector('.nav-links');
        var overlay = null;
        var lastScroll = 0;

        if (toggle && drawer) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);

            var openMenu = function () {
                lastScroll = window.scrollY;
                drawer.classList.add('active');
                overlay.classList.add('active');
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
                document.body.classList.add('nav-open');
                // Fokus ke link pertama untuk pengguna keyboard
                var first = drawer.querySelector('a, button');
                if (first) { first.focus({ preventScroll: true }); }
            };

            var closeMenu = function (returnFocus) {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
                window.scrollTo(0, lastScroll);
                if (returnFocus) { toggle.focus({ preventScroll: true }); }
            };

            var isOpen = function () { return drawer.classList.contains('active'); };

            toggle.addEventListener('click', function () {
                isOpen() ? closeMenu(false) : openMenu();
            });

            overlay.addEventListener('click', function () { closeMenu(true); });

            // Tutup drawer setelah memilih menu
            drawer.addEventListener('click', function (e) {
                if (e.target.closest('a')) { closeMenu(false); }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && isOpen()) { closeMenu(true); }
            });

            /* Kalau jendela dilebarkan (misal keluar dari half view)
               saat drawer terbuka, drawer harus ikut tertutup —
               kalau tidak, body tetap terkunci dan halaman
               terlihat "tidak bisa di-scroll". */
            var mq = window.matchMedia('(min-width: 1025px)');
            var handleMQ = function (e) {
                if (e.matches && isOpen()) { closeMenu(false); }
            };
            mq.addEventListener ? mq.addEventListener('change', handleMQ)
                                : mq.addListener(handleMQ);
        }

        /* ---------- 2. SCROLL REVEAL ---------- */
        var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!revealEls.length) {
            // tidak ada apa-apa untuk dianimasikan
        } else if (reduceMotion || !('IntersectionObserver' in window)) {
            // Fallback: tampilkan langsung
            Array.prototype.forEach.call(revealEls, function (el) {
                el.classList.add('active');
            });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        io.unobserve(entry.target); // sekali tampil, tetap tampil
                    }
                });
            }, {
                root: null,
                // Munculkan sedikit sebelum masuk viewport supaya
                // di HP tidak terasa "baru muncul setelah lewat"
                rootMargin: '0px 0px -8% 0px',
                threshold: 0.08
            });

            Array.prototype.forEach.call(revealEls, function (el) {
                io.observe(el);
            });

            /* Jaring pengaman: elemen yang sudah ada di layar saat
               load (hero) langsung diaktifkan. */
            window.setTimeout(function () {
                Array.prototype.forEach.call(revealEls, function (el) {
                    var r = el.getBoundingClientRect();
                    if (r.top < window.innerHeight && r.bottom > 0) {
                        el.classList.add('active');
                    }
                });
            }, 120);
        }

        /* ---------- 3. DAY / NIGHT MORPH ---------- */
        var modeItems = document.querySelectorAll('.mode-item[data-mode]');
        var dayImg = document.querySelector('.vibe-image-day');
        var nightImg = document.querySelector('.vibe-image-night');
        var vibeVisual = document.querySelector('.vibe-visual');

        if (modeItems.length && dayImg && nightImg) {
            var setMode = function (mode) {
                var night = mode === 'night';
                dayImg.classList.toggle('is-hidden', night);
                nightImg.classList.toggle('is-visible', night);
                if (vibeVisual) { vibeVisual.classList.toggle('night-active', night); }

                Array.prototype.forEach.call(modeItems, function (item) {
                    var on = item.getAttribute('data-mode') === mode;
                    item.classList.toggle('active-mode', on);
                    item.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
            };

            Array.prototype.forEach.call(modeItems, function (item) {
                // Bisa diakses lewat keyboard
                if (!item.hasAttribute('tabindex')) { item.setAttribute('tabindex', '0'); }
                if (!item.hasAttribute('role')) { item.setAttribute('role', 'button'); }

                item.addEventListener('click', function () {
                    setMode(item.getAttribute('data-mode'));
                });

                item.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setMode(item.getAttribute('data-mode'));
                    }
                });
            });
        }

        /* ---------- 4. FILTER CHIPS ---------- */
        var chips = document.querySelectorAll('.filter-chip');
        if (chips.length) {
            Array.prototype.forEach.call(chips, function (chip) {
                chip.addEventListener('click', function () {
                    Array.prototype.forEach.call(chips, function (c) {
                        c.classList.remove('is-active');
                        c.setAttribute('aria-pressed', 'false');
                    });
                    chip.classList.add('is-active');
                    chip.setAttribute('aria-pressed', 'true');
                    // Chip aktif digeser ke tengah pada layar sempit
                    if (chip.scrollIntoView) {
                        chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
                    }
                });
            });
        }

        /* ---------- 5. HALAMAN AKTIF ---------- */
        var path = window.location.pathname.split('/').pop() || 'index.html';
        var navAnchors = document.querySelectorAll('.nav-links a');
        Array.prototype.forEach.call(navAnchors, function (a) {
            if (a.getAttribute('href') === path) {
                a.setAttribute('aria-current', 'page');
            }
        });
    });
})();
