(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var grid = document.querySelector('.collections-grid');
        var chips = document.querySelectorAll('.filter-chip');
        if (!grid || !chips.length || typeof window.HIPJONG_PRODUCTS === 'undefined') return;

        // 1. Kosongkan grid HTML statis dan buat ulang dari Data
        grid.innerHTML = ''; 

        window.HIPJONG_PRODUCTS.forEach(function(product) {
            var card = document.createElement('div');
            card.className = 'collection-card reveal-scale';
            card.dataset.category = product.category.toLowerCase();

            // Produk dianggap "punya foto sendiri" kalau primaryImg diisi.
            // Produk yang belum punya foto cukup dikosongkan primaryImg-nya
            // di product-data.js (primaryImg: "") - otomatis full placeholder di sini.
            var hasOwnPhoto = Boolean(product.primaryImg);
            var TOTAL_SLOTS = 4;
            var imageHtml;

            if (hasOwnPhoto) {
                var images;
                if (Array.isArray(product.galleryImgs) && product.galleryImgs.length) {
                    images = product.galleryImgs.slice(0, TOTAL_SLOTS);
                } else {
                    images = [product.primaryImg];
                    if (product.hoverImg && product.hoverImg !== product.primaryImg) {
                        images.push(product.hoverImg);
                    }
                }

                imageHtml = '';
                images.forEach(function (src, i) {
                    imageHtml += '<img src="' + src + '" alt="' + product.name + (i === 0 ? '' : ' - view ' + (i + 1)) + '" class="card-photo' + (i === 0 ? ' is-active' : '') + '" loading="lazy" decoding="async">';
                });
                for (var i = images.length; i < TOTAL_SLOTS; i++) {
                    imageHtml += '<div class="card-photo photo-placeholder" aria-hidden="true"><span>Photo Coming Soon</span></div>';
                }
            } else {
                imageHtml =
                    '<div class="card-photo photo-placeholder is-active" aria-hidden="true"><span>Photo Coming Soon</span></div>' +
                    '<div class="card-photo photo-placeholder" aria-hidden="true"><span>Photo Coming Soon</span></div>' +
                    '<div class="card-photo photo-placeholder" aria-hidden="true"><span>Photo Coming Soon</span></div>' +
                    '<div class="card-photo photo-placeholder" aria-hidden="true"><span>Photo Coming Soon</span></div>';
            }

            card.innerHTML = 
                '<div class="card-image-wrapper">' +
                    imageHtml +
                '</div>' +
                '<div class="card-info">' +
                    '<div class="card-text">' +
                        '<h3>' + product.name + '</h3>' +
                        '<p>' + product.tagline + '</p>' +
                        '<span class="card-price">' + product.priceLabel + '</span>' +
                    '</div>' +
                    '<a href="product.html?id=' + product.id + '" class="card-arrow-btn ' + product.arrowColor + '" aria-label="View ' + product.name + '">&rarr;</a>' +
                '</div>';
            
            grid.appendChild(card);
            
            // Trigger reflow kecil agar animasi reveal (jika ada) tetap berjalan
            setTimeout(function() { card.style.opacity = 1; card.style.transform = 'scale(1)'; }, 50);
        });

        var cards = grid.querySelectorAll('.collection-card');

        // 2. Fungsi Filter berdasarkan Nama Kategori
        // Label chip di UI tidak selalu sama persis dengan nama category di data,
        // jadi dipetakan di sini:
        // - "Pool Tables" (chip) -> "billiard tables" (category data)
        // - "Foosball Table" (chip) -> "foosball tables" (category data)
        // - "Texas Hold'em Poker Tables" -> kategori baru, kosong dulu sampai ada produk khusus
        // - "Other Tables" (chip) -> semua category selain kategori-kategori bernama di bawah
        var chipToCategories = {
            'mahjong tables': ['mahjong tables'],
            'pool tables': ['billiard tables'],
            'poker tables': ['poker tables'],
            "texas hold'em poker tables": ["texas hold'em poker tables"],
            'roulette tables': ['roulette tables'],
            'foosball table': ['foosball tables']
        };
        var namedCategories = [
            'mahjong tables', 'billiard tables', 'poker tables',
            "texas hold'em poker tables", 'roulette tables', 'foosball tables'
        ];

        function applyFilter(chip) {
            var label = chip.textContent.trim().toLowerCase();

            Array.prototype.forEach.call(cards, function (card) {
                var cardCat = card.dataset.category;
                var show;
                if (label === 'all tables') {
                    show = true;
                } else if (label === 'other tables') {
                    show = namedCategories.indexOf(cardCat) === -1;
                } else if (chipToCategories[label]) {
                    show = chipToCategories[label].indexOf(cardCat) !== -1;
                } else {
                    show = cardCat === label;
                }
                card.style.display = show ? '' : 'none';
            });
        }

        Array.prototype.forEach.call(chips, function (chip) {
            chip.addEventListener('click', function () {
                // Pindahkan class is-active
                Array.prototype.forEach.call(chips, function (c) { c.classList.remove('is-active'); });
                chip.classList.add('is-active');
                
                applyFilter(chip);
            });
        });

        // Terapkan filter awal — cek dulu apakah datang dari link kategori (?cat=...)
        var catMap = {
            mahjong: 'mahjong tables',
            poker: 'poker tables',
            billiard: 'pool tables',
            foosball: 'foosball table'
        };
        var catParam = new URLSearchParams(window.location.search).get('cat');
        var targetLabel = catParam ? catMap[catParam.toLowerCase()] : null;

        var active = null;
        if (targetLabel) {
            active = Array.prototype.filter.call(chips, function (c) {
                return c.textContent.trim().toLowerCase() === targetLabel;
            })[0];
        }
        active = active || document.querySelector('.filter-chip.is-active') || chips[0];

        Array.prototype.forEach.call(chips, function (c) { c.classList.remove('is-active'); });
        active.classList.add('is-active');
        applyFilter(active);
    });
})();