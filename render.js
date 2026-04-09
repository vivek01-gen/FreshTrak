/* ============================================================
   FreshTrack — Render Engine
   js/render.js
   ============================================================ */

'use strict';

const Render = (() => {

  // ── Main render ────────────────────────────────────────
  const app = () => {
    const s = AppState.get();
    const stats    = AppState.getStats();
    const filtered = AppState.getFiltered();
    const alerts   = AppState.getAlerts();
    const root = document.getElementById('app');
    if (!root) return;

    document.documentElement.setAttribute('data-theme', s.dark ? 'dark' : 'light');

    root.innerHTML = `
      ${statusBar()}
      ${header(s.view, alerts)}
      <div id="scroll-body">
        ${s.view === 'home'      ? homePage(stats, filtered, alerts)  : ''}
        ${s.view === 'additem'   ? addItemPage(false)                  : ''}
        ${s.view === 'edititem'  ? addItemPage(true)                   : ''}
        ${s.view === 'analytics' ? analyticsPage(stats)               : ''}
        ${s.view === 'settings'  ? settingsPage()                      : ''}
      </div>
      ${s.view === 'home' ? fab() : ''}
      ${bottomNav(s.view)}
      ${s.bulkConfirm ? bulkConfirmModal(stats) : ''}
      ${s.toast ? toast(s.toast) : ''}
    `;
  };

  // ── Status bar ─────────────────────────────────────────
  const statusBar = () => `
    <div class="status-bar">
      <span class="status-bar__time">${Utils.currentTime()}</span>
      <span class="status-bar__icons">📶 🔋 ${I18n.t('offline')}</span>
    </div>`;

  // ── Header ─────────────────────────────────────────────
  const header = (view, alerts) => {
    const isHome = view === 'home';
    const pageLabels = {
      additem:   I18n.t('addItem'),
      edititem:  '✏️ Edit Item',
      analytics: I18n.t('analytics'),
      settings:  I18n.t('settings'),
    };

    return `
    <div class="app-header">
      <div class="flex items-center gap-md">
        ${!isHome ? `
          <button class="app-header__back" onclick="Actions.navTo('home')">
            ${I18n.t('back')}
          </button>
          <span class="app-header__page-title">${pageLabels[view] || ''}</span>
        ` : `
          <div>
            <div class="app-header__brand">
              <span class="app-header__logo-icon">🌿</span>
              <span class="app-header__title">${I18n.t('appName')}</span>
            </div>
            <div class="app-header__tagline">${I18n.t('tagline')}</div>
          </div>
        `}
      </div>
      <div class="app-header__actions">
        <button class="btn-icon" onclick="Actions.toggleTheme()" title="Toggle theme">
          ${AppState.getField('dark') ? '☀️' : '🌙'}
        </button>
        ${alerts.length > 0 && isHome ? `
          <div class="notif-badge">
            <div class="btn-icon" style="font-size:16px;">🔔</div>
            <div class="notif-badge__dot">${alerts.length}</div>
          </div>
        ` : ''}
        ${isHome ? `<button class="btn-icon" onclick="Actions.navTo('settings')" title="Settings">⚙️</button>` : ''}
      </div>
    </div>`;
  };

  // ── FAB ────────────────────────────────────────────────
  const fab = () => `
    <button class="fab fab-enter" onclick="Actions.navTo('additem')">
      ${I18n.t('addFood')}
    </button>`;

  // ── Bottom Nav ─────────────────────────────────────────
  const bottomNav = (view) => {
    const tabs = [
      ['🏠', 'Home',    'home'],
      ['📊', I18n.t('analytics').replace('📊 ',''), 'analytics'],
      ['⚙️', I18n.t('settings').replace('⚙️ ',''),  'settings'],
    ];
    return `
    <nav class="bottom-nav">
      ${tabs.map(([ico, lbl, v]) => `
        <button class="nav-btn ${view === v || (v === 'home' && (view === 'additem' || view === 'edititem')) ? 'active' : ''}"
                onclick="Actions.navTo('${v}')">
          <span class="nav-btn__icon">${ico}</span>
          <span class="nav-btn__label">${lbl}</span>
        </button>
      `).join('')}
    </nav>`;
  };

  // ── Home Page ──────────────────────────────────────────
  const homePage = (stats, filtered, alerts) => {
    const statCards = [
      { lbl: I18n.t('totalItems'),   val: stats.total,   icon: '📦', color: '#22d3ee', filter: 'all' },
      { lbl: I18n.t('expiringSoon'), val: stats.soon,    icon: '⚡', color: '#f59e0b', filter: 'soon' },
      { lbl: I18n.t('expired'),      val: stats.expired, icon: '💀', color: '#f87171', filter: 'expired' },
    ];
    const s = AppState.get();

    return `
    <div class="fade-in">
      ${alerts.length > 0 ? alertBanner(alerts) : ''}

      <div class="home-stats stagger">
        ${statCards.map(c => statCard(c)).join('')}
      </div>

      <div class="home-actions">
        <button class="btn" style="background:rgba(139,92,246,0.10);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;"
                onclick="Actions.navTo('analytics')">${I18n.t('analytics')}</button>
        <button class="btn" style="background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.3);color:#f87171;"
                onclick="Actions.confirmBulkDelete()">${I18n.t('bulkDelete')}</button>
        <button class="btn" style="background:rgba(34,197,94,0.10);border:1px solid rgba(34,197,94,0.3);color:#22c55e;"
                onclick="Actions.exportCSV()">${I18n.t('exportCSV')}</button>
      </div>

      <div class="home-search">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input id="search-inp"
                 value="${escHtml(s.search)}"
                 oninput="Actions.onSearch(this.value)"
                 placeholder="${I18n.t('searchPlaceholder')}" />
          ${s.search ? `<button class="clear-btn" onclick="Actions.onSearch('')">×</button>` : ''}
        </div>
      </div>

      <div class="home-filters">
        <div class="filter-tabs">
          ${['all','fresh','soon','expired'].map(f => `
            <button class="filter-tab ${s.filter === f ? 'active' : ''}"
                    onclick="Actions.filterBy('${f}')">
              ${I18n.t(f === 'expired' ? 'expired' : f === 'soon' ? 'expiring' : f)}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="home-list-header">
        <span class="home-list-header__title">${I18n.t('myInventory')}</span>
        <span class="home-list-header__count">${filtered.length} ${I18n.t('items')}</span>
      </div>

      ${filtered.length === 0
        ? `<div class="empty-state">
             <div class="empty-state__icon">🌱</div>
             <div class="empty-state__title">${I18n.t('noItemsFound')}</div>
             <div class="empty-state__sub">${I18n.t('addFirstItem')}</div>
           </div>`
        : `<div class="home-list stagger">${filtered.map(item => itemCard(item)).join('')}</div>`
      }
    </div>`;
  };

  // ── Alert Banner ───────────────────────────────────────
  const alertBanner = (alerts) => `
    <div class="alert-banner">
      <div class="alert-banner__title">🔔 ${I18n.t('alerts')} (${alerts.length})</div>
      ${alerts.slice(0, 2).map(a => `<div class="alert-banner__item">${a}</div>`).join('')}
      ${alerts.length > 2 ? `<div class="alert-banner__more">+${alerts.length - 2} more</div>` : ''}
    </div>`;

  // ── Stat Card ──────────────────────────────────────────
  const statCard = ({ lbl, val, icon, color, filter }) => `
    <div class="stat-card" onclick="Actions.filterBy('${filter}')"
         style="background:${color}15;border:1px solid ${color}35;">
      <div style="font-size:20px;margin-bottom:4px;">${icon}</div>
      <div class="stat-card__value" style="color:${color};">${val}</div>
      <div class="stat-card__label">${lbl}</div>
    </div>`;

  // ── Item Card ──────────────────────────────────────────
  const itemCard = (item) => {
    const d = Utils.calcDays(item.expiry);
    const status = Utils.getStatus(d);
    const color  = STATUS_COLOR[status];
    const pct    = Utils.getProgress(d);
    const swiped = AppState.getField('swipedId') === item.id;
    const dLabel = Utils.getDayLabel(status, d);

    const bgMap = {
      fresh:   'var(--status-bg-fresh)',
      soon:    'var(--status-bg-soon)',
      today:   'var(--status-bg-today)',
      expired: 'var(--status-bg-expired)',
    };

    return `
    <div class="card-item ${swiped ? 'swiped' : ''} ${status === 'soon' ? 'pulse-warn' : ''}"
         id="card-${item.id}">
      <div class="card-item__delete-bg">
        <button class="btn btn-danger" style="width:44px;height:44px;border-radius:10px;padding:0;font-size:18px;"
                onclick="Actions.deleteItem(${item.id})">🗑️</button>
      </div>
      <div class="card-item__inner swipe-transition"
           style="background:linear-gradient(135deg,${bgMap[status]},var(--surf2));"
           onclick="Actions.swipeItem(${item.id})">
        <div class="flex gap-md">
          <div class="item-card__thumb"
               style="background:${color}20;border:1px solid ${color}35;">
            ${item.photo
              ? `<img src="${item.photo}" alt="${escHtml(item.name)}" />`
              : (CAT_EMOJI[item.cat] || '🍽️')
            }
          </div>
          <div class="flex-1" style="min-width:0;">
            <div class="flex justify-between items-center">
              <div style="color:var(--text);font-size:14px;font-weight:700;font-family:var(--font-display);">
                ${escHtml(item.name)}
              </div>
              <span class="badge badge-enter"
                    style="background:${color}20;border:1px solid ${color}40;color:${color};">
                ${STATUS_LABEL[status]}
              </span>
            </div>
            <div class="item-card__meta">
              <span class="item-card__meta-pill">📦 ${escHtml(item.qty)} ${escHtml(item.unit)}</span>
              ${item.price ? `<span class="item-card__meta-pill">₹${escHtml(item.price)}</span>` : ''}
              <span class="item-card__meta-pill">${CAT_EMOJI[item.cat] || '🍽️'} ${CAT_NAMES[item.cat] || item.cat}</span>
            </div>
            ${item.notes ? `<div class="item-card__notes">📝 ${escHtml(item.notes)}</div>` : ''}
            <div class="item-card__footer">
              <span class="item-card__days" style="color:${color};">${dLabel}</span>
              <span class="item-card__expiry-date">📅 ${item.expiry}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${color},${color}80);"></div>
            </div>
          </div>
        </div>
        <!-- Edit button (visible when not swiped) -->
        <div style="display:flex;justify-content:flex-end;margin-top:8px;gap:8px;">
          <button onclick="event.stopPropagation();Actions.editItem(${item.id})"
                  style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:4px 10px;color:var(--muted);font-size:11px;font-weight:600;cursor:pointer;">
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>`;
  };

  // ── Add / Edit Item Page ───────────────────────────────
  const addItemPage = (isEdit) => {
    const f = AppState.getField('form');
    const err = AppState.getField('formErr');
    const previewDays   = f.expiry ? Utils.calcDays(f.expiry) : null;
    const previewStatus = previewDays !== null ? Utils.getStatus(previewDays) : null;
    const previewColor  = previewStatus ? STATUS_COLOR[previewStatus] : null;

    return `
    <div class="add-item-page fade-in">
      <!-- PHOTO -->
      <div class="input-group">
        <label class="input-label">${I18n.t('photo')}</label>
        <div class="photo-upload">
          <div class="photo-preview">
            ${f.photo ? `<img src="${f.photo}" alt="preview" />` : '<span style="font-size:28px;">📷</span>'}
          </div>
          <div class="photo-actions">
            <label for="photo-inp" class="photo-upload-label">
              ${I18n.t('choosePhoto')}
            </label>
            <input id="photo-inp" type="file" accept="image/*"
                   onchange="Actions.onPhoto(event)" style="display:none;" />
            <span class="photo-hint">${I18n.t('photoHint')}</span>
          </div>
        </div>
      </div>

      <!-- NAME -->
      <div class="input-group">
        <label class="input-label">${I18n.t('itemName')} <span class="required">*</span></label>
        <input class="input-field"
               value="${escHtml(f.name)}"
               oninput="Actions.onFormName(this.value)"
               placeholder="e.g. Amul Milk, Apple..." />
      </div>

      <!-- CATEGORY -->
      <div class="input-group">
        <label class="input-label">${I18n.t('category')}</label>
        <div class="cat-grid">
          ${Object.keys(CAT_EMOJI).map(cat => `
            <button class="cat-btn ${f.cat === cat ? 'active' : ''}"
                    onclick="Actions.setFormField('cat','${cat}')">
              ${CAT_EMOJI[cat]} ${CAT_NAMES[cat]}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- QTY + UNIT -->
      <div class="input-group">
        <label class="input-label">${I18n.t('quantityUnit')}</label>
        <div class="flex gap-sm">
          <input type="number" class="input-field" style="width:40%;"
                 value="${escHtml(f.qty)}"
                 oninput="Actions.setFormField('qty',this.value)"
                 placeholder="e.g. 500" min="0" />
          <select class="input-field" style="width:60%;cursor:pointer;"
                  onchange="Actions.setFormField('unit',this.value)">
            ${UNITS.map(u => `<option value="${u}" ${f.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- PRICE -->
      <div class="input-group">
        <label class="input-label">${I18n.t('price')}</label>
        <input type="number" class="input-field"
               value="${escHtml(f.price)}"
               oninput="Actions.setFormField('price',this.value)"
               placeholder="0" min="0" />
      </div>

      <!-- DATES -->
      <div class="flex gap-sm input-group">
        <div style="flex:1;">
          <label class="input-label">${I18n.t('purchaseDate')}</label>
          <input type="date" class="input-field"
                 value="${f.bought}"
                 onchange="Actions.setFormField('bought',this.value)" />
        </div>
        <div style="flex:1;">
          <label class="input-label">${I18n.t('expiryDate')} <span class="required">*</span></label>
          <input type="date" class="input-field"
                 value="${f.expiry}"
                 onchange="Actions.setFormField('expiry',this.value)"
                 style="${!f.expiry ? 'border-color:rgba(239,68,68,0.5);' : ''}" />
        </div>
      </div>

      <!-- EXPIRY PREVIEW -->
      ${previewStatus ? `
        <div class="expiry-preview"
             style="background:${previewColor}15;border:1px solid ${previewColor}35;">
          <span style="font-size:18px;">${STATUS_ICON[previewStatus]}</span>
          <span style="color:${previewColor};font-size:12px;font-weight:700;">
            ${Utils.getDayLabel(previewStatus, previewDays)}
          </span>
        </div>
      ` : ''}

      <!-- NOTES -->
      <div class="input-group">
        <label class="input-label">${I18n.t('notes')}</label>
        <textarea class="input-field" rows="2"
                  oninput="Actions.setFormField('notes',this.value)"
                  placeholder="${I18n.t('notesPlaceholder')}"
        >${escHtml(f.notes)}</textarea>
      </div>

      ${err ? `<div class="form-error shake">⚠️ ${escHtml(err)}</div>` : ''}

      <div class="flex gap-sm" style="margin-top:8px;">
        <button class="btn btn-ghost flex-1" onclick="Actions.navTo('home')">
          ${I18n.t('cancel')}
        </button>
        <button class="btn btn-primary" style="flex:2;" onclick="Actions.saveItem(${isEdit})">
          ${isEdit ? I18n.t('updateItem') : I18n.t('saveItem')}
        </button>
      </div>
    </div>`;
  };

  // ── Analytics Page ─────────────────────────────────────
  const analyticsPage = (stats) => {
    const expired    = (AppState.getField('items') || []).filter(i => Utils.calcDays(i.expiry) < 0);
    const catWaste   = {};
    expired.forEach(i => { catWaste[i.cat] = (catWaste[i.cat] || 0) + (+i.price || 0); });
    const catEntries = Object.entries(catWaste).sort((a, b) => b[1] - a[1]);
    const maxCat     = catEntries[0]?.[1] || 1;

    const monthly    = Storage.getMonthlyHistory();
    const maxMonth   = Math.max(...monthly.map(m => m.value), 1);

    const summaryCards = [
      { icon: '💸', val: `₹${stats.wasteVal}`, lbl: I18n.t('wastedRupees'),  color: '#f87171' },
      { icon: '📦', val: stats.expired,          lbl: I18n.t('itemsExpired'), color: '#fbbf24' },
      { icon: '📅', val: MONTHS[new Date().getMonth()], lbl: I18n.t('thisMonth'), color: '#a78bfa' },
    ];

    return `
    <div class="analytics-page fade-in">
      <!-- Summary -->
      <div class="analytics-summary">
        ${summaryCards.map(c => `
          <div style="flex:1;background:${c.color}15;border:1px solid ${c.color}30;border-radius:var(--r-lg);padding:14px 12px;text-align:center;">
            <div style="font-size:22px;margin-bottom:4px;">${c.icon}</div>
            <div style="font-family:var(--font-display);font-size:18px;font-weight:800;color:${c.color};line-height:1;">${c.val}</div>
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:0.4px;">${c.lbl}</div>
          </div>
        `).join('')}
      </div>

      <!-- Bar Chart -->
      <div class="card analytics-chart-card">
        <div class="section-header" style="color:#a78bfa;">${I18n.t('monthlyWaste')}</div>
        <div class="bar-chart">
          ${monthly.map(m => `
            <div class="bar-col">
              <div class="bar-value">₹${m.value}</div>
              <div class="bar-fill" style="height:${Math.max(4,(m.value/maxMonth)*75)}px;"></div>
              <div class="bar-label">${m.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="card" style="margin-bottom:12px;">
        <div class="section-header" style="color:#f87171;">${I18n.t('wasteByCategory')}</div>
        ${catEntries.length === 0
          ? `<div class="text-center" style="padding:20px 0;color:var(--muted);font-size:13px;">${I18n.t('noExpiredYet')}</div>`
          : catEntries.map(([cat, val]) => `
              <div class="cat-bar">
                <div class="cat-bar__header">
                  <span class="cat-bar__name">${CAT_EMOJI[cat] || '📦'} ${cat}</span>
                  <span class="cat-bar__value">₹${val}</span>
                </div>
                <div class="cat-bar__track">
                  <div class="cat-bar__fill" style="width:${(val/maxCat)*100}%;"></div>
                </div>
              </div>
            `).join('')
        }
      </div>

      <!-- Expired List -->
      ${expired.length > 0 ? `
        <div class="card">
          <div class="section-header" style="color:var(--muted);">${I18n.t('expiredItems')}</div>
          ${expired.map((item, i) => `
            <div class="expired-list-item">
              <span class="expired-list-item__icon">${CAT_EMOJI[item.cat] || '🍽️'}</span>
              <div style="flex:1;">
                <div class="expired-list-item__name">${escHtml(item.name)}</div>
                <div class="expired-list-item__date">Expired: ${item.expiry}</div>
              </div>
              <span class="expired-list-item__price">₹${item.price || 0}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>`;
  };

  // ── Settings Page ──────────────────────────────────────
  const settingsPage = () => {
    const s = AppState.get();
    const tunes = Object.keys(TUNE_LABELS);

    const section = (icon, title, color, content) => `
      <div class="card" style="margin-bottom:12px;">
        <div class="section-header" style="color:${color};">${icon} ${title}</div>
        ${content}
      </div>`;

    return `
    <div class="settings-page fade-in">

      ${section('🎨', I18n.t('appearance'), '#a78bfa', `
        <div class="settings-row">
          <div>
            <div class="settings-row__title">${I18n.t('theme')}</div>
            <div class="settings-row__sub">${s.dark ? I18n.t('darkMode') : I18n.t('lightMode')}</div>
          </div>
          <div class="theme-switch" onclick="Actions.toggleTheme()">
            <span class="theme-switch__sun">☀️</span>
            <span class="theme-switch__moon">🌙</span>
            <div class="theme-switch__thumb">${s.dark ? '🌙' : '☀️'}</div>
          </div>
        </div>
      `)}

      ${section('🌐', I18n.t('language'), '#4ade80', `
        ${LANGUAGES.map(l => `
          <button class="lang-btn ${s.lang === l.code ? 'active' : ''}"
                  onclick="Actions.setLang('${l.code}')">
            <span class="lang-btn__flag">${l.flag}</span>
            <span class="lang-btn__name">${l.name}</span>
            ${s.lang === l.code ? '<span class="lang-btn__check">✓</span>' : ''}
          </button>
        `).join('')}
      `)}

      ${section('🔔', I18n.t('notifications'), '#fbbf24', `
        <div class="settings-row">
          <div>
            <div class="settings-row__title">${I18n.t('enableNotif')}</div>
            <div class="settings-row__sub">${I18n.t('dailyAt')}</div>
          </div>
          <div class="toggle ${s.notifOn ? 'on' : 'off'}" onclick="Actions.toggleNotif()">
            <div class="toggle__thumb"></div>
          </div>
        </div>
        <div>
          <div class="input-label" style="margin-top:8px;">${I18n.t('alertTune')}</div>
          <div class="tune-grid">
            ${tunes.map(k => `
              <button class="tune-btn ${s.tune === k ? 'active' : ''}"
                      onclick="Actions.setTune('${k}')">
                ${s.tune === k ? '🔊' : '🎵'} ${TUNE_LABELS[k]}
              </button>
            `).join('')}
          </div>
        </div>
      `)}

      <div class="storage-info">
        <div class="storage-info__title">${I18n.t('storageInfo')}</div>
        ${I18n.t('storageTips').map(tip => `
          <div class="storage-info__item">
            <span class="storage-info__arrow">→</span>
            <span class="storage-info__text">${tip}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  };

  // ── Bulk Confirm Modal ─────────────────────────────────
  const bulkConfirmModal = (stats) => `
    <div class="modal-overlay" onclick="event.target===this&&Actions.closeBulkConfirm()">
      <div class="modal-box">
        <div style="font-size:36px;text-align:center;margin-bottom:12px;">🗑️</div>
        <div style="color:var(--text);font-size:15px;font-weight:700;text-align:center;margin-bottom:8px;font-family:var(--font-display);">
          ${I18n.t('deleteExpired')}
        </div>
        <div style="color:#f87171;font-size:13px;text-align:center;margin-bottom:20px;">
          ${stats.expired} ${I18n.t('deleteConfirmSub')} ${stats.wasteVal} ${I18n.t('value')}
        </div>
        <div class="flex gap-sm">
          <button class="btn btn-ghost flex-1" onclick="Actions.closeBulkConfirm()">
            ${I18n.t('cancel')}
          </button>
          <button class="btn btn-danger" style="flex:1;" onclick="Actions.bulkDelete()">
            ${I18n.t('deleteBtn')}
          </button>
        </div>
      </div>
    </div>`;

  // ── Toast ──────────────────────────────────────────────
  const toast = ({ msg, type }) => `
    <div class="toast ${type}">${msg}</div>`;

  // ── Helpers ────────────────────────────────────────────
  const escHtml = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return {
    app,
    escHtml,
  };
})();
