/* =========================================================
   testimonials.js — menambahkan section "What people say"
   (social proof) ke about.html. Testimoni di bawah ini masih
   PLACEHOLDER — ganti dengan kutipan pelanggan asli begitu ada.

   Section ini dibuat & disisipkan lewat JS supaya about.html
   tidak perlu diedit ulang strukturnya; cukup file ini ditautkan.
   ========================================================= */
(function () {
    'use strict';

    var TESTIMONIALS = [
        {
            quote: 'Lorem ipsum — looks like a normal dining table until game night starts. Replace with a real customer quote.',
            name: 'Placeholder Customer',
            detail: 'Verified buyer — Social Night Series'
        },
        {
            quote: 'Lorem ipsum — setup took minutes and the shuffling tech is genuinely silent. Replace with a real customer quote.',
            name: 'Placeholder Customer',
            detail: 'Verified buyer — Elevated Home Series'
        },
        {
            quote: 'Lorem ipsum — the custom Atelier build matched our living room perfectly. Replace with a real customer quote.',
            name: 'Placeholder Customer',
            detail: 'Verified buyer — Atelier Custom Series'
        }
    ];

    function injectStyle() {
        if (document.getElementById('hj-testimonials-style')) return;
        var css = ''
            + '.hj-testimonials{padding:clamp(2rem,5vw,3.5rem) 0;}'
            + '.hj-testimonials h2{font-family:var(--font-display,inherit);'
            + 'font-size:clamp(1.4rem,2.6vw,1.9rem);font-weight:500;'
            + 'color:var(--text-dark,#221A15);margin-bottom:1.75rem;}'
            + '.hj-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));'
            + 'gap:1.5rem;}'
            + '.hj-testimonial-card{background:var(--cream,#F8F6F0);border:1px solid var(--border-color,#D6D2CA);'
            + 'border-radius:16px;padding:1.5rem;}'
            + '.hj-testimonial-quote{font-size:.95rem;line-height:1.65;color:var(--text-dark,#221A15);'
            + 'margin-bottom:1rem;}'
            + '.hj-testimonial-name{font-family:var(--font-display,inherit);font-weight:600;'
            + 'font-size:.9rem;color:var(--text-dark,#221A15);}'
            + '.hj-testimonial-detail{font-size:.8rem;color:var(--text-dark,#221A15);opacity:.6;}'
            + '.hj-testimonials-note{font-size:.75rem;color:var(--text-dark,#221A15);opacity:.5;'
            + 'margin-top:1.25rem;}';
        var styleEl = document.createElement('style');
        styleEl.id = 'hj-testimonials-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

function buildSection() {
        var section = document.createElement('section');
        section.className = 'page-content hj-testimonials reveal-group';

        var cards = TESTIMONIALS.map(function (t) {
            return '<div class="hj-testimonial-card reveal">'
                + '<p class="hj-testimonial-quote">&ldquo;' + escapeHtml(t.quote) + '&rdquo;</p>'
                + '<p class="hj-testimonial-name">' + escapeHtml(t.name) + '</p>'
                + '<p class="hj-testimonial-detail">' + escapeHtml(t.detail) + '</p>'
                + '</div>';
        }).join('');

        section.innerHTML = '<h2>What people say</h2><div class="hj-testimonials-grid">' + cards + '</div>';
        return section;
    } 

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        // Hanya jalan di halaman yang punya penanda "WHO IT'S FOR" (about.html),
        // supaya tidak nyasar ke halaman lain kalau file ini ikut ter-load di sana.
        var anchor = document.querySelector('.statement-band.on-terracotta');
        var isAboutPage = /about\.html$/.test(window.location.pathname) || document.querySelector('.eyebrow.red-text') === null && anchor;
        if (!anchor) return;

        injectStyle();
        anchor.parentNode.insertBefore(buildSection(), anchor);

        // Trigger reveal-on-scroll kalau IntersectionObserver punya handler di script.js
        // (script.js sudah men-query .reveal saat DOMContentLoaded sebelum section ini ada,
        // jadi kita tampilkan langsung supaya tidak nyangkut hilang/opacity 0).
        anchor.previousElementSibling.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('active');
        });
    });
})();
