export type List = {
  id: string;
  title: string;
  content: ListItem[];
};

export type ListItem = {
  listItemId: string;
  value?: string;
  checked?: boolean;
};

type FieldIndex = {
  fieldArrayId: number;
};

export type FieldListItem = FieldIndex & ListItem;

export type PersistedShoppingListStore = {
  state: {
    items: List[]
  }
}