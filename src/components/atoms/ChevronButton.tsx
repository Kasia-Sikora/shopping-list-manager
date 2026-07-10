import ChevronDown from '../../assets/chevronDown.svg?react';

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
      className="flex flex-row items-center text-muted gap-1"
      aria-expanded={`${contentExpanded ? 'true' : 'false'}`}
    >
      <ChevronDown className={`size-6 transition-all duration-300 ${contentExpanded? 'rotate-x-180': ''}`}/>
      <p className="py-2 text-sm font-medium border-0">{quantity} ukończonych elementów</p>
    </button>
  );
};
