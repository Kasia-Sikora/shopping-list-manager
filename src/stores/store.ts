import { create } from 'zustand';
import type { List } from '../interfaces';

const DEFAULT_VALUES: List[] = [
  {
    id: '0',
    title: 'First Card',
    content: [
      {
        listItemId: '1',
        value: 'first el in First List',
        checked: false,
      },
      {
        listItemId: '2',
        value: 'second el in First List',
        checked: false,
      },
      {
        listItemId: '3',
        value: 'third el in First List',
        checked: false,
      },
      {
        listItemId: '4',
        value: 'fourth el in First List',
        checked: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Second Card',
    content: [
      {
        listItemId: '1',
        value: 'first el in Second List',
        checked: true,
      },
      {
        listItemId: '2',
        value: 'second el in Second List',
        checked: false,
      },
      {
        listItemId: '3',
        value: 'third el in Second List',
        checked: false,
      },
      {
        listItemId: '4',
        value: 'fourth el in Second List',
        checked: true,
      },
    ],
  },
];

export type StoreState = {
  items: List[];
  addItem: (item: List) => void;
  updateItem: (item: List) => void;
  removeItem: (itemId: string, listItemId: string) => void;
  checkItem: (itemId: string, listItemId: string, checked: boolean) => void;
};

export const useStore = create<StoreState>((set) => ({
  items: DEFAULT_VALUES,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (item) => set((state) => ({ items: state.items.map((i) => (i.id === item.id ? item : i)) })),
  removeItem: (itemId, listItemId) =>
    set((state) => ({
      items: state.items.filter((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            content: item.content.filter((listItem) => listItem.listItemId !== listItemId),
          };
        } else {
          return item;
        }
      }),
    })),
  checkItem: (itemId: string, listItemId: string, checked: boolean) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            content: item.content.map((listItem) =>
              listItem.listItemId === listItemId ? { ...listItem, checked } : listItem
            ),
          };
        }
        return item;
      }),
    })),
}));
