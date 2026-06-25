import { create } from 'zustand';
import type { List, PersistedShoppingListStore } from '../interfaces';
import { persist } from 'zustand/middleware';
import { LOCAL_STORAGE_STORE_KEY, LOCAL_STORAGE_THEME_KEY } from '../consts';
import { generateId } from '../utils/utils';

export const DEFAULT_VALUES: PersistedShoppingListStore = {
  state: {
    lists: [
      {
        id: '0',
        title: 'First Card',
        content: [
          {
            id: '1',
            value: 'first el in First List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '2',
            value: 'second el in First List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '3',
            value: 'third el in First List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '4',
            value: 'fourth el in First List',
            checked: false,
            depth: 0,
            parentId: null
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
            parentId: null
          },
          {
            id: '2',
            value: 'second el in Second List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '3',
            value: 'third el in Second List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '4',
            value: 'fourth el in Second List',
            checked: true,
            depth: 0,
            parentId: null
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
      updateList: (item) => set((state) => ({ lists: state.lists.map((elem) => (elem.id === item.id ? item : elem)) })),
      removeList: (listId) => set((state) => ({ lists: state.lists.filter((item) => item.id !== listId) })),
      copyList: (listId) =>
        set((state) => {
          const itemToCopy = state.lists.filter((item) => item.id === listId)?.[0];
          const index = state.lists.indexOf(itemToCopy);
          if (itemToCopy) {
            state.lists.splice(index + 1, 0, { ...itemToCopy, title: `${itemToCopy.title}-copy`, id: generateId() });
          }
          return { lists: state.lists };
        }),
      removeCheckedListItems: (listId) =>
        set((state) => ({
          lists: state.lists.map((item) => {
            if (item.id === listId) {
              return { ...item, content: item.content.filter((el) => !el.checked) };
            } else {
              return item;
            }
          }),
        })),
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
};

export const useActiveCardIdStore = create<ActiveCardIdStore>((set) => ({
  editingCardId: null,
  setEditingCardId: (id) => set(() => ({ editingCardId: id })),
}));
