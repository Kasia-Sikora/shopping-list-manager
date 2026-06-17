export type List = {
  id: string;
  title: string;
  content: ListItem[];
};

export type ListItem = {
  id: string;
  value: string;
  checked: boolean;
  depth: number;
};

export type StoreListItem = ListItem & { storeArrayIndex: number };

export type PersistedShoppingListStore = {
  state: {
    lists: List[];
  };
};


export type SetLocalDataActions = {
  update: (updates: Partial<List>) => void;
  sync: (dataToSync: List) => void;
  save: (dataToSave: List) => void;
  resetLocalState:() => void
}