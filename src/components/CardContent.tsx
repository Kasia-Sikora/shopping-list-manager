import { useEffect, type FC } from 'react';
// import { DevTool } from "@hookform/devtools";
import { useFieldArray, useForm } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';
import { useStore } from '../store';
import FormComponent from './FormComponent';
import PreviewComponent from './PreviewComponent';

interface ListComponentProps {
  cardEdit: boolean;
  setEditCard: (edit: boolean) => void;
  item?: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

function generateId() {
  return crypto.randomUUID();
}

const ListComponent: FC<ListComponentProps> = ({ cardEdit, setEditCard, item, cardRef }) => {
  const { updateItem, addItem, checkItem } = useStore();

  const defaultValues: List = item ? item : {
    id: '',
    type: 'list',
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
        const data = getValues();
        if (!data.title && data.content.every(el => !el.value)) {
          reset()
          setEditCard(false);
        } else {
          data.content = data.content.filter(el => el.value)
          if (item) {
            updateItem({ ...item, ...data });
            reset({ content: data.content, title: data.title })
          } else {
            addItem({ id: generateId(), type: 'list', title: data.title, content: data.content });
            reset()
          }
          setEditCard(false);
        }
      }
    };

    if (cardEdit) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    addItem,
    cardEdit,
    cardRef,
    defaultValues.content,
    defaultValues.title,
    getValues,
    item,
    reset,
    setEditCard,
    updateItem,
  ]);

  const handleCheck = (index: number, itemId: string, checked: boolean) => {
    const { listItemId, value } = getValues(`content.${index}`)
    update(index, { listItemId, checked: checked, value })
    checkItem(itemId, listItemId, checked);
  };

  const handleNewLine = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return
    if (e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const data = getValues();
      if (!data.title && data.content.every(el => !el.value)) {
        reset()
        setEditCard(false);
      } else {
        data.content = data.content.filter(el => el.value)
        if (item) {
          updateItem({ ...data });
          reset({ content: data.content, title: data.title })
        } else {
          addItem({ id: generateId(), type: 'list', title: data.title, content: data.content });
          reset()
        }
        setEditCard(false);
      }
    } else if (e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter' || e.nativeEvent instanceof PointerEvent) {
      e.preventDefault();
      let indexOfActiveEl: number;
      if (e.nativeEvent instanceof KeyboardEvent) {
        const activeEl = document.activeElement?.parentElement?.querySelector('[name]');
        indexOfActiveEl = parseInt(activeEl?.getAttribute('name')?.split('.')[1] ?? '-1');
      }
      else {
        indexOfActiveEl = fields.length
      }
      const newItem = { listItemId: generateId(), value: '', checked: false } as ListItem;
      insert(indexOfActiveEl + 1, newItem as ListItem, { focusName: `content.${indexOfActiveEl + 1}.value` });
    }
  };


  return (
    <>
      {/* <DevTool control={control} /> */}
      {(!item || cardEdit) ? (
        <FormComponent cardEdit={cardEdit} fields={fields} item={item} handleRemoveFieldItem={remove} handleNewLine={handleNewLine} register={register} handleCheck={handleCheck} />
      ) : (
          <PreviewComponent cardEdit={cardEdit} item={item} handleCheck={handleCheck} handleNewLine={handleNewLine}  handleRemoveFieldItem={remove} />
      )}
    </>
  )
}


export default ListComponent;
