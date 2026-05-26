import { useRef, useState, type MouseEventHandler } from 'react';
import type { List } from '../interfaces';
import ListComponent from './CardContent';
// import tick from '../assets/tick.svg';
import EditIndicator from './atoms/EditIndicator';
import MenuButton from './atoms/MenuButton';

const EditCard = ({ editedItem }: { editedItem: List }) => {
  const [edit, setEdit] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit: MouseEventHandler<HTMLDivElement> = () => {
    if (!edit) {
      setEdit(true);
      // const activeElement = document.activeElement as HTMLElement;
      // const textareaElement = cardRef.current?.querySelectorAll(`textarea`)?.[1] as HTMLTextAreaElement;
      // if (textareaElement && activeElement.tagName !== 'INPUT' && !textareaElement.hasAttribute('focus')) {
      //   textareaElement.focus();
    }
  };

  return (
    <div
      ref={cardRef}
      draggable={true}
      onClick={handleEdit}
      className="border-t border-mist-300 shadow-md shadow-mist-400 flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative pb-8 "
      data-id={`card-${editedItem.id}`}
      data-testid={`card-${editedItem.id}`}
    >
      <EditIndicator id={editedItem.id} isEdit={edit}/>
      <ListComponent cardEdit={edit} setEditCard={setEdit} item={editedItem} cardRef={cardRef} />
      <MenuButton/>
    </div >
  );
};

export default EditCard;
