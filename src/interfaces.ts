export type Note = {
  id: string;
  type: 'note';
  title: string;
  content: string;
};

export type List = {
  id: string;
  type: 'list';
  title: string;
  content: ListItem[];
};

export type ListItem = {
  listItemId: string;
  value?: string;
  checked?: boolean;
};
