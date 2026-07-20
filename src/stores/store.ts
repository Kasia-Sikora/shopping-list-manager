import { create } from 'zustand';
import type { List } from '../interfaces';
import { devtools, persist } from 'zustand/middleware';
import { LOCAL_STORAGE_LANG_KEY, LOCAL_STORAGE_THEME_KEY } from '../consts';
import type { SyncStatus } from '../services/interfaces';

export type StoreState = {
  lists: List[];
  setLists: (lists: List[]) => void;
  moveList: (originalIndex: number, targetIndex: number) => void;
  addList: (item: List) => void;
  updateList: (item: List) => void;
  removeList: (listId: string) => void;
  copyList: (listId: string, newId: string) => void;
  removeCheckedListItems: (listId: string) => void;
};

export const useStore = create<StoreState>()(
  devtools((set) => ({
    lists: [],
    setLists: (lists) => set(() => ({ lists: [...lists] })),
    moveList: (originalIndex, targetIndex) =>
      set((state) => {
        const updatedItems = [...state.lists];
        const [removed] = updatedItems.splice(originalIndex, 1);
        updatedItems.splice(targetIndex, 0, removed);
        return { lists: updatedItems };
      }),
    addList: (item) => set((state) => ({ lists: [...state.lists, item] })),
    updateList: (item) =>
      set((state) => ({
        lists: state.lists.map((elem) => {
          if (elem.id === item.id) {
            return item;
          } else {
            return elem;
          }
        }),
      })),
    removeList: (listId) => set((state) => ({ lists: state.lists.filter((item) => item.id !== listId) })),
    copyList: (listId, newId) =>
      set((state) => {
        const itemToCopy = state.lists.find((item) => item.id === listId);
        if (itemToCopy) {
          const index = state.lists.indexOf(itemToCopy);
          const updatedList = [...state.lists];
          const copiedItem = {
            ...itemToCopy,
            title: `${itemToCopy.title}-copy`,
            id: newId,
            createdAt: new Date().toISOString(),
          };
          updatedList.splice(index + 1, 0, copiedItem);
          return { lists: updatedList };
        }
        return { lists: state.lists };
      }),
    removeCheckedListItems: (listId) =>
      set((state) => ({
        lists: state.lists.map((item) => {
          if (item.id === listId) {
            const updatedItem = {
              ...item,
              content: item.content.filter((el) => !el.checked),
              updatedAt: new Date().toISOString(),
            };
            return updatedItem;
          } else {
            return item;
          }
        }),
      })),
  }))
);


type StoreThemeState = {
  theme: string;
  setTheme: (theme: 'light' | 'dark') => void;
};

export const useThemeStore = create<StoreThemeState>()(
  persist(
    (set) => ({
      theme: '',
      setTheme: (theme) => set(() => ({ theme: theme })),
    }),
    { name: LOCAL_STORAGE_THEME_KEY }
  )
);

type ActiveCardIdStore = {
  editingCardId: string | null;
  setEditingCardId: (id: string | null) => void;
  focusItemId: string | null;
  setFocusItemId: (id: string | null) => void;
};

export const useActiveCardIdStore = create<ActiveCardIdStore>((set) => ({
  editingCardId: null,
  setEditingCardId: (id) => set(() => ({ editingCardId: id })),
  focusItemId: null,
  setFocusItemId: (id) => set(() => ({ focusItemId: id })),
}));

type SyncStore = {
  isSaving: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus | undefined;
  pendingChangesCount: number;
  failedChangesCount: number;
  setIsSaving: (saving: boolean) => void;
  setIsOnline: (isOnline: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
  setPendingChangesCount: (pendingChangesCount: number) => void;
  setFailedChangesCount: (failedChangesCount: number) => void;
};

export const useSyncStore = create<SyncStore>((set) => ({
  isSaving: false,
  isOnline: false,
  syncStatus: undefined,
  pendingChangesCount: 0,
  failedChangesCount: 0,
  setIsSaving: (isSaving) => set(() => ({ isSaving })),
  setIsOnline: (isOnline) => set(() => ({ isOnline })),
  setSyncStatus: (syncStatus) => set(() => ({ syncStatus })),
  setPendingChangesCount: (pendingChangesCount) => set(() => ({ pendingChangesCount })),
  setFailedChangesCount: (failedChangesCount) => set(() => ({ failedChangesCount })),
}));

export type LocaleTypes = 'en' | 'pl';

type LocaleStore = {
  lang: LocaleTypes | undefined;
  setLang: (lang: LocaleTypes) => void;
};

export const AVAILABLE_LANGUAGES = ['en', 'pl'] as const satisfies readonly LocaleTypes[];

export const isLocale = (value: string): value is LocaleTypes =>
  (AVAILABLE_LANGUAGES as readonly string[]).includes(value);

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      lang: undefined,
      setLang: (lang: LocaleTypes) => set(() => ({ lang })),
    }),
    { name: LOCAL_STORAGE_LANG_KEY }
  )
);

type PopoverIdStore = {
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  closePopover: () => void;
};

export const usePopoverIdStore = create<PopoverIdStore>((set) => ({
  openPopoverId: null,
  setOpenPopoverId: (openPopoverId) => set(() => ({ openPopoverId })),
  closePopover: () => set(() => ({ openPopoverId: null })),
}));
