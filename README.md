# 🌿 FreshTrack — Food Expiry Tracker

> **Never waste food again.** Track expiry dates, get smart alerts, reduce waste & save money — all offline, no backend needed.

![FreshTrack Banner](assets/screenshot-home.png)

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e?style=flat-square&logo=github)](https://vivek01-gen.github.io/FreshTrak/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=flat-square)](https://vivek01-gen.github.io/FreshTrak/)
[![Offline First](https://img.shields.io/badge/Offline-First-orange?style=flat-square)](https://vivek01-gen.github.io/FreshTrak/)
[![Languages](https://img.shields.io/badge/Languages-4-purple?style=flat-square)](#multilingual)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

### 🥗 Inventory Management
- Add food items with **name, category, quantity, price, purchase date & expiry date**
- Upload **item photos** (auto-compressed, stored as Base64)
- **Edit** existing items anytime
- **Swipe-to-delete** with single item removal
- **Bulk delete** all expired items at once

### 📊 Smart Status Tracking
| Status | Condition | Color |
|--------|-----------|-------|
| 🟢 **FRESH** | More than 3 days left | Green |
| ⚡ **EXPIRING SOON** | 1–3 days left | Amber |
| 🔴 **EXPIRES TODAY** | 0 days left | Red |
| 💀 **EXPIRED** | Past expiry date | Dark Red |

### 📈 Analytics Dashboard
- Monthly waste tracking chart (real data from your items)
- Waste breakdown by food category
- Total money wasted on expired items
- Expired items list with individual prices

### 🔔 Real Notifications
- Browser **Push Notifications** via Web Notification API
- **Daily alerts** at 9:00 AM for expiring/expired items
- **4 alert tunes** (Soft Chime, Bell Ring, Nature, Urgent) via Web Audio API
- Notification permission handled gracefully

### 🌐 Multilingual Support (i18n)
Full translations for:
- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)
- 🇯🇵 Japanese (日本語)
- 🇪🇸 Spanish (Español)

### 🎨 Design
- **Dark & Light themes** with smooth toggle
- Mobile-first design (max-width 430px)
- Custom fonts: **Syne** (display) + **DM Sans** (body)
- Smooth animations & micro-interactions
- Staggered list entrance animations

### 💾 Offline First (PWA)
- **100% offline** — no internet required after first load
- Service Worker caches all assets
- Data stored in **localStorage** — persists across sessions
- Installable as a **Progressive Web App** on Android/iOS
- Waste history tracked across months via localStorage

### 📤 Data Export
- Export inventory to **CSV** with one tap
- CSV includes name, category, quantity, price, dates, status

---

## 🗂️ Project Structure

```
FreshTrack/
├── index.html              ← App entry point
├── manifest.json           ← PWA manifest
├── service-worker.js       ← Offline caching & push
│
├── css/
│   ├── variables.css       ← Design tokens (colors, fonts, spacing)
│   ├── base.css            ← Reset, body, utility classes
│   ├── components.css      ← Buttons, cards, inputs, modals, nav
│   ├── pages.css           ← Page-specific layouts
│   └── animations.css      ← Keyframes & transitions
│
├── js/
│   ├── constants.js        ← Category data, seed items, labels
│   ├── state.js            ← Global app state (IIFE module)
│   ├── utils.js            ← Date helpers, CSV export, image compression
│   ├── storage.js          ← localStorage wrapper + waste history
│   ├── i18n.js             ← Full translations (EN/HI/JA/ES)
│   ├── notifications.js    ← Web Notifications + Web Audio API
│   ├── render.js           ← HTML rendering engine (all views)
│   ├── actions.js          ← User interaction handlers
│   └── app.js              ← Initialization & boot sequence
│
└── assets/
    ├── icon.svg            ← App icon (SVG)
    ├── icon-192.png        ← PWA icon 192×192
    └── icon-512.png        ← PWA icon 512×512
```

---

## 🚀 Quick Start

### Option 1 — GitHub Pages (Recommended)

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your app will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

### Option 2 — Run Locally

```bash
# Clone the repo
git clone https://github.com/vivek01-gen/FreshTrak.git
cd FreshTrak

# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8080
# or just open index.html in your browser
```

> ⚠️ **Note:** Service Worker requires HTTPS or `localhost`. Open via a local server, not `file://` for full PWA features.

---

## 📱 Install as PWA

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **⋮ menu** → **Add to Home Screen**
3. Tap **Install**

### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

---

## 🏗️ Architecture

FreshTrack uses a **vanilla JS module pattern** — no frameworks, no build tools, no dependencies (except Google Fonts).

```
index.html
    └── loads CSS files in order
    └── loads JS modules in dependency order:
         constants.js   ← pure data
         state.js       ← depends on utils
         utils.js       ← pure functions
         storage.js     ← depends on utils
         i18n.js        ← depends on state
         notifications.js ← depends on utils
         render.js      ← depends on all above
         actions.js     ← depends on all above
         app.js         ← boot (runs last)
```

All modules are **IIFEs** exposed as global objects (`AppState`, `Utils`, `Storage`, `I18n`, `Notifications`, `Render`, `Actions`). This keeps the codebase simple, debuggable, and framework-free.

---

## 🐛 Known Limitations

- Photos are stored as Base64 in localStorage. Large images may hit the ~5MB localStorage limit. (Auto-compression at 400px width mitigates this.)
- Notification scheduling uses `setTimeout` — if the browser tab is closed, daily reminders won't fire. Use the PWA install for better reliability.
- Monthly waste chart only shows real data from the current session onwards. Past months use illustrative demo data for new users.

---

## 🛣️ Roadmap

- [ ] Shopping list generator from expired/expiring items
- [ ] Barcode scanner integration
- [ ] Cloud sync (optional, via Firebase)
- [ ] Widget for home screen
- [ ] Recurring item templates
- [ ] WhatsApp/Telegram alert integration

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
# Fork → Clone → Create branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: add your feature"
git push origin feature/your-feature

# Open a Pull Request on GitHub
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built By

Made with 🌿 by [@vivek01-gen](https://github.com/vivek01-gen)

> *"The best time to track your food was when you bought it. The second best time is now."*
