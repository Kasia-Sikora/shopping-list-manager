import type { FC, MouseEventHandler } from 'react';

type ChevronButton = {
  toggle: MouseEventHandler<HTMLButtonElement>;
  contentExpanded: boolean;
  quantity: number;
};

export const ChevronButton: FC<ChevronButton> = ({ toggle, contentExpanded, quantity }) => {
  return (
    <button
      onClick={toggle}
      className="flex flex-row items-center"
      aria-expanded={`${contentExpanded ? 'true' : 'false'}`}
    >
      <div
        className={`bg-primary transition-all duration-300 chevron ${contentExpanded ? 'chevron__up' : 'chevron__down'}`}
      />
      <h6 className="p-2 text-l border-0 text-gray-500">{quantity} ukończonych elementów</h6>
    </button>
  );
};
