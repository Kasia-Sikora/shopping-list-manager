import { create } from 'zustand';
import type { List, ListItem, PersistedShoppingListStore } from '../interfaces';
import { persist } from 'zustand/middleware';
import { LOCAL_STORAGE_STORE_KEY, LOCAL_STORAGE_THEME_KEY } from '../consts';
import { generateId } from '../utils/utils';

export const DEFAULT_VALUES: PersistedShoppingListStore = {
  state: {
    items: [
      {
        id: '0',
        title: 'First Card',
        content: [
          {
            id: '1',
            value: 'first el in First List',
            checked: false,
            depth: 0,
          },
          {
            id: '2',
            value: 'second el in First List',
            checked: false,
            depth: 0,
          },
          {
            id: '3',
            value: 'third el in First List',
            checked: false,
            depth: 0,
          },
          {
            id: '4',
            value: 'fourth el in First List',
            checked: false,
            depth: 0,
          },
        ],
      },
      {
        id: '2',
        title: 'Second Card',
        content: [
          {
            id: '1',
            value: 'first el in Second List',
            checked: true,
            depth: 0,
          },
          {
            id: '2',
            value: 'second el in Second List',
            checked: false,
            depth: 0,
          },
          {
            id: '3',
            value: 'third el in Second List',
            checked: false,
            depth: 0,
          },
          {
            id: '4',
            value: 'fourth el in Second List',
            checked: true,
            depth: 0,
          },
        ],
      },
    ],
  },
};

export type StoreState = {
  items: List[];
  setItems: (items: List[]) => void;
  moveList: (originalIndex: number, targetIndex: number) => void;
  moveListItem: (listId: string, originalIndex: number, targetIndex: number) => void;
  addItem: (item: List) => void;
  updateItem: (item: List) => void;
  removeCard: (cardId: string) => void;
  copyCard: (cardId: string) => void;
  setContent: (cardId: string, content: ListItem[]) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set(() => ({ items: [...items] })),
      moveList: (originalIndex, targetIndex) =>
        set((state) => {
          const updatedItems = [...state.items];

          const [removed] = updatedItems.splice(originalIndex, 1);
          updatedItems.splice(targetIndex, 0, removed);

          return { items: updatedItems };
        }),
      moveListItem: (listId, originalIndex, targetIndex) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === listId) {
              const uncheckedLength = item.content.filter((item) => !item.checked).length;
              const [removed] = item.content.splice(originalIndex, 1);
              if (removed) {
                const moveToIndex = item.content[originalIndex].checked ? targetIndex + uncheckedLength : targetIndex;
                item.content.splice(moveToIndex, 0, removed);
              }
            }
            return item;
          }),
        })),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (item) => set((state) => ({ items: state.items.map((elem) => (elem.id === item.id ? item : elem)) })),
      removeCard: (cardId) => set((state) => ({ items: state.items.filter((item) => item.id !== cardId) })),
      copyCard: (cardId) =>
        set((state) => {
          const itemToCopy = state.items.filter((item) => item.id === cardId)?.[0];
          const index = state.items.indexOf(itemToCopy);
          if (itemToCopy) {
            state.items.splice(index + 1, 0, { ...itemToCopy, id: generateId() });
          }
          return { items: state.items };
        }),
      setContent: (cardId, content) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === cardId) {
              return { ...item, content: content };
            } else {
              return item;
            }
          }),
        }));
      },
    }),
    { name: LOCAL_STORAGE_STORE_KEY }
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
  resetStates: () => void;
};

export const useActiveCardIdStore = create<ActiveCardIdStore>((set) => ({
  editingCardId: null,
  setEditingCardId: (id) => set(() => ({ editingCardId: id })),
  resetStates: () => set(() => ({editingCardId: null}))
}));
