window.WS = (function () {
  'use strict';

  var CONFIG = {
    username: 'weather_sunny',
    editKey: 'weather_sunny_2026',
    api: 'https://api.scratch.mit.edu',
    projectsFile: '/data/projects.json',
    profileFile: '/data/profile.json',
    articlesFile: '/content/articles.json',
    storageTheme: 'ws_theme',
    storageArticles: 'ws_articles',
    maxContent: 800,
    pageSize: 40,
    maxPages: 10
  };

  var SPRITE = '<svg class="sprite" aria-hidden="true" focusable="false">' +
    '<symbol id="i-code" viewBox="0 0 24 24"><path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/></symbol>' +
    '<symbol id="i-paw" viewBox="0 0 24 24"><path d="M6.5 9.5a2 2.5 0 1 0 0 5a2 2.5 0 1 0 0 -5"/><path d="M10 5a2 2.5 0 1 0 0 5a2 2.5 0 1 0 0 -5"/><path d="M14 5a2 2.5 0 1 0 0 5a2 2.5 0 1 0 0 -5"/><path d="M17.5 9.5a2 2.5 0 1 0 0 5a2 2.5 0 1 0 0 -5"/><path d="M8 16.5c1 -1.6 2.3 -2.5 4 -2.5s3 .9 4 2.5c1 1.6 .6 3.5 -1.2 4c-1 .3 -1.9 -.2 -2.8 -.2s-1.8 .5 -2.8 .2c-1.8 -.5 -2.2 -2.4 -1.2 -4z"/></symbol>' +
    '<symbol id="i-map-pin" viewBox="0 0 24 24"><path d="M9 11a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/></symbol>' +
    '<symbol id="i-external-link" viewBox="0 0 24 24"><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/></symbol>' +
    '<symbol id="i-moon" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></symbol>' +
    '<symbol id="i-sun" viewBox="0 0 24 24"><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1"/><path d="M12 3v1"/><path d="M20 12h1"/><path d="M12 20v1"/><path d="M5.6 5.6l.7 .7"/><path d="M18.4 5.6l-.7 .7"/><path d="M17.7 17.7l.7 .7"/><path d="M6.3 17.7l-.7 .7"/></symbol>' +
    '<symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"/></symbol>' +
    '<symbol id="i-layout-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></symbol>' +
    '<symbol id="i-pencil" viewBox="0 0 24 24"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/></symbol>' +
    '<symbol id="i-file-export" viewBox="0 0 24 24"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5"/><path d="M15 19h7"/><path d="M19 16l3 3l-3 3"/></symbol>' +
    '<symbol id="i-clock" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7v5l3 3"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></symbol>' +
    '<symbol id="i-device-floppy" viewBox="0 0 24 24"><path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"/><path d="M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M14 4v4h-6v-4"/></symbol>' +
    '<symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"/></symbol>' +
    '<symbol id="i-download" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4v12"/></symbol>' +
    '<symbol id="i-circle-check" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/></symbol>' +
    '<symbol id="i-alert-circle" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/></symbol>' +
    '<symbol id="i-lock-open" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M8 11v-4a4 4 0 0 1 8 0"/></symbol>' +
    '<symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M13 6.5a5 5 0 0 1 5 4.5a3.5 3.5 0 0 1 -1 6.9"/><path d="M17 17h-10a4 4 0 0 1 -.3 -8a5 5 0 0 1 1.4 -2.4"/></symbol>' +
    '<symbol id="i-folder-off" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M8 4h3l2 2h5a2 2 0 0 1 2 2v8"/><path d="M17 20h-12a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2"/></symbol>' +
    '<symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></symbol>' +
    '<symbol id="i-eye" viewBox="0 0 24 24"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/></symbol>' +
    '<symbol id="i-heart" viewBox="0 0 24 24"><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/></symbol>' +
    '<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></symbol>' +
    '<symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M17 7l-10 10"/><path d="M8 7h9v9"/></symbol>' +
    '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 18l6 -6l-6 -6"/></symbol>' +
    '<symbol id="i-search" viewBox="0 0 24 24"><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/></symbol>' +
    '<symbol id="i-database" viewBox="0 0 24 24"><path d="M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"/><path d="M4 6v6a8 3 0 0 0 16 0v-6"/><path d="M4 12v6a8 3 0 0 0 16 0v-6"/></symbol>' +
    '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></symbol>' +
    '<symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3h6v3"/></symbol>' +
    '<symbol id="i-remix" viewBox="0 0 24 24"><path d="M8 4l-4 4l4 4"/><path d="M4 8h11a5 5 0 0 1 5 5v3"/><path d="M16 20l4 -4l-4 -4"/></symbol>' +
    '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/></symbol>' +
    '<symbol id="i-note" viewBox="0 0 24 24"><path d="M13 20l7 -7"/><path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v14a2 2 0 0 0 2 2z"/></symbol>' +
    '<symbol id="i-user" viewBox="0 0 24 24"><path d="M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/></symbol>' +
    '<symbol id="i-home" viewBox="0 0 24 24"><path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/></symbol>' +
    '<symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M8 3l1.5 4.5l4.5 1.5l-4.5 1.5l-1.5 4.5l-1.5 -4.5l-4.5 -1.5l4.5 -1.5z"/><path d="M17 13l.9 2.6l2.6 .9l-2.6 .9l-.9 2.6l-.9 -2.6l-2.6 -.9l2.6 -.9z"/></symbol>' +
    '</svg>';

  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
      return value;
    } catch (e) {
      return null;
    }
  }

  function injectSprite() {
    if (document.querySelector('.sprite')) return;
    var holder = document.createElement('div');
    holder.className = 'sprite-holder';
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder, document.body.firstChild);
  }

  function icon(name, className) {
    return '<svg class="ti' + (className ? ' ' + className : '') + '" aria-hidden="true">' +
      '<use href="#i-' + name + '"/></svg>';
  }

  var toastTimer = null;

  function toast(message, iconName) {
    var box = $('toast');
    if (!box) return;
    var use = box.querySelector('use');
    if (use) use.setAttribute('href', '#i-' + (iconName || 'circle-check'));
    var text = box.querySelector('.toast-text');
    if (text) text.textContent = message;
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      box.classList.remove('is-open');
      setTimeout(function () { box.hidden = true; }, 300);
    }, 2600);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $$('#themeToggle use').forEach(function (use) {
      use.setAttribute('href', '#i-' + (theme === 'dark' ? 'moon' : 'sun'));
    });
    var button = $('themeToggle');
    if (button) {
      button.setAttribute('aria-label', theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え');
    }
  }

  function initTheme() {
    var saved = store(CONFIG.storageTheme);
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(saved || (prefersLight ? 'light' : 'dark'));
    var button = $('themeToggle');
    if (!button) return;
    button.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store(CONFIG.storageTheme, next);
    });
  }

  var revealObserver = null;

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(function (node) { node.classList.add('is-in'); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        var delay = parseInt(node.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { node.classList.add('is-in'); }, delay);
        revealObserver.unobserve(node);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    $$('.reveal').forEach(function (node) { revealObserver.observe(node); });
  }

  function observe(node) {
    if (revealObserver) revealObserver.observe(node);
    else node.classList.add('is-in');
  }

  function initScroll() {
    var header = document.querySelector('.site-header');
    var progress = $('scrollProgress');
    if (!header) return;
    var onScroll = function () {
      var top = window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle('is-stuck', top > 8);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (top / max) * 100 : 0) + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
  }

  function formatNumber(value) {
    var n = Number(value) || 0;
    if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + '万';
    return n.toLocaleString('ja-JP');
  }

  function timeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (value) { clearTimeout(timer); resolve(value); },
        function (error) { clearTimeout(timer); reject(error); });
    });
  }

  function getJSON(url, options) {
    return timeout(fetch(url, options || {}).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }), 12000);
  }

  function pickImage(images, fallback) {
    if (images) {
      var keys = ['282x218', '216x163', '200x151', '144x108', '135x102', '100x80'];
      for (var i = 0; i < keys.length; i += 1) {
        if (images[keys[i]]) return images[keys[i]];
      }
    }
    return fallback || '';
  }

  function normalizeProject(raw) {
    var history = raw.history || {};
    var stats = raw.stats || {};
    return {
      id: raw.id,
      title: (raw.title || 'Untitled').trim(),
      description: (raw.description || '').trim(),
      instructions: (raw.instructions || '').trim(),
      url: 'https://scratch.mit.edu/projects/' + raw.id + '/',
      image: pickImage(raw.images, raw.image),
      created: history.created || '',
      modified: history.modified || '',
      shared: history.shared || '',
      views: Number(stats.views) || 0,
      loves: Number(stats.loves) || 0,
      favorites: Number(stats.favorites) || 0,
      remixes: Number(stats.remixes) || 0
    };
  }

  function totalsOf(projects) {
    return projects.reduce(function (acc, p) {
      acc.count += 1;
      acc.views += p.views;
      acc.loves += p.loves;
      acc.favorites += p.favorites;
      acc.remixes += p.remixes;
      return acc;
    }, { count: 0, views: 0, loves: 0, favorites: 0, remixes: 0 });
  }

  function fetchProjectsFromApi() {
    var all = [];
    var seen = {};
    var page = 0;

    var step = function (offset) {
      var url = CONFIG.api + '/users/' + CONFIG.username +
        '/projects?limit=' + CONFIG.pageSize + '&offset=' + offset;
      return getJSON(url).then(function (batch) {
        if (!Array.isArray(batch)) throw new Error('bad payload');
        batch.forEach(function (raw) {
          if (seen[raw.id]) return;
          seen[raw.id] = true;
          all.push(normalizeProject(raw));
        });
        page += 1;
        if (batch.length === CONFIG.pageSize && page < CONFIG.maxPages) return step(offset + CONFIG.pageSize);
        return all;
      });
    };

    return step(0).then(function (projects) {
      if (!projects.length) throw new Error('empty');
      projects.sort(function (a, b) {
        return String(b.shared || b.created).localeCompare(String(a.shared || a.created));
      });
      return { projects: projects, source: 'api', generatedAt: new Date().toISOString() };
    });
  }

  function fetchProjectsFromFile() {
    return getJSON(CONFIG.projectsFile, { cache: 'no-cache' }).then(function (data) {
      var projects = (data && data.projects) || [];
      if (!Array.isArray(projects) || !projects.length) throw new Error('empty file');
      return { projects: projects, source: 'cache', generatedAt: (data && data.generatedAt) || '' };
    });
  }

  var projectsPromise = null;

  function getProjects(force) {
    if (force) projectsPromise = null;
    if (!projectsPromise) {
      projectsPromise = fetchProjectsFromApi().catch(function () {
        return fetchProjectsFromFile();
      }).then(function (result) {
        result.totals = totalsOf(result.projects);
        return result;
      }).catch(function (error) {
        projectsPromise = null;
        throw error;
      });
    }
    return projectsPromise;
  }

  function normalizeProfile(raw) {
    var profile = raw.profile || {};
    var history = raw.history || {};
    var images = profile.images || {};
    return {
      id: raw.id,
      username: raw.username || CONFIG.username,
      avatar: images['90x90'] || images['60x60'] || images['55x55'] || '',
      bio: (profile.bio || '').trim(),
      status: (profile.status || '').trim(),
      country: (profile.country || '').trim(),
      joined: history.joined || '',
      url: 'https://scratch.mit.edu/users/' + (raw.username || CONFIG.username) + '/'
    };
  }

  var profilePromise = null;

  function getProfile() {
    if (!profilePromise) {
      profilePromise = getJSON(CONFIG.api + '/users/' + CONFIG.username).then(function (raw) {
        if (!raw || !raw.username) throw new Error('bad payload');
        return { profile: normalizeProfile(raw), source: 'api', generatedAt: new Date().toISOString() };
      }).catch(function () {
        return getJSON(CONFIG.profileFile, { cache: 'no-cache' }).then(function (data) {
          if (!data || !data.profile) throw new Error('empty file');
          return { profile: data.profile, source: 'cache', generatedAt: data.generatedAt || '' };
        });
      }).catch(function (error) {
        profilePromise = null;
        throw error;
      });
    }
    return profilePromise;
  }

  function sortArticles(list) {
    return list.slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function readLocalArticles() {
    var raw = store(CONFIG.storageArticles);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.articles)) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  var articlesPromise = null;

  function getArticles() {
    if (!articlesPromise) {
      var local = readLocalArticles();
      articlesPromise = getJSON(CONFIG.articlesFile, { cache: 'no-cache' }).catch(function () {
        return null;
      }).then(function (data) {
        var published = data && Array.isArray(data.articles) ? data : null;
        var localTime = local ? Date.parse(local.savedAt || '') || 0 : -1;
        var publishedTime = published ? Date.parse(published.publishedAt || '') || 0 : -1;
        var chosen = localTime > publishedTime ? local : published;
        if (!chosen) chosen = { articles: [] };
        return {
          articles: sortArticles(chosen.articles || []),
          source: chosen === local ? 'local' : 'published',
          publishedAt: (published && published.publishedAt) || ''
        };
      });
    }
    return articlesPromise;
  }

  function saveArticles(list) {
    var payload = { savedAt: new Date().toISOString(), articles: sortArticles(list) };
    store(CONFIG.storageArticles, JSON.stringify(payload));
    articlesPromise = Promise.resolve({
      articles: payload.articles, source: 'local', publishedAt: ''
    });
    return payload;
  }

  var unlocked = false;
  var unlockHandlers = [];

  function isUnlocked() { return unlocked; }

  function onUnlock(handler) {
    unlockHandlers.push(handler);
    if (unlocked) handler();
  }

  function unlock(silent) {
    if (unlocked) return;
    unlocked = true;
    $$('[data-admin]').forEach(function (node) { node.classList.remove('hidden'); });
    unlockHandlers.forEach(function (handler) { handler(); });
    if (!silent) toast('編集モードが有効になりました', 'lock-open');
  }

  function initAuth() {
    var params = new URLSearchParams(window.location.search);
    var key = params.get('key');
    var path = window.location.pathname;
    var wantsEdit = params.get('edit') === 'true' || path.indexOf('/admin') === 0;

    if (key !== null) {
      if (key === CONFIG.editKey) unlock(false);
      else window.alert('秘密キーが正しくありません。');
      return;
    }

    if (!wantsEdit) return;
    if (!window.confirm('このセクションを編集しますか？')) return;
    var input = window.prompt('秘密キーを入力してください');
    if (input === null) return;
    if (input.trim() === CONFIG.editKey) unlock(false);
    else window.alert('秘密キーが正しくありません。');
  }

  function keyQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('key') === CONFIG.editKey ? '?key=' + encodeURIComponent(CONFIG.editKey) : '';
  }

  var overlayStack = [];

  function openOverlay(overlay) {
    if (!overlay) return;
    overlayStack.push(document.activeElement);
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    var focusable = overlay.querySelector('.modal-body input, .modal-body textarea') ||
      overlay.querySelector('button');
    if (focusable) focusable.focus();
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 300);
    var previous = overlayStack.pop();
    if (previous && previous.focus) previous.focus();
  }

  function bindOverlays() {
    $$('.overlay').forEach(function (overlay) {
      overlay.addEventListener('mousedown', function (event) {
        if (event.target === overlay) closeOverlay(overlay);
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      $$('.overlay').forEach(function (overlay) {
        if (!overlay.hidden) closeOverlay(overlay);
      });
    });
  }

  function sourceBadge(node, result, label) {
    if (!node) return;
    if (result.source === 'cache') {
      var stamp = formatDate(result.generatedAt);
      node.innerHTML = icon('database') + '<span>' + (label || 'キャッシュ') +
        (stamp ? ' ' + stamp : '') + '</span>';
      node.hidden = false;
    } else {
      node.hidden = true;
    }
  }

  function markActiveNav() {
    var path = window.location.pathname.replace(/\/index\.html$/, '/');
    if (path.length > 1) path = path.replace(/\/$/, '');
    if (path === '' || path === '/admin') path = '/';
    $$('.site-nav a').forEach(function (link) {
      var href = link.getAttribute('href').split('?')[0].replace(/\/$/, '') || '/';
      if (href === path) link.setAttribute('aria-current', 'page');
      var suffix = keyQuery();
      if (suffix) link.setAttribute('href', href === '/' ? '/' + suffix : href + suffix);
    });
  }

  function projectCard(project, options) {
    var opts = options || {};
    var card = document.createElement('a');
    card.className = 'project' + (opts.detailed ? ' project-detailed' : '');
    card.href = project.url || ('https://scratch.mit.edu/projects/' + project.id + '/');
    card.target = '_blank';
    card.rel = 'noopener';
    if (opts.delay) card.setAttribute('data-delay', String(opts.delay));

    var thumb = document.createElement('div');
    thumb.className = 'project-thumb';

    var img = document.createElement('img');
    img.src = project.image || ('https://cdn2.scratch.mit.edu/get_image/project/' + project.id + '_282x218.png');
    img.alt = project.title || 'project';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 282;
    img.height = 218;
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });

    var open = document.createElement('span');
    open.className = 'project-open';
    open.innerHTML = icon('arrow-up-right');

    thumb.appendChild(img);
    thumb.appendChild(open);

    var info = document.createElement('div');
    info.className = 'project-info';

    var name = document.createElement('h3');
    name.className = 'project-name';
    name.textContent = project.title || 'Untitled';
    info.appendChild(name);

    if (opts.detailed && project.description) {
      var desc = document.createElement('p');
      desc.className = 'project-desc';
      desc.textContent = project.description;
      info.appendChild(desc);
    }

    var meta = document.createElement('div');
    meta.className = 'project-stats';
    meta.innerHTML =
      '<span title="表示回数">' + icon('eye') + formatNumber(project.views) + '</span>' +
      '<span title="好き">' + icon('heart') + formatNumber(project.loves) + '</span>' +
      '<span title="お気に入り">' + icon('star') + formatNumber(project.favorites) + '</span>' +
      (opts.detailed ? '<span title="リミックス">' + icon('remix') + formatNumber(project.remixes) + '</span>' : '');
    info.appendChild(meta);

    if (opts.detailed) {
      var when = formatDate(project.shared || project.created);
      if (when) {
        var date = document.createElement('p');
        date.className = 'project-date';
        date.innerHTML = icon('calendar') + '<span>' + when + '</span>';
        info.appendChild(date);
      }
    }

    card.appendChild(thumb);
    card.appendChild(info);
    return card;
  }

  function ready(handler) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handler);
    else handler();
  }

  function boot(pageInit) {
    ready(function () {
      injectSprite();
      initTheme();
      initReveal();
      initScroll();
      bindOverlays();
      markActiveNav();
      var year = $('year');
      if (year) year.textContent = new Date().getFullYear();
      if (typeof pageInit === 'function') pageInit();
      initAuth();
    });
  }

  return {
    config: CONFIG,
    $: $,
    $$: $$,
    icon: icon,
    toast: toast,
    store: store,
    observe: observe,
    formatDate: formatDate,
    formatNumber: formatNumber,
    getProjects: getProjects,
    getProfile: getProfile,
    getArticles: getArticles,
    saveArticles: saveArticles,
    sortArticles: sortArticles,
    totalsOf: totalsOf,
    isUnlocked: isUnlocked,
    onUnlock: onUnlock,
    keyQuery: keyQuery,
    openOverlay: openOverlay,
    closeOverlay: closeOverlay,
    sourceBadge: sourceBadge,
    projectCard: projectCard,
    boot: boot
  };
})();
