import type { MouseEvent, KeyboardEvent } from 'react';
import DeleteIcon from '../../assets/delete.svg?react';

type DeleteButton = {
  ariaLabel: string;
  handleRemoveItem: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
}

const DeleteButton = ({ ariaLabel, handleRemoveItem }: DeleteButton) => {
  return (
    <button
      aria-label={ariaLabel}
      onClick={handleRemoveItem}
      className={`absolute right-0 top-2 shrink-0 justify-self-end rounded-full bg-transparent text-primary focus:bg-accent/50 hover:bg-accent/50 size-6 opacity-0 group-hover:opacity-100 transition-opacity`}
      data-testid="delete-item-button"
    >
      <DeleteIcon className='absolute left-1.5 top-1.5'/>
    </button>
  )
}

export default DeleteButton