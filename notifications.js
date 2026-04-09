/* ============================================================
   FreshTrack — Notifications
   js/notifications.js
   ============================================================ */

'use strict';

const Notifications = (() => {
  let _scheduledTimer = null;

  // ── Permission ─────────────────────────────────────────
  const isSupported = () => 'Notification' in window;

  const getPermission = () => isSupported() ? Notification.permission : 'denied';

  const requestPermission = async () => {
    if (!isSupported()) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  // ── Send notification ──────────────────────────────────
  const send = (title, body, icon = 'assets/icon-192.png') => {
    if (!isSupported() || Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'freshtrack-alert',
      renotify: true,
    });
    n.onclick = () => { window.focus(); n.close(); };
    setTimeout(() => n.close(), 8000);
  };

  // ── Play alert tone ────────────────────────────────────
  const playTone = (tune = 'chime') => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const toneMap = {
      chime:  [{ freq: 523, dur: 0.15 }, { freq: 659, dur: 0.15 }, { freq: 784, dur: 0.25 }],
      bell:   [{ freq: 880, dur: 0.4 }],
      nature: [{ freq: 392, dur: 0.2 }, { freq: 440, dur: 0.15 }, { freq: 523, dur: 0.2 }],
      urgent: [{ freq: 880, dur: 0.1 }, { freq: 440, dur: 0.1 }, { freq: 880, dur: 0.1 }, { freq: 440, dur: 0.1 }],
    };

    const notes = toneMap[tune] || toneMap.chime;
    let time = ctx.currentTime;

    notes.forEach(note => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = note.freq;
      osc.type = tune === 'nature' ? 'sine' : 'triangle';
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur);
      osc.start(time);
      osc.stop(time + note.dur);
      time += note.dur + 0.05;
    });
  };

  // ── Check & send daily alerts ──────────────────────────
  const checkAlerts = (items, tune) => {
    if (!items || !items.length) return;

    const expiredToday  = items.filter(i => Utils.calcDays(i.expiry) === 0);
    const expiringSoon  = items.filter(i => { const d = Utils.calcDays(i.expiry); return d > 0 && d <= 2; });
    const alreadyExpired = items.filter(i => Utils.calcDays(i.expiry) < 0);

    if (expiredToday.length > 0) {
      send(
        '🔴 Expires Today!',
        expiredToday.map(i => i.name).join(', ') + ' expire(s) today!',
      );
      playTone(tune || 'chime');
    } else if (expiringSoon.length > 0) {
      send(
        '⚡ Expiring Soon',
        expiringSoon.map(i => i.name).join(', ') + ' expiring soon!',
      );
      playTone(tune || 'chime');
    } else if (alreadyExpired.length > 0) {
      send(
        '❌ Expired Items',
        `${alreadyExpired.length} item(s) have expired. Please check your inventory.`,
      );
    }
  };

  // ── Schedule daily check at 9:00 AM ────────────────────
  const scheduleDailyCheck = (items, tune) => {
    clearTimeout(_scheduledTimer);
    const now = new Date();
    const next9am = new Date(now);
    next9am.setHours(9, 0, 0, 0);
    if (now >= next9am) next9am.setDate(next9am.getDate() + 1);
    const msUntil = next9am - now;
    _scheduledTimer = setTimeout(() => {
      checkAlerts(items, tune);
      scheduleDailyCheck(items, tune); // reschedule for next day
    }, msUntil);
  };

  const cancelScheduled = () => {
    clearTimeout(_scheduledTimer);
    _scheduledTimer = null;
  };

  return {
    isSupported,
    getPermission,
    requestPermission,
    send,
    playTone,
    checkAlerts,
    scheduleDailyCheck,
    cancelScheduled,
  };
})();
