/* chatbot.js - asisten AI melayang HIPJONG. Cukup: <script src="chatbot.js" defer></script> */
(function () {
  if (document.getElementById('hj-chat')) return;
  var ENDPOINT = 'https://hipjong-chat.yvonneeewuu.workers.dev';
  var KEY = 'hj-chat-v1';
  var MAX_LEN = 500;

  var link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = 'chatbot.css';
  document.head.appendChild(link);

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {}
  var busy = false;

  var root = document.createElement('div');
  root.id = 'hj-chat'; root.className = 'hj-chat';
  root.innerHTML =
    '<button type="button" class="hj-fab" aria-label="Ask HIPJONG AI" aria-expanded="false" aria-controls="hj-panel">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>' +
      '<span class="hj-fab-t">Ask AI</span></button>' +
    '<section class="hj-panel" id="hj-panel" role="dialog" aria-label="HIPJONG Assistant">' +
      '<div class="hj-head"><div><strong>HIPJONG Assistant</strong><span>Ask about tables, delivery, warranty</span></div>' +
      '<button type="button" class="hj-x" aria-label="Close chat">&times;</button></div>' +
      '<div class="hj-log" role="log" aria-live="polite"></div>' +
      '<form class="hj-form" autocomplete="off">' +
        '<input class="hj-input" type="text" maxlength="' + MAX_LEN + '" placeholder="Type your question..." aria-label="Message">' +
        '<button type="submit" class="hj-send" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
      '</form>' +
      '<div class="hj-note">AI answers may be inaccurate. For pricing &amp; stock, please contact our team.</div>' +
    '</section>';
  document.body.appendChild(root);

  var fab = root.querySelector('.hj-fab'),
      closeBtn = root.querySelector('.hj-x'),
      log = root.querySelector('.hj-log'),
      form = root.querySelector('.hj-form'),
      input = root.querySelector('.hj-input'),
      send = root.querySelector('.hj-send');

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\b((?:shop|about|how-it-works|faq|contact|index)\.html)\b/g, '<a href="$1">$1</a>')
      .replace(/\n/g, '<br>');
  }
  function add(role, text, html) {
    var d = document.createElement('div');
    d.className = 'hj-msg ' + role;
    if (html) d.innerHTML = text; else if (role === 'bot') d.innerHTML = fmt(text); else d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-12))); } catch (e) {} }

  function chips() {
    var wrap = document.createElement('div');
    wrap.className = 'hj-chips';
    ['Which table is right for me?', 'Is it noisy?', 'How long is the warranty?', 'Can I customize a table?'].forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hj-chip'; b.textContent = q;
      b.addEventListener('click', function () { wrap.remove(); ask(q); });
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
  }

  function greet() {
    add('bot', 'Hi! I\'m the HIPJONG assistant. Ask me about our tables, how it works, delivery, or warranty.');
    chips();
  }

  function restore() {
    if (!history.length) return greet();
    history.forEach(function (m) { add(m.role === 'user' ? 'user' : 'bot', m.content); });
  }

  function ask(text) {
    text = (text || '').trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    var c = log.querySelector('.hj-chips'); if (c) c.remove();
    add('user', text);
    history.push({ role: 'user', content: text });
    save();
    busy = true; send.disabled = true;
    var typing = add('bot', '<span class="hj-typing" aria-label="Typing"><i></i><i></i><i></i></span>', true);

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 30000);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-10), page: location.pathname }),
      signal: ctrl.signal
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'error'); return j; }); })
      .then(function (j) {
        typing.remove();
        add('bot', j.reply);
        history.push({ role: 'assistant', content: j.reply });
        save();
      })
      .catch(function () {
        typing.remove();
        history.pop(); save();
        add('bot', 'Sorry, the assistant is unavailable right now. Please try again shortly, or reach us via our <a href="contact.html">contact page</a>.', true);
      })
      .then(function () {
        clearTimeout(timer);
        busy = false; send.disabled = false; input.focus();
      });
  }

  function open() {
    root.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
    if (!log.children.length) restore();
    setTimeout(function () { input.focus(); log.scrollTop = log.scrollHeight; }, 50);
  }
  function close() {
    root.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
})();
