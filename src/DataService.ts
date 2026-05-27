import { useFieldArray, useForm } from 'react-hook-form';
import { generateId, splitItemsToDoneAndUndoneLists } from './components/utils';
import type { List, ListItem } from './interfaces';
import { useStore } from './stores/store';

export const dataService = (item?: List) => {
  const { updateItem, addItem, checkItem } = useStore();

  const defaultValues: List = item
    ? item
    : {
        id: '',
        title: '',
        content: [{ listItemId: generateId(), value: '', checked: false } as ListItem],
      };

  const { register, getValues, control, reset } = useForm<List>({
    defaultValues,
  });

  const { fields, insert, update, remove } = useFieldArray({
    control,
    name: 'content',
  });

  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(fields)

  const handleSubmit = () => {
    const data = getValues();
    if (!data.title && data.content.every((el: ListItem) => !el.value)) {
      reset();
    } else {
      data.content = data.content.filter((el: ListItem) => el.value);
      if (item) {
        updateItem({ ...item, ...data });
        reset({ content: data.content, title: data.title });
      } else {
        addItem({ id: generateId(), title: data.title, content: data.content });
        reset();
      }
    }
  };

  const handleCheck = (index: number, itemId: string, checked: boolean) => {
    const { listItemId, value } = getValues(`content.${index}`);
    update(index, { listItemId, checked: checked, value });
    checkItem(itemId, listItemId, checked);
  };

  const handleCreateNewLine = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let indexOfActiveEl: number;
    const target = e.target instanceof HTMLTextAreaElement ? e.target.name : undefined;
    if (e.nativeEvent instanceof KeyboardEvent && target) {
      indexOfActiveEl = parseInt(target.split('.')[1] ?? '-1');
    } else {
      indexOfActiveEl = fields.length;
    }
    const newItem = { listItemId: generateId(), value: '', checked: false } as ListItem;
    insert(indexOfActiveEl + 1, newItem as ListItem, { focusName: `content.${indexOfActiveEl + 1}.value` });
  };

  return {
    devidedItems: {uncheckedItems, checkedItems},
    register,
    remove,
    handleSubmit,
    handleCheck,
    handleCreateNewLine,
  };
};