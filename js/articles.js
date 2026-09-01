(function () {
  'use strict';

  function render(articles) {
    var list = WS.$('articleList');
    var empty = WS.$('articlesEmpty');

    list.innerHTML = '';
    WS.$('articleCount').textContent = articles.length ? articles.length + ' articles' : '';
    empty.classList.toggle('hidden', articles.length > 0);

    articles.forEach(function (article, index) {
      var item = document.createElement('article');
      item.className = 'card article-item reveal';
      item.setAttribute('data-delay', String(Math.min(index, 4) * 60));

      var head = document.createElement('div');
      head.className = 'article-item-head';

      var heading = document.createElement('h3');
      heading.className = 'article-title';
      heading.textContent = article.title || '(無題)';
      head.appendChild(heading);

      if (article.featured) {
        var badge = document.createElement('span');
        badge.className = 'badge accent';
        badge.innerHTML = WS.icon('bookmark') + '<span>注目</span>';
        head.appendChild(badge);
      }

      if (WS.isUnlocked()) {
        var edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'icon-btn small';
        edit.setAttribute('aria-label', '編集');
        edit.innerHTML = WS.icon('pencil');
        edit.addEventListener('click', function () { WSEditor.open(article.id); });
        head.appendChild(edit);
      }

      var body = document.createElement('div');
      body.className = 'article-body';
      body.textContent = article.content || '';

      item.appendChild(head);
      item.appendChild(body);

      var stamp = WS.formatDate(article.date);
      if (stamp) {
        var meta = document.createElement('p');
        meta.className = 'article-meta';
        meta.innerHTML = WS.icon('clock') + '<span>' + stamp + '</span>';
        item.appendChild(meta);
      }

      list.appendChild(item);
      WS.observe(item);
    });
  }

  var cache = [];

  WS.boot(function () {
    WS.getArticles().then(function (result) {
      cache = result.articles;
      WSEditor.setArticles(cache);
      render(cache);
    });

    WSEditor.onChange(function (articles) {
      cache = articles;
      render(cache);
    });

    WS.getProfile().then(function (result) {
      if (result.profile.avatar) WS.$('avatar').src = result.profile.avatar;
      if (result.profile.country) WS.$('countryChip').textContent = result.profile.country;
    }).catch(function () {});

    WS.onUnlock(function () {
      WSEditor.mount();
      WS.$('newBtn').addEventListener('click', function () { WSEditor.open(null); });
      WS.$('exportBtn').addEventListener('click', WSEditor.openExport);
      render(cache);
    });
  });
})();
