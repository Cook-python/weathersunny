(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function block(title, iconName, text) {
    if (!text) return '';
    return '<div class="profile-block">' +
      '<h3 class="profile-block-title">' + WS.icon(iconName) + '<span>' + title + '</span></h3>' +
      '<p class="profile-block-body">' + escapeHtml(text) + '</p>' +
      '</div>';
  }

  function renderProfile(result) {
    var profile = result.profile;
    var card = WS.$('profileCard');
    var joined = WS.formatDate(profile.joined);

    var facts = [];
    if (profile.country) facts.push(WS.icon('map-pin') + '<span>' + escapeHtml(profile.country) + '</span>');
    if (joined) facts.push(WS.icon('calendar') + '<span>' + joined + ' に参加</span>');
    facts.push(WS.icon('code') + '<span>Scratcher</span>');

    card.innerHTML =
      '<div class="profile-top">' +
        '<img class="profile-avatar" src="' + escapeHtml(profile.avatar) + '" alt="' + escapeHtml(profile.username) + '" width="96" height="96" loading="lazy">' +
        '<div class="profile-headline">' +
          '<h2 class="profile-name">' + escapeHtml(profile.username) + '</h2>' +
          '<p class="profile-facts">' + facts.map(function (f) { return '<span class="fact">' + f + '</span>'; }).join('') + '</p>' +
          '<a class="text-link" href="' + escapeHtml(profile.url) + '" target="_blank" rel="noopener">Scratchのプロフィールを開く' + WS.icon('arrow-up-right') + '</a>' +
        '</div>' +
      '</div>' +
      block('いま取り組んでいること', 'sparkles', profile.status) +
      block('自己紹介', 'user', profile.bio);

    var img = card.querySelector('.profile-avatar');
    if (img) {
      img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
    }
  }

  function renderStats(totals) {
    var box = WS.$('introStats');
    var items = [
      { icon: 'layout-grid', label: '共有中のプロジェクト', value: totals.count },
      { icon: 'eye', label: '合計表示回数', value: totals.views },
      { icon: 'heart', label: '合計の好き', value: totals.loves },
      { icon: 'remix', label: 'リミックスされた数', value: totals.remixes }
    ];
    box.innerHTML = items.map(function (item) {
      return '<div class="stat">' + WS.icon(item.icon) +
        '<strong>' + WS.formatNumber(item.value) + '</strong>' +
        '<span>' + item.label + '</span></div>';
    }).join('');
  }

  WS.boot(function () {
    WS.getProfile().then(function (result) {
      renderProfile(result);
      if (result.profile.avatar) WS.$('avatar').src = result.profile.avatar;
      if (result.profile.country) WS.$('countryChip').textContent = result.profile.country;
    }).catch(function () {
      WS.$('profileCard').innerHTML =
        '<div class="state">' + WS.icon('cloud-off', 'state-icon') +
        '<p>プロフィールを読み込めませんでした</p></div>';
    });

    WS.getProjects().then(function (result) {
      renderStats(result.totals);
    }).catch(function () {
      WS.$('introStats').hidden = true;
    });
  });
})();
