(function () {
  'use strict';

  var all = [];
  var query = '';
  var order = 'new';

  function showState(which) {
    ['projectsLoading', 'projectsError', 'projectsEmpty'].forEach(function (id) {
      WS.$(id).classList.toggle('hidden', id !== 'projects' + which);
    });
  }

  function matches(project) {
    if (!query) return true;
    var haystack = (project.title + ' ' + project.description + ' ' + project.instructions).toLowerCase();
    return query.split(/\s+/).every(function (term) {
      return !term || haystack.indexOf(term) !== -1;
    });
  }

  function compare(a, b) {
    if (order === 'views') return b.views - a.views;
    if (order === 'loves') return b.loves - a.loves;
    if (order === 'title') return a.title.localeCompare(b.title, 'ja');
    return String(b.shared || b.created).localeCompare(String(a.shared || a.created));
  }

  function render() {
    var grid = WS.$('projectGrid');
    var list = all.filter(matches).sort(compare);

    grid.innerHTML = '';
    if (!list.length) {
      showState('Empty');
      WS.$('projectCount').textContent = all.length ? '0 / ' + all.length : '';
      return;
    }

    showState('None');
    var frag = document.createDocumentFragment();
    list.forEach(function (project, index) {
      frag.appendChild(WS.projectCard(project, { detailed: true, delay: (index % 3) * 70 }));
    });
    grid.appendChild(frag);
    WS.$$('.project', grid).forEach(function (node) { WS.observe(node); });
    WS.$('projectCount').textContent = list.length === all.length
      ? all.length + ' projects'
      : list.length + ' / ' + all.length;
  }

  function load(force) {
    showState('Loading');
    WS.$('projectGrid').innerHTML = '';
    WS.getProjects(force === true).then(function (result) {
      all = result.projects;
      WS.sourceBadge(WS.$('projectSource'), result, '保存データ');
      render();
    }).catch(function () {
      all = [];
      showState('Error');
    });
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  WS.boot(function () {
    var search = WS.$('searchInput');
    var sort = WS.$('sortSelect');

    search.addEventListener('input', debounce(function () {
      query = search.value.trim().toLowerCase();
      render();
    }, 180));

    sort.addEventListener('change', function () {
      order = sort.value;
      render();
    });

    WS.$('retryBtn').addEventListener('click', function () { load(true); });

    WS.getProfile().then(function (result) {
      if (result.profile.avatar) WS.$('avatar').src = result.profile.avatar;
      if (result.profile.country) WS.$('countryChip').textContent = result.profile.country;
    }).catch(function () {});

    load();
  });
})();
