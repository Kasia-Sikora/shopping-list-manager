import type { MouseEvent, KeyboardEvent } from 'react';

type DeleteButton = {
  handleRemoveItem: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
  indent?: boolean
}

const DeleteButton = ({ handleRemoveItem }: DeleteButton) => {
  return (
    <button
      onClick={handleRemoveItem}
      className={`absolute right-0 top-2 shrink-0 justify-self-end rounded-full bg-transparent text-mist-900 focus:bg-accent/50 hover:bg-accent/50 size-6 after:font-bold after:content-['×'] after:text-mist-900 opacity-0 group-hover:opacity-100 transition-opacity`}
      aria-label="Delete"
    />
  )
}

export default DeleteButton