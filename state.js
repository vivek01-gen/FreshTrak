/* ============================================================
   FreshTrack — Global State
   js/state.js
   ============================================================ */

'use strict';

const AppState = (() => {
  // ── Private state ──────────────────────────────────────
  let _state = {
    view:        'home',   // 'home' | 'additem' | 'edititem' | 'analytics' | 'settings'
    dark:        true,
    lang:        'en',
    items:       null,     // loaded from storage in app.js
    filter:      'all',    // 'all' | 'fresh' | 'soon' | 'expired'
    search:      '',
    swipedId:    null,
    editId:      null,     // item id being edited
    form: {
      name: '', cat: 'dairy', qty: '', unit: 'litre',
      price: '', bought: '', expiry: '', notes: '', photo: null,
    },
    formErr:     '',
    notifOn:     false,
    tune:        'chime',
    bulkConfirm: false,
    toast:       null,
    monthlyData: [],       // computed from items
  };

  // ── Getters ────────────────────────────────────────────
  const get = () => _state;

  const getField = key => _state[key];

  // ── Setters ────────────────────────────────────────────
  const set = (key, val) => { _state[key] = val; };

  const merge = patch => { _state = { ..._state, ...patch }; };

  const setFormField = (key, val) => {
    _state.form = { ..._state.form, [key]: val };
    _state.formErr = '';
  };

  const resetForm = () => {
    const today = Utils.todayStr();
    _state.form = {
      name: '', cat: 'dairy', qty: '', unit: 'litre',
      price: '', bought: today, expiry: '', notes: '', photo: null,
    };
    _state.formErr = '';
    _state.editId = null;
  };

  const loadEditForm = (item) => {
    _state.form = {
      name:   item.name,
      cat:    item.cat,
      qty:    item.qty,
      unit:   item.unit,
      price:  item.price,
      bought: item.bought,
      expiry: item.expiry,
      notes:  item.notes,
      photo:  item.photo,
    };
    _state.formErr = '';
    _state.editId = item.id;
  };

  // ── Computed ────────────────────────────────────────────
  const getStats = () => {
    const items = _state.items || [];
    const expired = items.filter(i => Utils.calcDays(i.expiry) < 0);
    return {
      total:    items.length,
      soon:     items.filter(i => { const d = Utils.calcDays(i.expiry); return d >= 0 && d <= 3; }).length,
      expired:  expired.length,
      wasteVal: expired.reduce((s, i) => s + (+i.price || 0), 0),
    };
  };

  const getFiltered = () => {
    const items = _state.items || [];
    return items.filter(i => {
      const d = Utils.calcDays(i.expiry), s = Utils.getStatus(d);
      const matchSearch = i.name.toLowerCase().includes(_state.search.toLowerCase());
      if (!matchSearch) return false;
      if (_state.filter === 'fresh')   return s === STATUS.FRESH;
      if (_state.filter === 'soon')    return s === STATUS.SOON || s === STATUS.TODAY;
      if (_state.filter === 'expired') return s === STATUS.EXPIRED;
      return true;
    });
  };

  const getAlerts = () => {
    const items = _state.items || [];
    return items.flatMap(i => {
      const d = Utils.calcDays(i.expiry), out = [];
      if (d === 2) out.push(`⚠️ ${CAT_EMOJI[i.cat]} ${i.name} expires in 2 days!`);
      if (d === 0) out.push(`🔴 ${CAT_EMOJI[i.cat]} ${i.name} expires TODAY!`);
      if (d < 0)   out.push(`❌ ${CAT_EMOJI[i.cat]} ${i.name} has expired!`);
      return out;
    });
  };

  const getMonthlyData = () => {
    // Build real 6-month waste data from items
    const now = new Date();
    const result = [];
    for (let m = 5; m >= 0; m--) {
      const target = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const items = _state.items || [];
      const waste = items
        .filter(i => {
          const exp = new Date(i.expiry);
          return exp.getFullYear() === target.getFullYear() &&
                 exp.getMonth() === target.getMonth() &&
                 Utils.calcDays(i.expiry) < 0;
        })
        .reduce((s, i) => s + (+i.price || 0), 0);
      result.push({
        label: MONTHS[target.getMonth()],
        value: m === 0 ? waste : 0, // current month real, past months 0 (no historical data)
      });
    }
    // Fill past months with illustrative data for first-time users
    if (result.every(r => r.value === 0)) {
      const demo = [820, 650, 1100, 430, 780];
      for (let i = 0; i < 5; i++) result[i].value = demo[i];
    }
    return result;
  };

  return {
    get, getField, set, merge,
    setFormField, resetForm, loadEditForm,
    getStats, getFiltered, getAlerts, getMonthlyData,
  };
})();
