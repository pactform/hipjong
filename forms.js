/* =========================================================
   forms.js — feedback UX untuk form yang belum tersambung ke
   backend (newsletter-form di semua footer, contact-form di
   contact.html). Ini addition murni: tidak mengubah markup
   yang sudah ada, cuma menambah handler submit + pesan sukses
   yang di-generate lewat JS.

   Tambahkan <script src="forms.js" defer></script> di halaman
   yang punya form. Ganti isi fungsi submitNewsletter/submitContact
   dengan pemanggilan API/provider asli begitu sudah siap.
   ========================================================= */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    function showNote(form, message, isError) {
        var note = form.querySelector('.hj-form-feedback');
        if (!note) {
            note = document.createElement('p');
            note.className = 'hj-form-feedback';
            note.style.marginTop = '0.75rem';
            note.style.fontSize = '0.85rem';
            form.appendChild(note);
        }
        note.textContent = message;
        note.style.color = isError ? '#AF3E2B' : '#204C39';
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    ready(function () {
        /* ---- Newsletter forms (ada di footer semua halaman) ---- */
        var newsletterForms = document.querySelectorAll('.newsletter-form');
        Array.prototype.forEach.call(newsletterForms, function (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var emailInput = form.querySelector('input[type="email"]');
                var email = emailInput ? emailInput.value.trim() : '';

                if (!isValidEmail(email)) {
                    showNote(form, 'Please enter a valid email address.', true);
                    return;
                }

                /* TODO: ganti dengan panggilan API newsletter asli
                   (Mailchimp, Klaviyo, dll) begitu tersedia. */
                showNote(form, 'Thanks — you\'re on the list!', false);
                form.reset();
            });
        });

        /* ---- Contact form (contact.html) ---- */
        var contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var emailInput = contactForm.querySelector('#contact-email');
                var nameInput = contactForm.querySelector('#contact-name');
                var messageInput = contactForm.querySelector('#contact-message');

                var valid = nameInput && nameInput.value.trim()
                    && emailInput && isValidEmail(emailInput.value.trim())
                    && messageInput && messageInput.value.trim();

                if (!valid) {
                    showNote(contactForm, 'Please fill in your name, a valid email, and a message.', true);
                    return;
                }

                /* TODO: ganti dengan panggilan ke email service /
                   form handler asli begitu tersedia. */
                showNote(contactForm, 'Message received — we\'ll reply within one business day.', false);
                contactForm.reset();
            });
        }
    });
})();
