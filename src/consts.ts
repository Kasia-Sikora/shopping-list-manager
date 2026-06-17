import type { ListItem } from "./interfaces";
import { generateId } from "./utils/utils";

export const LOCAL_STORAGE_THEME_KEY = 'theme'
export const LOCAL_STORAGE_STORE_KEY = 'shopping-lists'
export const MAX_LIST_DEPTH = 1;
export const DELETE_BUTTON_W_GAP_SIZE = 36
export const INDENT_VALUE = 31
export const DEFAULT_CONTENT = [{ id: generateId(), value: '', checked: false, depth: 0 } as ListItem]
export const EMPTY_CARD_ID = 'empty'