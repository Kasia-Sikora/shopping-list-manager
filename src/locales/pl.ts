import type { Labels } from './types';

const pl: Labels = {
  header: {
    title: 'Listy zakupów',
    syncStatus: {
      synced: 'Zapisano',
      syncing: 'Synchronizuję...',
      pending: 'w kolejce',
      failed: 'nie zsynchronizowano — ponów',
    },
    offlineMessage: 'Offline - zmiany zapiszą się po ponownym połączeniu',
    darkMode: 'tryb nocny',
    lightMode: 'tryb dzienny',
  },
  card: {
    header: {
      titlePlaceholder: 'Tytuł...',
      emptyTitle: 'Bez tytułu',
    },
    listItem: {
      textAreaPlaceholder: 'Utwórz element listy...',
      checkboxAria: 'Ukończono:',
      ariaUndefinedItem: 'brak nazwy',
      deleteButtonAria: 'Usuń:',
      item: 'element',
      buttons: {
        expandButton: {
          one: 'ukończony element',
          few: 'ukończone elementy',
          many: 'ukończonych elementów',
        },
        dragButton: 'Przeciągnij by przenieść:',
        addElementButton: 'Dodaj element',
        removeItemButton: 'Usuń element listy',
      },
    },
    menuPopover: {
      closeMenuAriaButton: 'zamknij menu',
      openMenuAriaButton: 'otwórz menu',
      removeCard: 'Usuń kartę',
      addCoAuthor: 'Dodaj współautora',
      copyCard: 'Utwórz kopię',
      removeChecked: 'Usuń zaznaczone elementy',
    },
  },
  emptyBoard: {
    header: 'Nie masz jeszcze żadnych list',
    hint: 'Utwórz swoją pierwszą listę powyżej',
    ctaButton: 'Załaduj przykładowe dane',
  },
};

export default pl;
