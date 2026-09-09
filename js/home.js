(function () {
  'use strict';

  var HOME_LIMIT = 6;

  function statMarkup(item) {
    return '<div class="stat reveal"' + (item.id ? ' id="' + item.id + '"' : '') + '>' +
      WS.icon(item.icon) +
      '<strong data-value="' + item.value + '">' + (item.pending ? '—' : '0') + '</strong>' +
      '<span>' + item.label + '</span></div>';
  }

  function animateStats(box) {
    WS.$$('.stat', box).forEach(function (node, index) {
      node.setAttribute('data-delay', String(index * 70));
      WS.observe(node);
      var number = node.querySelector('strong');
      if (!number || number.textContent === '—') return;
      window.setTimeout(function () {
        WS.countUp(number, Number(number.getAttribute('data-value')), WS.formatNumber);
      }, 160 + index * 70);
    });
  }

  function renderStats(totals) {
    var box = WS.$('heroStats');
    if (!box) return;
    var items = [];
    if (totals) {
      items.push({ icon: 'layout-grid', label: 'プロジェクト', value: totals.count });
      items.push({ icon: 'eye', label: '表示回数', value: totals.views });
      items.push({ icon: 'heart', label: '好き', value: totals.loves });
      items.push({ icon: 'star', label: 'お気に入り', value: totals.favorites });
    }
    items.push({ icon: 'user', label: 'サイト閲覧数', value: 0, pending: true, id: 'siteViews' });
    box.innerHTML = items.map(statMarkup).join('');
    animateStats(box);
    fillViews();
  }

  var views = null;

  function fillViews() {
    var card = WS.$('siteViews');
    if (!card) return;
    var number = card.querySelector('strong');
    if (!number) return;

    var paint = function (value) {
      number.setAttribute('data-value', String(value));
      WS.countUp(number, value, WS.formatNumber);
    };

    if (views !== null) {
      paint(views.total);
      return;
    }

    WS.getViews().then(function (result) {
      views = result;
      paint(result.total);
      if (result.today > 0) card.setAttribute('title', '今日 ' + result.today + ' 回');
    }).catch(function () {
      card.remove();
    });
  }

  function showState(which) {
    ['projectsLoading', 'projectsError'].forEach(function (id) {
      var node = WS.$(id);
      if (node) node.classList.toggle('hidden', id !== 'projects' + which);
    });
  }

  function renderProjects(result) {
    var grid = WS.$('projectGrid');
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();
    result.projects.slice(0, HOME_LIMIT).forEach(function (project, index) {
      frag.appendChild(WS.projectCard(project, { delay: (index % 3) * 90 }));
    });
    grid.appendChild(frag);
    WS.$$('.project', grid).forEach(function (node) { WS.observe(node); });
    WS.sourceBadge(WS.$('projectSource'), result, '保存データ');
    renderStats(result.totals);
  }

  function loadProjects(force) {
    showState('None');
    WSFx.skeletons(WS.$('projectGrid'), HOME_LIMIT);
    WS.getProjects(force === true).then(function (result) {
      showState('None');
      renderProjects(result);
    }).catch(function () {
      WS.$('projectGrid').innerHTML = '';
      showState('Error');
      renderStats(null);
    });
  }

  function pickFeatured(articles) {
    for (var i = 0; i < articles.length; i += 1) {
      if (articles[i].featured) return articles[i];
    }
    return articles[0] || null;
  }

  var current = null;

  function renderFeatured(articles) {
    current = pickFeatured(articles);
    var title = WS.$('articleTitle');
    var content = WS.$('articleContent');
    var meta = WS.$('articleMeta');

    if (!current) {
      title.textContent = '';
      content.textContent = '';
      meta.innerHTML = '';
      return;
    }

    title.textContent = current.title || '';
    content.textContent = current.content || '';
    var stamp = WS.formatDate(current.date);
    meta.innerHTML = stamp ? WS.icon('clock') + '<span>最終更新 ' + stamp + '</span>' : '';
  }

  function loadArticles() {
    WS.getArticles().then(function (result) {
      WSEditor.setArticles(result.articles);
      renderFeatured(result.articles);
    });
  }

  function loadProfile() {
    WS.getProfile().then(function (result) {
      var profile = result.profile;
      if (profile.avatar) WS.$('avatar').src = profile.avatar;
      if (profile.country) WS.$('countryChip').textContent = profile.country;
    }).catch(function () {});
  }

  WS.boot(function () {
    loadProfile();
    loadArticles();
    loadProjects();

    WS.$('retryBtn').addEventListener('click', function () { loadProjects(true); });
    WSEditor.onChange(renderFeatured);

    WS.onUnlock(function () {
      WSEditor.mount();
      WS.$('editBtn').addEventListener('click', function () {
        WSEditor.open(current ? current.id : null);
      });
      WS.$('exportBtn').addEventListener('click', WSEditor.openExport);
    });
  });
})();
