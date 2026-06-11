import { useCallback, useEffect, useState } from 'react';
import type { List, ListItem } from '../interfaces';
import { generateId, handleKeyDown, splitItemsToDoneAndUndoneLists } from '../utils/utils';
import { ChevronButton } from './atoms/ChevronButton';
import { useStore } from '../stores/store';
import AddListItemButton from './atoms/AddListItemButton';
import ListOfItems from './ListOfItems';
import MenuButton from './atoms/MenuButton';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';

interface CardContentProps {
  cardEdit: boolean;
  setEditCard: (edit: boolean) => void;
  editedItem?: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardDataId: string;
  cardIndex: number
}

const CardContent = ({ cardEdit, setEditCard, editedItem, cardRef, cardDataId, cardIndex }: CardContentProps) => {
  const { updateItem, addItem, removeCard } = useStore();

  const defaultValues: List = editedItem
    ? editedItem
    : {
      id: '',
      title: '',
      content: [{ listItemId: generateId(), value: '', checked: false, depth: 0 } as ListItem],
    };

  const methods = useForm<List>({ defaultValues });
  const { fields, insert, remove } = useFieldArray({
    control: methods.control,
    name: "content"
  });

  const watchedContent = useWatch({
    control: methods.control,
    name: "content",
  });

  const fieldsWithValues = fields.map((field, index) => ({
    ...field,
    ...(watchedContent ? watchedContent[index] : {})
  }));

  const { getValues, reset, register } = methods;
  const [openMenu, setOpenMenu] = useState<boolean>(false)

  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(fieldsWithValues);
  const [contentExpanded, setContentExpanded] = useState<boolean>(true);
  const doneTaskQuantity = checkedItems.length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setContentExpanded((expanded) => !expanded);
  };

  useEffect(() => {
    if (cardEdit) {
      const listItems = document.querySelectorAll(
        `[data-testid='${cardDataId}'] textarea`
      ) as NodeListOf<HTMLTextAreaElement>;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditCard(false)
          const activeEl = document.activeElement
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
        }
        if (!e || !(e.target as HTMLTextAreaElement).name) return;
        handleKeyDown(e, Array.from(listItems));
      };

      listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', onKeyDown));
      return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', onKeyDown));
    }
  }, [cardDataId, cardEdit, fields, setEditCard]);

  const handleSubmit = useCallback(() => {
    const data = getValues();
    data.content = data.content?.filter((el: ListItem) => el.value);
    if (data.title || data.content.length) {
      if (editedItem) {
        updateItem({ ...editedItem, ...data });
        reset({ content: data.content, title: data.title });
      } else {
        addItem({ id: generateId(), title: data.title, content: data.content });
        reset();
      }
    } else {
      if (editedItem) {
        removeCard(editedItem.id)
      }
      reset();
    }
  }, [addItem, editedItem, getValues, reset, updateItem, removeCard]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardEdit) {
        if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
          handleSubmit();
          setEditCard(false);
        }
      };
      const dropdownCardEl = document.querySelector(`[data-id='card-${editedItem?.id}'] #dropdown`)
      if (dropdownCardEl && !dropdownCardEl.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cardRef, setEditCard, cardEdit, handleSubmit, setOpenMenu, editedItem?.id]);

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
    <FormProvider {...methods}>
      <form onKeyDown={handleFormEvents}>
        <div className="flex flex-col align-baseline gap-2">
          {!cardEdit && editedItem && (
            <h2 className="p-2 text-2xl wrap-break-word font-bold border-0 text-secondary">{editedItem.title}</h2>
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
              cardIndex={cardIndex}
              remove={remove}
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
                  cardIndex={cardIndex}
                  remove={remove}
                />
              )}
            </>
          )}
        </div>
      </form>
      {editedItem && <MenuButton cardId={editedItem.id} openMenu={openMenu} setOpenMenu={setOpenMenu} fields={checkedItems} remove={remove} />}
    </FormProvider>
  );
};

export default CardContent;
