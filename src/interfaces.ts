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
    items: List[];
  };
};
