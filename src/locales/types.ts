export type Labels = {
  header: HeaderLabels;
  card: {
    header: CardHeaderLabels;
    listItem: ListItemLabels;
    menuPopover: MenuPopoverLabels;
  };
  emptyBoard: EmptyBoardLabels;
};

export type HeaderLabels = {
  title: string;
  syncStatus: SyncStatusLabels;
  offlineMessage: OfflineLabels;
  settings: SettingsLabels;
};

export type OfflineLabels = {
  label: string;
  change: {
    one?: string;
    few?: string;
    many?: string;
    other?: string;
  };
};

export type SyncStatusLabels = {
  synced: string;
  syncing: string;
  failed: string;
};

export type CardHeaderLabels = {
  titlePlaceholder: string;
  emptyTitle: string;
};

export type ListItemLabels = {
  textAreaPlaceholder: string;
  checkboxAria: string;
  ariaUndefinedItem: string;
  deleteButtonAria: string;
  item: string;
  buttons: ListItemButtonsLabels;
};

export type ListItemButtonsLabels = {
  expandButton: {
    one: string;
    few?: string;
    many?: string;
    other?: string;
  };
  dragButton: string;
  addElementButton: string;
  removeItemButton: string;
};

export type MenuPopoverLabels = {
  closeMenuAriaButton: string;
  openMenuAriaButton: string;
  removeCard: string;
  addCoAuthor: string;
  copyCard: string;
  removeChecked: string;
};

type EmptyBoardLabels = {
  header: string;
  hint: string;
  ctaButton: string;
};

type SettingsLabels = {
  label: string;
  theme: {
    label: string;
    darkMode: string;
    lightMode: string;
  };
  lang: {
    label: string;
    en: string;
    pl: string;
  };
};
