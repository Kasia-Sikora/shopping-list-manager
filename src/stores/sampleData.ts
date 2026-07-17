import type { List } from '../interfaces';
import { useLocaleStore, type LocaleTypes } from './store';

type LocaleKey = {
  [key in LocaleTypes]: List[];
};

export const getSampleData = () => {
  const lang = useLocaleStore.getState().lang;
  return DEFAULT_VALUES[lang ?? 'en'];
};

const DEFAULT_VALUES: LocaleKey = {
  pl: [
    {
      id: '0',
      title: 'Spożywka',
      createdAt: new Date().toISOString(),
      content: [
        {
          id: '1',
          value: 'Nabiał',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'Mleko',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '3',
          value: 'Ser',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '4',
          value: 'Kawa',
          checked: false,
          depth: 0,
          parentId: null,
        },
      ],
    },
    {
      id: '2',
      title: 'Chemia',
      createdAt: new Date().toISOString(),
      content: [
        {
          id: '1',
          value: 'Płyn do podłóg',
          checked: true,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'Ręcznik papierowy',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '3',
          value: 'Płyn do szyb',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '4',
          value: 'Zmywaczki',
          checked: true,
          depth: 0,
          parentId: null,
        },
      ],
    },
  ],
  en: [
    {
      id: '0',
      title: 'Groceries',
      createdAt: new Date().toISOString(),
      content: [
        {
          id: '1',
          value: 'Dairy',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'Milk',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '3',
          value: 'Cheese',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '4',
          value: 'Coffee',
          checked: false,
          depth: 0,
          parentId: null,
        },
      ],
    },
    {
      id: '2',
      title: 'Cleaning',
      createdAt: new Date().toISOString(),
      content: [
        {
          id: '1',
          value: 'Floor cleaner',
          checked: true,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'Paper towels',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '3',
          value: 'Window cleaner',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '4',
          value: 'Sponges',
          checked: true,
          depth: 0,
          parentId: null,
        },
      ],
    },
  ],
};
