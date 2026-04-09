/* ============================================================
   FreshTrack — Utility Functions
   js/utils.js
   ============================================================ */

'use strict';

const Utils = (() => {

  // ── Date Helpers ───────────────────────────────────────
  const todayStr = () => new Date().toISOString().split('T')[0];

  const dfn = n => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };

  const calcDays = expiry => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const e = new Date(expiry); e.setHours(0, 0, 0, 0);
    return Math.floor((e - t) / 86_400_000);
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ── Status Helpers ─────────────────────────────────────
  const getStatus = days => {
    if (days > 3)  return STATUS.FRESH;
    if (days >= 1) return STATUS.SOON;
    if (days === 0) return STATUS.TODAY;
    return STATUS.EXPIRED;
  };

  const getDayLabel = (status, days) => {
    if (status === STATUS.EXPIRED) return `${Math.abs(days)}d ago`;
    if (status === STATUS.TODAY)   return 'Expires TODAY!';
    if (status === STATUS.FRESH)   return `${days} days left`;
    return `${days} day${days === 1 ? '' : 's'} left`;
  };

  // Progress: 0-100 based on a 30-day window
  const getProgress = days => Math.max(0, Math.min(100, (days / 30) * 100));

  // ── ID Generator ──────────────────────────────────────
  const newId = () => Date.now() + Math.floor(Math.random() * 1000);

  // ── CSV Export ─────────────────────────────────────────
  const exportCSV = (items) => {
    const header = 'Name,Category,Qty,Unit,Price (₹),Purchased,Expiry,Status\n';
    const rows = items.map(i =>
      `"${i.name}","${CAT_NAMES[i.cat] || i.cat}","${i.qty}","${i.unit}","${i.price}","${i.bought}","${i.expiry}","${getStatus(calcDays(i.expiry))}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FreshTrack_${todayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Image Compression ─────────────────────────────────
  const compressImage = (file, maxW = 400, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement('canvas');
          canvas.width  = img.width  * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ── Debounce ───────────────────────────────────────────
  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // ── Time string ───────────────────────────────────────
  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    todayStr, dfn, calcDays, formatDate,
    getStatus, getDayLabel, getProgress,
    newId, exportCSV, compressImage, debounce, currentTime,
  };
})();
