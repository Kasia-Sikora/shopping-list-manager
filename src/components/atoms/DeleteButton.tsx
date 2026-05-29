import type { MouseEvent, KeyboardEvent } from 'react';

type DeleteButton = {
  handleRemoveItem: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
}

const DeleteButton = ({ handleRemoveItem }: DeleteButton) => {
  return (
    <button
      onClick={handleRemoveItem}
      className='shrink-0 justify-self-end rounded-full bg-transparent focus:bg-accent/50 hover:bg-accent/50 size-6 after:font-bold after:content-["\00d7"] after:text-mist-900'
      aria-label="Delete"
    />
  )
}

export default DeleteButton