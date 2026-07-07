import type { MouseEvent, KeyboardEvent } from 'react';

type DeleteButton = {
  ariaLabel: string;
  handleRemoveItem: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
}

const DeleteButton = ({ ariaLabel, handleRemoveItem }: DeleteButton) => {
  return (
    <button
      aria-label={ariaLabel}
      onClick={handleRemoveItem}
      className={`absolute right-0 top-2 shrink-0 justify-self-end rounded-full bg-transparent text-mist-900 focus:bg-accent/50 hover:bg-accent/50 size-6 after:font-bold after:content-['×'] after:text-mist-900 opacity-0 group-hover:opacity-100 transition-opacity`}
      data-testid="delete-item-button"
    />
  )
}

export default DeleteButton