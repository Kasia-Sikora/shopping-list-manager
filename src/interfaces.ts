export type List = {
  id: string;
  title: string;
  content: ListItem[];
};

export type ListItem = {
  listItemId: string;
  value: string;
  checked: boolean;
  depth: number
};

type ArrayFieldIndex = {
  globalArrayIndex: number;
  id: string
};

export type FieldListItem = ArrayFieldIndex & ListItem;

export type PersistedShoppingListStore = {
  state: {
    items: List[]
  }
}