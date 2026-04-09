/* ============================================================
   FreshTrack — App Constants
   js/constants.js
   ============================================================ */

'use strict';

const CAT_EMOJI = {
  fruits:     '🍎',
  vegetables: '🥦',
  dairy:      '🥛',
  meat:       '🥩',
  bakery:     '🍞',
  beverages:  '🧃',
  snacks:     '🍿',
  grains:     '🌾',
  frozen:     '🧊',
};

const CAT_NAMES = {
  fruits:     'Fruits',
  vegetables: 'Vegetables',
  dairy:      'Dairy',
  meat:       'Meat & Seafood',
  bakery:     'Bakery',
  beverages:  'Beverages',
  snacks:     'Snacks',
  grains:     'Grains',
  frozen:     'Frozen',
};

const UNITS = ['kg', 'gm', 'litre', 'ml', 'pieces', 'packets', 'dozen', 'box'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS = {
  FRESH:   'fresh',
  SOON:    'soon',
  TODAY:   'today',
  EXPIRED: 'expired',
};

const STATUS_COLOR = {
  fresh:   '#22c55e',
  soon:    '#f59e0b',
  today:   '#ef4444',
  expired: '#dc2626',
};

const STATUS_LABEL = {
  fresh:   'FRESH',
  soon:    'EXPIRING SOON',
  today:   'EXPIRES TODAY',
  expired: 'EXPIRED',
};

const STATUS_ICON = {
  fresh:   '✅',
  soon:    '⚡',
  today:   '🔴',
  expired: '💀',
};

const FILTER_LABELS = {
  all:     'All',
  fresh:   'Fresh',
  soon:    'Expiring',
  expired: 'Expired',
};

const TUNE_LABELS = {
  chime:  'Soft Chime',
  bell:   'Bell Ring',
  nature: 'Nature',
  urgent: 'Urgent Alert',
};

const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी',    flag: '🇮🇳' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
  { code: 'es', name: 'Español',  flag: '🇪🇸' },
];

// Demo seed items (used only when localStorage is empty)
const SEED_ITEMS = () => {
  const dfn = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
  return [
    { id: 1, name: 'Organic Milk',    cat: 'dairy',      qty: '2',   unit: 'litre',   price: '120', bought: dfn(-3), expiry: dfn(5),   notes: 'Full cream', photo: null },
    { id: 2, name: 'Strawberries',    cat: 'fruits',     qty: '500', unit: 'gm',      price: '85',  bought: dfn(-1), expiry: dfn(2),   notes: '',           photo: null },
    { id: 3, name: 'Sourdough Bread', cat: 'bakery',     qty: '1',   unit: 'pieces',  price: '60',  bought: dfn(-2), expiry: dfn(1),   notes: '',           photo: null },
    { id: 4, name: 'Greek Yogurt',    cat: 'dairy',      qty: '400', unit: 'gm',      price: '95',  bought: dfn(-5), expiry: dfn(-1),  notes: '',           photo: null },
    { id: 5, name: 'Spinach',         cat: 'vegetables', qty: '250', unit: 'gm',      price: '40',  bought: dfn(-1), expiry: dfn(7),   notes: 'Organic',    photo: null },
    { id: 6, name: 'Chicken Breast',  cat: 'meat',       qty: '500', unit: 'gm',      price: '220', bought: dfn(0),  expiry: dfn(0),   notes: '',           photo: null },
    { id: 7, name: 'Basmati Rice',    cat: 'grains',     qty: '5',   unit: 'kg',      price: '320', bought: dfn(-10),expiry: dfn(180), notes: '',           photo: null },
    { id: 8, name: 'Mango Juice',     cat: 'beverages',  qty: '1',   unit: 'litre',   price: '75',  bought: dfn(-4), expiry: dfn(-3),  notes: '',           photo: null },
  ];
};
