/* =========================================================
   search.js — HIPJONG site search (addition, tidak mengubah
   file lain). Menghubungkan tombol .search-btn & .drawer-search
   yang SUDAH ADA di setiap halaman ke overlay pencarian produk.

   Cara pakai: cukup tambahkan
     <script src="search.js" defer></script>
   di halaman manapun. Tidak perlu perubahan lain.
   ========================================================= */
(function () {
    'use strict';

    var overlay, input, resultsEl, emptyEl;
    var dataReady = false;

    /* Muat product-data.js otomatis kalau halaman belum memuatnya
       (mis. index.html, about.html, dll tidak butuh script itu
       untuk kebutuhan lain, jadi kita muat sendiri di sini). */
    function ensureProductData(cb) {
        if (typeof window.HIPJONG_PRODUCTS !== 'undefined') {
            dataReady = true;
            cb();
            return;
        }
        var s = document.createElement('script');
        s.src = 'product-data.js';
        s.onload = function () { dataReady = true; cb(); };
        s.onerror = function () { dataReady = false; cb(); };
        document.head.appendChild(s);
    }

    function injectStyle() {
        if (document.getElementById('hj-search-style')) return;
        var css = ''
            + '.hj-search-overlay{position:fixed;inset:0;background:rgba(34,26,21,.55);'
            + 'z-index:999;display:flex;align-items:flex-start;justify-content:center;'
            + 'padding:8vh 1.25rem 2rem;opacity:0;pointer-events:none;transition:opacity .2s ease;}'
            + '.hj-search-overlay.active{opacity:1;pointer-events:auto;}'
            + '.hj-search-box{background:var(--white,#fff);border-radius:16px;width:100%;'
            + 'max-width:560px;max-height:74vh;display:flex;flex-direction:column;overflow:hidden;'
            + 'box-shadow:0 20px 60px rgba(0,0,0,.25);transform:translateY(-12px);'
            + 'transition:transform .2s ease;}'
            + '.hj-search-overlay.active .hj-search-box{transform:translateY(0);}'
            + '.hj-search-input-row{display:flex;align-items:center;gap:.75rem;'
            + 'padding:1rem 1.25rem;border-bottom:1px solid var(--border-color,#D6D2CA);}'
            + '.hj-search-input-row svg{flex:0 0 auto;color:var(--text-dark,#221A15);opacity:.6;}'
            + '.hj-search-input-row input{flex:1;border:none;outline:none;font-size:1rem;'
            + 'font-family:var(--font-body,inherit);color:var(--text-dark,#221A15);background:transparent;}'
            + '.hj-search-close{border:none;background:none;cursor:pointer;font-size:1.3rem;'
            + 'line-height:1;color:var(--text-dark,#221A15);opacity:.6;padding:.25rem;}'
            + '.hj-search-close:hover{opacity:1;}'
            + '.hj-search-results{overflow-y:auto;padding:.5rem;}'
            + '.hj-search-item{display:flex;align-items:center;gap:.9rem;padding:.65rem .75rem;'
            + 'border-radius:10px;text-decoration:none;color:inherit;}'
            + '.hj-search-item:hover,.hj-search-item:focus{background:var(--cream,#F8F6F0);}'
            + '.hj-search-item img{width:48px;height:48px;object-fit:cover;border-radius:0;'
            + 'background:var(--cream-deep,#E6E1D8);flex:0 0 auto;}'
            + '.hj-search-item-name{font-family:var(--font-display,inherit);font-weight:500;'
            + 'color:var(--text-dark,#221A15);font-size:.95rem;}'
            + '.hj-search-item-cat{font-size:.8rem;color:var(--text-dark,#221A15);opacity:.55;}'
            + '.hj-search-empty{padding:2rem 1.25rem;text-align:center;font-size:.9rem;'
            + 'color:var(--text-dark,#221A15);opacity:.6;}'
            + 'body.hj-search-open{overflow:hidden;}';
        var styleEl = document.createElement('style');
        styleEl.id = 'hj-search-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    function buildOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'hj-search-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Search products');
        overlay.innerHTML =
            '<div class="hj-search-box">' +
                '<div class="hj-search-input-row">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
                    '<input type="text" placeholder="Search tables (mahjong, billiard, poker...)" autocomplete="off" aria-label="Search products">' +
                    '<button type="button" class="hj-search-close" aria-label="Close search">&times;</button>' +
                '</div>' +
                '<div class="hj-search-results"></div>' +
            '</div>';
        document.body.appendChild(overlay);

        input = overlay.querySelector('input');
        resultsEl = overlay.querySelector('.hj-search-results');

        overlay.querySelector('.hj-search-close').addEventListener('click', closeSearch);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeSearch();
        });
        input.addEventListener('input', function () { renderResults(input.value); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
        });
    }

    function renderResults(query) {
        query = (query || '').trim().toLowerCase();
        resultsEl.innerHTML = '';

        var products = (typeof window.HIPJONG_PRODUCTS !== 'undefined') ? window.HIPJONG_PRODUCTS : [];

        if (!dataReady) {
            resultsEl.innerHTML = '<div class="hj-search-empty">Search isn\'t available right now.</div>';
            return;
        }

        var list = !query ? products : products.filter(function (p) {
            return (p.name + ' ' + p.tagline + ' ' + p.category).toLowerCase().indexOf(query) !== -1;
        });

        if (!list.length) {
            resultsEl.innerHTML = '<div class="hj-search-empty">No tables found' + (query ? ' for &ldquo;' + escapeHtml(query) + '&rdquo;' : '') + '.</div>';
            return;
        }

        list.forEach(function (p) {
            var a = document.createElement('a');
            a.className = 'hj-search-item';
            a.href = 'product.html?id=' + encodeURIComponent(p.id);
            a.innerHTML =
                '<img src="' + escapeHtml(p.primaryImg) + '" alt="">' +
                '<span>' +
                    '<span class="hj-search-item-name">' + escapeHtml(p.name) + '</span><br>' +
                    '<span class="hj-search-item-cat">' + escapeHtml(p.category) + ' &middot; ' + escapeHtml(p.priceLabel) + '</span>' +
                '</span>';
            resultsEl.appendChild(a);
        });
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function openSearch() {
        injectStyle();
        buildOverlay();
        document.body.classList.add('hj-search-open');
        overlay.classList.add('active');
        ensureProductData(function () { renderResults(input.value); });
        window.setTimeout(function () { input.focus(); }, 50);
    }

    function closeSearch() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.classList.remove('hj-search-open');
    }

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var triggers = document.querySelectorAll('.search-btn, .drawer-search');
        Array.prototype.forEach.call(triggers, function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                openSearch();
            });
        });
    });
})();
