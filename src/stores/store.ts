import { create } from 'zustand';
import type { List, ListItem, PersistedShoppingListStore } from '../interfaces';
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
  lists: List[];
  setLists: (lists: List[]) => void;
  moveList: (originalIndex: number, targetIndex: number) => void;
  moveListItem: (listId: string, originalIndex: number, targetIndex: number) => void;
  addList: (item: List) => void;
  updateList: (item: List) => void;
  updateListTitle: (cardId: string, title: string) => void;
  removeList: (listId: string) => void;
  copyList: (listId: string) => void;
  setListContent: (listId: string, content: ListItem[]) => void;
  removeListItem: (itemId: string, listItemId: string) => void;
  removeCheckedListItems: (listId: string) => void;
  checkListItem: (listId: string, index: number, checked: boolean) => void;
  updateListContent: (listContentItem: ListItem, listId: string, globalId: number) => void;
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
      moveListItem: (listId, originalIndex, targetIndex) =>
        set((state) => ({
          lists: state.lists.map((item) => {
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
      addList: (item) => set((state) => ({ lists: [...state.lists, item] })),
      updateList: (item) => set((state) => ({ lists: state.lists.map((elem) => (elem.id === item.id ? item : elem)) })),
      updateListTitle: (cardId: string, title: string) =>
        set((state) => ({ lists: state.lists.map((list) => (list.id === cardId ? { ...list, title: title } : list)) })),
      removeList: (listId) => set((state) => ({ lists: state.lists.filter((item) => item.id !== listId) })),
      copyList: (listId) =>
        set((state) => {
          const itemToCopy = state.lists.filter((item) => item.id === listId)?.[0];
          const index = state.lists.indexOf(itemToCopy);
          if (itemToCopy) {
            state.lists.splice(index + 1, 0, { ...itemToCopy, id: generateId() });
          }
          return { lists: state.lists };
        }),
      setListContent: (listId, content) => {
        set((state) => ({
          lists: state.lists.map((item) => {
            if (item.id === listId) {
              return { ...item, content: content };
            } else {
              return item;
            }
          }),
        }));
      },
      removeListItem: (itemId, listItemId) =>
        set((state) => ({
          lists: state.lists.filter((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                content: item.content.filter((listItem) => listItem.id !== listItemId),
              };
            } else {
              return item;
            }
          }),
        })),
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
      checkListItem: (listId, index, checked) =>
        set((state) => ({
          lists: state.lists.map((item) => {
            if (item.id === listId) {
              if (checked) {
                const el = item.content.splice(index, 1)?.[0];
                item.content.push({ ...el, checked });
              } else {
                const uncheckedListLength = item.content.filter((item) => !item.checked).length;
                const el = item.content.splice(index, 1)?.[0];
                item.content.splice(uncheckedListLength, 0, { ...el, checked });
              }
              return item;
            }
            return item;
          }),
        })),
      updateListContent: (listContentItem, listId, globalId) =>
        set((state) => ({
          lists: state.lists.map((item) => {
            if (item.id === listId) {
              const newContent = [...item.content];
              newContent[globalId] = listContentItem;
              return { ...item, content: newContent };
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
