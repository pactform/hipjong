/* =========================================================
   cart.js
   Cart sederhana berbasis localStorage — tidak ada backend.
   Dipasang di semua halaman supaya badge "Cart (0)" di navbar
   selalu sinkron, dan dipakai oleh product.html & cart.html
   untuk menambah/mengubah/menghapus item.
   ========================================================= */
(function () {
    const CART_KEY = "hipjong_cart";

    function getCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            /* localStorage tidak tersedia (mis. private browsing penuh) — abaikan */
        }
        updateCartBadges();
    }

    function addToCart(id, qty) {
        qty = Math.max(1, parseInt(qty, 10) || 1);
        const cart = getCart();
        const existing = cart.find((item) => item.id === id);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ id: id, qty: qty });
        }
        saveCart(cart);
    }

    function updateQty(id, qty) {
        qty = parseInt(qty, 10);
        let cart = getCart();
        if (qty <= 0) {
            cart = cart.filter((item) => item.id !== id);
        } else {
            const existing = cart.find((item) => item.id === id);
            if (existing) existing.qty = qty;
        }
        saveCart(cart);
    }

    function removeFromCart(id) {
        const cart = getCart().filter((item) => item.id !== id);
        saveCart(cart);
    }

    function getCartCount() {
        return getCart().reduce((sum, item) => sum + item.qty, 0);
    }

    function updateCartBadges() {
        const count = getCartCount();
        document.querySelectorAll(".cart-link").forEach((el) => {
            el.textContent = "Cart (" + count + ")";
        });
        document.querySelectorAll(".drawer-cart").forEach((el) => {
            /* .drawer-cart punya ikon svg + teks — hanya ganti bagian teksnya */
            const svg = el.querySelector("svg");
            el.textContent = " Cart (" + count + ")";
            if (svg) el.prepend(svg);
        });
    }

    /* Expose ke halaman lain (product.html, cart.html) */
    window.HipjongCart = {
        getCart: getCart,
        addToCart: addToCart,
        updateQty: updateQty,
        removeFromCart: removeFromCart,
        getCartCount: getCartCount
    };

    document.addEventListener("DOMContentLoaded", updateCartBadges);
})();
