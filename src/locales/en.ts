import type { Labels } from './types';

const en: Labels = {
  header: {
    title: 'Shopping lists',
    syncStatus: {
      synced: 'Saved',
      syncing: 'Saving...',
      failed: 'sync failed - retry',
    },
    offlineMessage: {
      label: 'Working Offline - {count} {change} will sync when back online',
      change: {
        one: 'change',
        other: 'changes',
      },
    },
    settings: {
      label: 'Settings',
      theme: {
        label: 'Theme',
        darkMode: 'dark mode',
        lightMode: 'light mode',
      },
      lang: {
        label: 'Language',
        en: 'EN',
        pl: 'PL',
      },
    },
  },
  card: {
    header: {
      titlePlaceholder: 'Title...',
      emptyTitle: 'Untitled',
    },
    listItem: {
      textAreaPlaceholder: 'Create a list item...',
      checkboxAria: 'Done:',
      ariaUndefinedItem: 'unnamed item',
      deleteButtonAria: 'Delete:',
      item: 'item',
      buttons: {
        expandButton: {
          one: 'done item',
          other: 'done items',
        },
        dragButton: 'Drag to reorder:',
        addElementButton: 'Add list item',
        removeItemButton: 'Remove list item',
      },
    },
    menuPopover: {
      closeMenuAriaButton: 'close menu',
      openMenuAriaButton: 'open menu',
      removeCard: 'Delete card',
      addCoAuthor: 'Add co-author',
      copyCard: 'Copy card',
      removeChecked: 'Remove done items',
    },
  },
  emptyBoard: {
    header: "You don't have any lists yet",
    hint: 'Create your first list above',
    ctaButton: 'Load sample data',
  },
};

export default en;
