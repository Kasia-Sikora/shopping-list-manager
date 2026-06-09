import type { MouseEvent, KeyboardEvent } from 'react';

type DeleteButton = {
  handleRemoveItem: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
  indent?: boolean
}

const DeleteButton = ({ handleRemoveItem, indent }: DeleteButton) => {
  return (
    <button
      onClick={handleRemoveItem}
      className={`${!indent ? 'absolute -right-6 top-1' : '' } shrink-0 justify-self-end rounded-full bg-transparent focus:bg-accent/50 hover:bg-accent/50 size-6 after:font-bold after:content-["\x00d7"] after:text-mist-900`}
      aria-label="Delete"
    />
  )
}

export default DeleteButton