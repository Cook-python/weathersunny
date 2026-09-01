window.WSEditor = (function () {
  'use strict';

  var MARKUP =
    '<div class="overlay" id="editOverlay" role="dialog" aria-modal="true" aria-labelledby="editModalTitle" hidden>' +
      '<div class="modal">' +
        '<div class="modal-head">' +
          '<h2 class="modal-title" id="editModalTitle">' + WS.icon('pencil') + '<span id="editModalLabel">記事を編集</span></h2>' +
          '<button class="icon-btn" data-close type="button" aria-label="閉じる">' + WS.icon('x') + '</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<label class="field">' +
            '<span class="field-label">タイトル</span>' +
            '<input class="input" id="editTitle" type="text" maxlength="80" placeholder="タイトルを入力">' +
          '</label>' +
          '<label class="field">' +
            '<span class="field-label">本文<span class="count" id="editCount">0 / 800</span></span>' +
            '<textarea class="textarea" id="editContent" maxlength="800" rows="10" placeholder="本文を入力"></textarea>' +
          '</label>' +
          '<label class="check">' +
            '<input type="checkbox" id="editFeatured">' +
            '<span>トップページの注目記事にする</span>' +
          '</label>' +
        '</div>' +
        '<div class="modal-foot">' +
          '<button class="ghost-btn danger hidden" id="editDelete" type="button">' + WS.icon('trash') + '<span>削除</span></button>' +
          '<span class="spacer"></span>' +
          '<button class="ghost-btn" data-close type="button">キャンセル</button>' +
          '<button class="primary-btn" id="editSave" type="button">' + WS.icon('device-floppy') + '<span>保存</span></button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="overlay" id="exportOverlay" role="dialog" aria-modal="true" aria-labelledby="exportModalTitle" hidden>' +
      '<div class="modal">' +
        '<div class="modal-head">' +
          '<h2 class="modal-title" id="exportModalTitle">' + WS.icon('file-export') + '<span>記事を公開用に書き出す</span></h2>' +
          '<button class="icon-btn" data-close type="button" aria-label="閉じる">' + WS.icon('x') + '</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<p class="note">このJSONを <code>content/articles.json</code> として保存し、再デプロイするとすべての訪問者に反映されます。</p>' +
          '<textarea class="textarea code" id="exportOutput" rows="14" readonly></textarea>' +
        '</div>' +
        '<div class="modal-foot">' +
          '<span class="spacer"></span>' +
          '<button class="ghost-btn" id="exportCopy" type="button">' + WS.icon('copy') + '<span>コピー</span></button>' +
          '<button class="primary-btn" id="exportDownload" type="button">' + WS.icon('download') + '<span>articles.json をダウンロード</span></button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var articles = [];
  var editingId = null;
  var handlers = [];
  var mounted = false;

  function emit() {
    handlers.forEach(function (handler) { handler(WS.sortArticles(articles)); });
  }

  function onChange(handler) {
    handlers.push(handler);
  }

  function setArticles(list) {
    articles = (list || []).slice();
  }

  function find(id) {
    for (var i = 0; i < articles.length; i += 1) {
      if (articles[i].id === id) return articles[i];
    }
    return null;
  }

  function newId() {
    return 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  }

  function updateCount() {
    var input = WS.$('editContent');
    var label = WS.$('editCount');
    if (!input || !label) return;
    var len = input.value.length;
    label.textContent = len + ' / ' + WS.config.maxContent;
    label.classList.toggle('is-max', len >= WS.config.maxContent);
  }

  function open(id) {
    if (!WS.isUnlocked()) return;
    mount();
    editingId = id || null;
    var article = editingId ? find(editingId) : null;
    WS.$('editModalLabel').textContent = article ? '記事を編集' : '新しい記事';
    WS.$('editTitle').value = article ? (article.title || '') : '';
    WS.$('editContent').value = article ? (article.content || '') : '';
    WS.$('editFeatured').checked = article ? !!article.featured : !articles.length;
    WS.$('editDelete').classList.toggle('hidden', !article);
    updateCount();
    WS.openOverlay(WS.$('editOverlay'));
  }

  function payload() {
    return {
      publishedAt: new Date().toISOString(),
      articles: WS.sortArticles(articles).map(function (a) {
        return {
          id: a.id,
          title: a.title || '',
          content: a.content || '',
          date: a.date || '',
          featured: !!a.featured
        };
      })
    };
  }

  function openExport() {
    if (!WS.isUnlocked()) return;
    mount();
    WS.$('exportOutput').value = JSON.stringify(payload(), null, 2);
    WS.openOverlay(WS.$('exportOverlay'));
  }

  function save() {
    var title = WS.$('editTitle').value.trim();
    var content = WS.$('editContent').value.slice(0, WS.config.maxContent);
    var featured = WS.$('editFeatured').checked;

    if (!title && !content.trim()) {
      WS.toast('タイトルか本文を入力してください', 'alert-circle');
      return;
    }

    var article = editingId ? find(editingId) : null;
    if (article) {
      article.title = title;
      article.content = content;
      article.date = new Date().toISOString();
    } else {
      article = {
        id: newId(),
        title: title,
        content: content,
        date: new Date().toISOString(),
        featured: false
      };
      articles.push(article);
    }

    if (featured) {
      articles.forEach(function (a) { a.featured = a.id === article.id; });
    } else {
      article.featured = false;
    }

    articles = WS.sortArticles(articles);
    WS.saveArticles(articles);
    WS.closeOverlay(WS.$('editOverlay'));
    WS.toast('保存しました', 'circle-check');
    emit();
  }

  function remove() {
    if (!editingId) return;
    if (!window.confirm('この記事を削除しますか？')) return;
    articles = articles.filter(function (a) { return a.id !== editingId; });
    WS.saveArticles(articles);
    WS.closeOverlay(WS.$('editOverlay'));
    WS.toast('削除しました', 'trash');
    emit();
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var output = WS.$('exportOutput');
    output.select();
    document.execCommand('copy');
    return Promise.resolve();
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    var holder = document.createElement('div');
    holder.innerHTML = MARKUP;
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    WS.$$('#editOverlay [data-close], #exportOverlay [data-close]').forEach(function (button) {
      button.addEventListener('click', function () {
        WS.closeOverlay(button.closest('.overlay'));
      });
    });
    WS.$('editContent').addEventListener('input', updateCount);
    WS.$('editSave').addEventListener('click', save);
    WS.$('editDelete').addEventListener('click', remove);
    WS.$('exportCopy').addEventListener('click', function () {
      copy(WS.$('exportOutput').value).then(function () { WS.toast('コピーしました', 'copy'); });
    });
    WS.$('exportDownload').addEventListener('click', function () {
      download('articles.json', WS.$('exportOutput').value);
      WS.toast('articles.json を書き出しました', 'download');
    });

    WS.$$('.overlay').forEach(function (overlay) {
      overlay.addEventListener('mousedown', function (event) {
        if (event.target === overlay) WS.closeOverlay(overlay);
      });
    });
  }

  return {
    setArticles: setArticles,
    onChange: onChange,
    open: open,
    openExport: openExport,
    mount: mount
  };
})();
