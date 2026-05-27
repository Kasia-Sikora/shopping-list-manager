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
  index: number;
}

export type FieldListItem = FieldIndex & ListItem

