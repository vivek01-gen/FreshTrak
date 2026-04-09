/* ============================================================
   FreshTrack — Actions (Event Handlers)
   js/actions.js
   ============================================================ */

'use strict';

const Actions = (() => {

  let _toastTimer = null;
  let _searchDebounce = null;

  // ── Navigation ─────────────────────────────────────────
  const navTo = (view) => {
    AppState.set('swipedId', null);
    AppState.set('view', view);
    if (view === 'additem') {
      AppState.resetForm();
    }
    Render.app();
    // scroll to top
    const body = document.getElementById('scroll-body');
    if (body) body.scrollTop = 0;
  };

  // ── Theme ──────────────────────────────────────────────
  const toggleTheme = () => {
    const next = !AppState.getField('dark');
    AppState.set('dark', next);
    _saveSettings();
    Render.app();
  };

  // ── Filter & Search ────────────────────────────────────
  const filterBy = (f) => {
    AppState.set('filter', f);
    AppState.set('search', '');
    Render.app();
  };

  const onSearch = (val) => {
    AppState.set('search', val);
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(() => {
      Render.app();
      // re-focus and restore caret
      requestAnimationFrame(() => {
        const el = document.getElementById('search-inp');
        if (el) { el.focus(); el.setSelectionRange(val.length, val.length); }
      });
    }, 120);
  };

  // ── Swipe ──────────────────────────────────────────────
  const swipeItem = (id) => {
    const current = AppState.getField('swipedId');
    AppState.set('swipedId', current === id ? null : id);
    Render.app();
  };

  // ── Delete ─────────────────────────────────────────────
  const deleteItem = (id) => {
    const items = AppState.getField('items') || [];
    const item  = items.find(i => i.id === id);
    // Record waste if expired
    if (item && Utils.calcDays(item.expiry) < 0) {
      Storage.recordWaste(item.price);
    }
    AppState.set('items', items.filter(i => i.id !== id));
    AppState.set('swipedId', null);
    Storage.saveItems(AppState.getField('items'));
    showToast(I18n.t('itemRemoved'), 'info');
  };

  // ── Bulk Delete ────────────────────────────────────────
  const confirmBulkDelete = () => {
    const { expired } = AppState.getStats();
    if (expired === 0) { showToast(I18n.t('noExpiredItems'), 'info'); return; }
    AppState.set('bulkConfirm', true);
    Render.app();
  };

  const closeBulkConfirm = () => {
    AppState.set('bulkConfirm', false);
    Render.app();
  };

  const bulkDelete = () => {
    const items = AppState.getField('items') || [];
    // Record all expired waste
    items.filter(i => Utils.calcDays(i.expiry) < 0)
         .forEach(i => Storage.recordWaste(i.price));
    AppState.set('items', items.filter(i => Utils.calcDays(i.expiry) >= 0));
    AppState.set('bulkConfirm', false);
    Storage.saveItems(AppState.getField('items'));
    showToast(I18n.t('expiredCleared'), 'ok');
  };

  // ── Form Fields ────────────────────────────────────────
  const setFormField = (key, val) => {
    AppState.setFormField(key, val);
    Render.app();
  };

  const onFormName = (val) => {
    AppState.setFormField('name', val);
    Render.app();
    requestAnimationFrame(() => {
      const el = document.querySelector('input[oninput="Actions.onFormName(this.value)"]');
      if (el) { el.focus(); el.setSelectionRange(val.length, val.length); }
    });
  };

  const onPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await Utils.compressImage(file);
      AppState.setFormField('photo', compressed);
      Render.app();
    } catch {
      showToast('❌ Photo failed', 'error');
    }
  };

  // ── Save / Update Item ─────────────────────────────────
  const saveItem = (isEdit = false) => {
    const f = AppState.getField('form');

    if (!f.name.trim()) {
      AppState.set('formErr', I18n.t('nameRequired'));
      Render.app();
      return;
    }
    if (!f.expiry) {
      AppState.set('formErr', I18n.t('expiryRequired'));
      Render.app();
      return;
    }

    const items = AppState.getField('items') || [];

    if (isEdit) {
      const editId = AppState.getField('editId');
      const updated = items.map(i =>
        i.id === editId ? { ...i, ...f, id: editId } : i
      );
      AppState.set('items', updated);
      Storage.saveItems(updated);
      navTo('home');
      showToast(I18n.t('itemUpdated'), 'ok');
    } else {
      const newItem = { ...f, id: Utils.newId() };
      const updated = [newItem, ...items];
      AppState.set('items', updated);
      Storage.saveItems(updated);
      navTo('home');
      showToast(I18n.t('itemSaved'), 'ok');
    }
  };

  // ── Edit Item ──────────────────────────────────────────
  const editItem = (id) => {
    const items = AppState.getField('items') || [];
    const item  = items.find(i => i.id === id);
    if (!item) return;
    AppState.loadEditForm(item);
    AppState.set('view', 'edititem');
    Render.app();
    const body = document.getElementById('scroll-body');
    if (body) body.scrollTop = 0;
  };

  // ── CSV Export ─────────────────────────────────────────
  const exportCSV = () => {
    Utils.exportCSV(AppState.getField('items') || []);
    showToast(I18n.t('csvExported'), 'ok');
  };

  // ── Settings ───────────────────────────────────────────
  const toggleNotif = async () => {
    const current = AppState.getField('notifOn');
    if (!current) {
      const granted = await Notifications.requestPermission();
      if (!granted) {
        showToast('🔕 Notifications blocked by browser', 'info');
        return;
      }
      AppState.set('notifOn', true);
      Notifications.scheduleDailyCheck(
        AppState.getField('items'),
        AppState.getField('tune')
      );
      showToast('🔔 Notifications enabled!', 'ok');
    } else {
      AppState.set('notifOn', false);
      Notifications.cancelScheduled();
      showToast('🔕 Notifications off', 'info');
    }
    _saveSettings();
    Render.app();
  };

  const setTune = (tune) => {
    AppState.set('tune', tune);
    Notifications.playTone(tune);
    _saveSettings();
    Render.app();
  };

  const setLang = (lang) => {
    AppState.set('lang', lang);
    _saveSettings();
    Render.app();
  };

  // ── Toast ──────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    AppState.set('toast', { msg, type });
    clearTimeout(_toastTimer);
    Render.app();
    _toastTimer = setTimeout(() => {
      AppState.set('toast', null);
      Render.app();
    }, 3000);
  };

  // ── Private Helpers ────────────────────────────────────
  const _saveSettings = () => {
    const s = AppState.get();
    Storage.saveSettings({
      dark:    s.dark,
      lang:    s.lang,
      notifOn: s.notifOn,
      tune:    s.tune,
    });
  };

  return {
    navTo,
    toggleTheme,
    filterBy,
    onSearch,
    swipeItem,
    deleteItem,
    confirmBulkDelete,
    closeBulkConfirm,
    bulkDelete,
    setFormField,
    onFormName,
    onPhoto,
    saveItem,
    editItem,
    exportCSV,
    toggleNotif,
    setTune,
    setLang,
    showToast,
  };
})();
