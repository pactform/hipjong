/* =========================================================
   product-extra.js — addition untuk product.html:
   1. Thumbnail galeri (foto utama + foto hover yang sudah ada
      di product-data.js, sebelumnya tidak dipakai sama sekali).
   2. Produk terkait (kategori sama), diambil dari HIPJONG_PRODUCTS.

   Tidak mengubah <script> inline yang sudah ada di product.html —
   file ini berjalan terpisah setelahnya.
   ========================================================= */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    function injectStyle() {
        if (document.getElementById('hj-product-extra-style')) return;
        var css = ''
            + '#product-thumbs{display:flex;gap:.6rem;margin-top:.75rem;}'
            + '#product-thumbs button{width:64px;height:64px;padding:0;border-radius:0;'
            + 'overflow:hidden;cursor:pointer;background:var(--cream-deep,#E6E1D8);'
            + 'border:2px solid transparent;}'
            + '#product-thumbs button.active{border-color:var(--brand-green,#204C39);}'
            + '#product-thumbs img{width:100%;height:100%;object-fit:cover;display:block;}'
            + '#related-products{margin-top:clamp(3rem,6vw,5rem);}'
            + '#related-products h2{font-family:var(--font-display,inherit);'
            + 'font-size:clamp(1.3rem,2.4vw,1.7rem);font-weight:500;'
            + 'color:var(--text-dark,#221A15);margin-bottom:1.25rem;}'
            + '.hj-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));'
            + 'gap:1.25rem;}'
            + '.hj-related-card{display:block;text-decoration:none;color:inherit;'
            + 'border:1px solid var(--border-color,#D6D2CA);border-radius:0;overflow:hidden;}'
            + '.hj-related-card img{width:100%;aspect-ratio:4/3;object-fit:cover;'
            + 'background:var(--cream-deep,#E6E1D8);display:block;}'
            + '.hj-related-card-body{padding:.85rem 1rem;}'
            + '.hj-related-card-name{font-family:var(--font-display,inherit);font-weight:500;'
            + 'font-size:.95rem;color:var(--text-dark,#221A15);}'
            + '.hj-related-card-price{font-size:.85rem;color:var(--brand-red,#AF3E2B);margin-top:.2rem;}';
        var styleEl = document.createElement('style');
        styleEl.id = 'hj-product-extra-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function renderThumbs(product) {
        var wrap = document.getElementById('product-thumbs');
        var mainImg = document.getElementById('product-image');
        if (!wrap || !mainImg) return;

        var images = [product.primaryImg];
        if (product.hoverImg && product.hoverImg !== product.primaryImg) {
            images.push(product.hoverImg);
        }
        if (images.length < 2) return; // tidak perlu thumbnail kalau cuma 1 foto

        wrap.innerHTML = '';
        images.forEach(function (src, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'active-check' + (i === 0 ? ' active' : '');
            btn.setAttribute('aria-label', 'View photo ' + (i + 1));
            btn.innerHTML = '<img src="' + escapeHtml(src) + '" alt="">';
            btn.addEventListener('click', function () {
                mainImg.src = src;
                wrap.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
            });
            wrap.appendChild(btn);
        });
    }

    function renderRelated(product) {
        var container = document.getElementById('related-products');
        if (!container || typeof window.HIPJONG_PRODUCTS === 'undefined') return;

        var related = window.HIPJONG_PRODUCTS.filter(function (p) {
            return p.id !== product.id && p.category === product.category;
        });

        // Kalau tidak ada produk lain di kategori yang sama, tampilkan produk lain apa saja (maks 3)
        if (!related.length) {
            related = window.HIPJONG_PRODUCTS.filter(function (p) { return p.id !== product.id; });
        }
        related = related.slice(0, 3);
        if (!related.length) return;

        var html = '<h2>You might also like</h2><div class="hj-related-grid">';
        related.forEach(function (p) {
            html += '<a class="hj-related-card" href="product.html?id=' + encodeURIComponent(p.id) + '">'
                + '<img src="' + escapeHtml(p.primaryImg) + '" alt="' + escapeHtml(p.name) + '">'
                + '<div class="hj-related-card-body">'
                + '<div class="hj-related-card-name">' + escapeHtml(p.name) + '</div>'
                + '<div class="hj-related-card-price">' + escapeHtml(p.priceLabel) + '</div>'
                + '</div></a>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    ready(function () {
        if (typeof window.HIPJONG_PRODUCTS === 'undefined') return;
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        var product = window.HIPJONG_PRODUCTS.find(function (p) { return p.id === id; });
        if (!product) return;

        injectStyle();
        renderThumbs(product);
        renderRelated(product);
    });
})();
