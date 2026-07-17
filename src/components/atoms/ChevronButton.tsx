import ChevronDown from '../../assets/chevronDown.svg?react';

import { useMemo, type MouseEventHandler } from 'react';
import { useTranslation } from '../../hooks/useTranslationHook';
import { useLocaleStore } from '../../stores/store';

type ChevronButton = {
  toggle: MouseEventHandler<HTMLButtonElement>;
  contentExpanded: boolean;
  quantity: number;
};

type LocaleKeys = "one" | "few" | "many" | "other" 

export const ChevronButton = ({ toggle, contentExpanded, quantity }: ChevronButton) => {
  const t = useTranslation()
  const { lang } = useLocaleStore()
  const localeRules = useMemo(() => new Intl.PluralRules(lang), [lang])

  const key = localeRules.select(quantity) as LocaleKeys

  return (
    <button
      onClick={toggle}
      className="flex flex-row items-center text-muted gap-1"
      aria-expanded={contentExpanded}
    >
      <ChevronDown className={`size-6 transition-all duration-300 ${contentExpanded ? 'rotate-x-180' : ''}`} />
      <p className="py-2 text-sm font-medium border-0">{quantity} {t(`card.listItem.buttons.expandButton.${key}`)}</p>
    </button>
  );
};
