/* ============================================================
   FreshTrack — App Entry Point & Initialization
   js/app.js
   ============================================================ */

'use strict';

(function initApp() {

  // ── Load persisted data ────────────────────────────────
  const savedItems    = Storage.loadItems();
  const savedSettings = Storage.loadSettings();

  // Seed with demo data if first launch
  AppState.set('items', savedItems || SEED_ITEMS());

  // Restore settings
  if (savedSettings) {
    AppState.set('dark',    savedSettings.dark    ?? true);
    AppState.set('lang',    savedSettings.lang    ?? 'en');
    AppState.set('notifOn', savedSettings.notifOn ?? false);
    AppState.set('tune',    savedSettings.tune    ?? 'chime');
  }

  // ── Show splash then render ────────────────────────────
  const SPLASH_DURATION = 1600; // ms

  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.remove();

    // Initial render
    Render.app();

    // Re-schedule notifications if enabled
    if (AppState.getField('notifOn')) {
      Notifications.scheduleDailyCheck(
        AppState.getField('items'),
        AppState.getField('tune')
      );
    }

    // Clock tick — update status bar time every minute
    setInterval(() => {
      const timeEl = document.querySelector('.status-bar__time');
      if (timeEl) timeEl.textContent = Utils.currentTime();
    }, 60_000);

  }, SPLASH_DURATION);

  // ── Handle visibility change (refocus) ────────────────
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && AppState.getField('view') === 'home') {
      Render.app(); // re-check expiry statuses
    }
  });

  // ── Handle back button (Android) ──────────────────────
  window.addEventListener('popstate', () => {
    const view = AppState.getField('view');
    if (view !== 'home') {
      history.pushState(null, '', '');
      Actions.navTo('home');
    }
  });

  // Push initial history entry for back-button support
  history.pushState(null, '', '');

})();
