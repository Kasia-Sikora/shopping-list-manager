import type { MouseEventHandler } from 'react';

type ChevronButton = {
  toggle: MouseEventHandler<HTMLButtonElement>;
  contentExpanded: boolean;
  quantity: number;
};

export const ChevronButton = ({ toggle, contentExpanded, quantity }: ChevronButton) => {
  return (
    <button
      onClick={toggle}
      className="flex flex-row items-center"
      aria-expanded={`${contentExpanded ? 'true' : 'false'}`}
    >
      <div
        className={`bg-primary transition-all duration-300 chevron ${contentExpanded ? 'chevron__up' : 'chevron__down'}`}
      />
      <p className="p-2 text-l border-0 text-gray-700">{quantity} ukończonych elementów</p>
    </button>
  );
};
