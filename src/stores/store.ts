import { create } from 'zustand';
import type { List, PersistedShoppingListStore } from '../interfaces';
import { persist } from 'zustand/middleware';
import { LOCAL_STORAGE_STORE_KEY, LOCAL_STORAGE_THEME_KEY } from '../consts';
import { generateId } from '../utils/utils';
import { devtools } from 'zustand/middleware';
import type { SyncStatus } from '../services/interfaces';

export const DEFAULT_VALUES: PersistedShoppingListStore = {
  state: {
    lists: [
      {
        id: '0',
        title: 'First Card',
        createdAt: new Date().toISOString(),
        content: [
          {
            id: '1',
            value: 'first el in First List',
            checked: false,
            depth: 0,
            parentId: null,
          },
          {
            id: '2',
            value: 'second el in First List',
            checked: false,
            depth: 0,
            parentId: null,
          },
          {
            id: '3',
            value: 'third el in First List',
            checked: false,
            depth: 0,
            parentId: null,
          },
          {
            id: '4',
            value: 'fourth el in First List',
            checked: false,
            depth: 0,
            parentId: null,
          },
        ],
      },
      {
        id: '2',
        title: 'Second Card',
        createdAt: new Date().toISOString(),
        content: [
          {
            id: '1',
            value: 'first el in Second List',
            checked: true,
            depth: 0,
            parentId: null,
          },
          {
            id: '2',
            value: 'second el in Second List',
            checked: false,
            depth: 0,
            parentId: null,
          },
          {
            id: '3',
            value: 'third el in Second List',
            checked: false,
            depth: 0,
            parentId: null,
          },
          {
            id: '4',
            value: 'fourth el in Second List',
            checked: true,
            depth: 0,
            parentId: null,
          },
        ],
      },
    ],
  },
};

export type StoreState = {
  lists: List[];
  setLists: (lists: List[]) => void;
  moveList: (originalIndex: number, targetIndex: number) => void;
  addList: (item: List) => void;
  updateList: (item: List) => void;
  removeList: (listId: string) => void;
  copyList: (listId: string) => void;
  removeCheckedListItems: (listId: string) => void;
};

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
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
        copyList: (listId) =>
          set((state) => {
            const itemToCopy = state.lists.filter((item) => item.id === listId)?.[0];
            const index = state.lists.indexOf(itemToCopy);
            if (itemToCopy) {
              const updatedList = [...state.lists];
              const copiedItem = {
                ...itemToCopy,
                title: `${itemToCopy.title}-copy`,
                id: generateId(),
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
      }),
      { name: LOCAL_STORAGE_STORE_KEY }
    )
  )
);

type StoreThemeState = {
  theme: string;
  setTheme: (theme: string) => void;
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
};

export const useActiveCardIdStore = create<ActiveCardIdStore>((set) => ({
  editingCardId: null,
  setEditingCardId: (id) => set(() => ({ editingCardId: id })),
}));

type SyncStore = {
  isSaving: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus | undefined;
  pendingChangesCount: number;
  setIsSaving: (saving: boolean) => void;
  setIsOnline: (isOnline: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
  setPendingChangesCount: (pendingChangesCount: number) => void;
};

export const useSyncStore = create<SyncStore>((set) => ({
  isSaving: false,
  isOnline: false,
  syncStatus: undefined,
  pendingChangesCount: 0,
  setIsSaving: (isSaving) => set(() => ({isSaving})),
  setIsOnline: (isOnline) => set(() => ({ isOnline })),
  setSyncStatus: (syncStatus) => set(() => ({ syncStatus })),
  setPendingChangesCount: (pendingChangesCount) => set(() => ({ pendingChangesCount })),
}));
