import { useRef, useState, type MouseEventHandler } from 'react';
import type { List } from '../interfaces';
import ListComponent from './ListComponent';
// import tick from '../assets/tick.svg';
import menu from '../assets/icons8-dots-30.png'

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

      <div data-testid={`card-${editedItem.id}-edit-indicator`} className={`transition-opacity duration-300 ${edit ? 'opacity-100' : 'opacity-0'}`} aria-hidden={`${edit ? "false": "true"}`}>
        <div className={`absolute -top-1 -left-2.5 size-8 rounded-full bg-accent `} />
        <div className={`absolute -top-2 -left-3.5 size-8 rounded-full border-3 border-mist-700 `} />
        <div className={`absolute -top-1 -left-1.5 size-8 `} />
        <div className={`tick absolute -top-0.5 -left-0.5 w-2 h-4 inset-shadow-[-3px_-3px_#394447] rotate-45 `} />
      </div>
      <ListComponent cardEdit={edit} setEditCard={setEdit} item={editedItem} cardRef={cardRef} />
      <button className='absolute bottom-1.5 right-1.5 rounded-full bg-transparent hover:bg-white/75  size-7' onClick={() => console.log('open menu')}>
        <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-accent size-6' />
        <img src={menu} alt="menu button" className='size-7 absolute bottom-0 right-0 border-3 hover:bg-white/75 border-mist-700 rounded-full' />
      </button>
    </div >
  );
};

export default EditCard;
