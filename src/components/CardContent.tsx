import { useCallback, useEffect, useState } from 'react';
import type { List, ListItem } from '../interfaces';
import { generateId, handleKeyDown, splitItemsToDoneAndUndoneLists } from './utils';
import { ChevronButton } from './atoms/ChevronButton';
import { useStore } from '../stores/store';
import { useFieldArray, useForm } from 'react-hook-form';
import AddListItemButton from './atoms/AddListItemButton';
import ListOfItems from './ListOfItems';

interface CardContentProps {
  cardEdit: boolean;
  setEditCard: (edit: boolean) => void;
  editedItem?: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardDataId: string;
}

const CardContent = ({ cardEdit, setEditCard, editedItem, cardRef, cardDataId }: CardContentProps) => {
  const { updateItem, addItem, checkItem } = useStore();

  const defaultValues: List = editedItem
    ? editedItem
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

  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(fields);
  const [contentExpanded, setContentExpanded] = useState<boolean>(true);
  const doneTaskQuantity = checkedItems.length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setContentExpanded((expanded) => !expanded);
  };

  useEffect(() => {
    if (cardEdit) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditCard(false)
          const activeEl = document.activeElement
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
        }
        if (!e || !(e.target as HTMLTextAreaElement).name) return;
        handleKeyDown(e, cardDataId);
      };

      const listItems = document.querySelectorAll(
        `[data-testid='${cardDataId}'] textarea`
      ) as NodeListOf<HTMLTextAreaElement>;
      listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', onKeyDown));
      return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', onKeyDown));
    }
  }, [cardDataId, cardEdit, fields, setEditCard]);

  const handleSubmit = useCallback(() => {
    const data = getValues();
    if (!data.title && data.content.every((el: ListItem) => !el.value)) {
      reset();
    } else {
      data.content = data.content.filter((el: ListItem) => el.value);
      if (editedItem) {
        updateItem({ ...editedItem, ...data });
        reset({ content: data.content, title: data.title });
      } else {
        addItem({ id: generateId(), title: data.title, content: data.content });
        reset();
      }
    }
  }, [addItem, editedItem, getValues, reset, updateItem]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
        handleSubmit();
        setEditCard(false);
      }
    };

    if (cardEdit) document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cardRef, setEditCard, cardEdit, handleSubmit]);

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

  //TODO fix navigating trough checked+unchecked lists
  const handleFormEvents = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return;
    if (cardEdit && cardRef.current) {
      const isETypeOfKeyboardEvent = e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter';
      if (isETypeOfKeyboardEvent && e.shiftKey) {
        e.preventDefault();
        handleSubmit();
        setEditCard(false);
      } else if (isETypeOfKeyboardEvent || e.nativeEvent instanceof PointerEvent) {
        e.preventDefault();
        handleCreateNewLine(e);
      }
    }
  };

  return (
    <form onKeyDown={handleFormEvents}>
      <div className="flex flex-col align-baseline gap-2">
        {!cardEdit && editedItem && (
          <h2 className="p-2 text-2xl font-bold border-0 text-secondary">{editedItem.title}</h2>
        )}
        {cardEdit && (
          <textarea
            className="p-2 text-2xl font-bold border-0 text-secondary"
            {...register('title')}
            placeholder="Tytuł..."
          />
        )}
        {uncheckedItems.length > 0 && (
          <ListOfItems
            listId={editedItem?.id}
            list={uncheckedItems}
            checkedItems={false}
            register={register}
            remove={remove}
            handleCheck={editedItem && handleCheck}
          />
        )}
        {(cardEdit || editedItem) && <AddListItemButton handleCreateNewLine={handleCreateNewLine} />}
        {doneTaskQuantity > 0 && (
          <>
            <div className="border-t border-primary w-full" />
            <ChevronButton toggle={toggleExpand} contentExpanded={contentExpanded} quantity={doneTaskQuantity} />
            {contentExpanded && (
              <ListOfItems
                listId={editedItem?.id}
                list={checkedItems}
                checkedItems={true}
                register={register}
                remove={remove}
                handleCheck={editedItem && handleCheck}
              />
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default CardContent;
