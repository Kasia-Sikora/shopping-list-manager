import type { Labels } from './types';

const pl: Labels = {
  header: {
    title: 'Listy zakupów',
    syncStatus: {
      synced: 'Zapisano',
      syncing: 'Zapisuję...',
      failed: 'nie zsynchronizowano — ponów',
    },
    offlineMessage: {
      label: 'Offline - {count} {change} się po ponownym połączeniu',
      change: {
        one: 'zmiana zapisze',
        few: 'zmiany zapiszą',
        many: 'zmian zapisze',
      },
    },
    settings: {
      label: 'Ustawienia',
      theme: {
        label: 'Motyw',
        darkMode: 'tryb nocny',
        lightMode: 'tryb dzienny',
      },
      lang: {
        label: 'Język',
        en: 'EN',
        pl: 'PL',
      },
    },
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
