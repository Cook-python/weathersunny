(function () {
  'use strict';

  var HOME_LIMIT = 6;

  function renderStats(totals) {
    var box = WS.$('heroStats');
    if (!box) return;
    var items = [
      { icon: 'layout-grid', label: 'プロジェクト', value: totals.count },
      { icon: 'eye', label: '表示回数', value: totals.views },
      { icon: 'heart', label: '好き', value: totals.loves },
      { icon: 'star', label: 'お気に入り', value: totals.favorites }
    ];
    box.innerHTML = items.map(function (item) {
      return '<div class="stat">' + WS.icon(item.icon) +
        '<strong>' + WS.formatNumber(item.value) + '</strong>' +
        '<span>' + item.label + '</span></div>';
    }).join('');
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
    var list = result.projects.slice(0, HOME_LIMIT);
    var frag = document.createDocumentFragment();
    list.forEach(function (project, index) {
      frag.appendChild(WS.projectCard(project, { delay: (index % 3) * 80 }));
    });
    grid.appendChild(frag);
    WS.$$('.project', grid).forEach(function (node) { WS.observe(node); });
    WS.sourceBadge(WS.$('projectSource'), result, '保存データ');
    renderStats(result.totals);
  }

  function loadProjects(force) {
    showState('Loading');
    WS.getProjects(force === true).then(function (result) {
      showState('None');
      renderProjects(result);
    }).catch(function () {
      showState('Error');
      WS.$('projectGrid').innerHTML = '';
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
