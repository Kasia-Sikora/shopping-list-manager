export const LOCAL_STORAGE_THEME_KEY = 'theme';
export const LOCAL_STORAGE_STORE_KEY = 'shopping-lists';
export const MAX_LIST_DEPTH = 1;
export const DELETE_BUTTON_W_GAP_SIZE = 36;
export const INDENT_VALUE = 37;
export const EMPTY_CARD_ID = 'empty';
export const SYNC_DELAY = 30000; //30 sec
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
let mount = 0;
export const appGuards = {
  get mount() {
    return mount;
  },
  addMount() {
    mount += 1;
  },
  _resetForTests() {
    mount = 0;
  },
};

export const LOADING_CARDS = [
  { id: 'lc-1', items: 4 },
  { id: 'lc-2', items: 2 },
  { id: 'lc-3', items: 3 },
]

export const MAX_RETRIES = 5;