/* ============================================================
   FreshTrack — Storage Layer (localStorage wrapper)
   js/storage.js
   ============================================================ */

'use strict';

const Storage = (() => {
  const KEYS = {
    ITEMS:    'ft_items',
    SETTINGS: 'ft_settings',
    MONTHLY:  'ft_monthly',
  };

  // ── Items ──────────────────────────────────────────────
  const loadItems = () => {
    try {
      const raw = localStorage.getItem(KEYS.ITEMS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('FreshTrack: Failed to load items', e);
      return null;
    }
  };

  const saveItems = (items) => {
    try {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('FreshTrack: Failed to save items', e);
    }
  };

  // ── Settings ───────────────────────────────────────────
  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const saveSettings = (settings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('FreshTrack: Failed to save settings', e);
    }
  };

  // ── Monthly Waste History ──────────────────────────────
  const loadMonthly = () => {
    try {
      const raw = localStorage.getItem(KEYS.MONTHLY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  /**
   * Record waste value for current month when an item is deleted as expired.
   * Key format: "YYYY-MM" → total ₹ wasted
   */
  const recordWaste = (price) => {
    const history = loadMonthly();
    const key = new Date().toISOString().slice(0, 7); // "2026-04"
    history[key] = (history[key] || 0) + (+price || 0);
    try {
      localStorage.setItem(KEYS.MONTHLY, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  };

  /**
   * Get last 6 months of real waste data.
   * Returns array of { label, value } sorted oldest → newest.
   */
  const getMonthlyHistory = () => {
    const history = loadMonthly();
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = d.toISOString().slice(0, 7);
      return {
        label: MONTHS[d.getMonth()],
        value: history[key] || 0,
      };
    });
  };

  // ── Clear all ─────────────────────────────────────────
  const clearAll = () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  };

  return {
    loadItems, saveItems,
    loadSettings, saveSettings,
    recordWaste, getMonthlyHistory,
    clearAll,
  };
})();
