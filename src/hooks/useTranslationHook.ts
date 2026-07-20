import en from '../locales/en';
import pl from '../locales/pl';
import type { Labels } from '../locales/types';
import { useLocaleStore, type LocaleTypes } from '../stores/store';

const messages = {
  en,
  pl,
};

type Translation = (key: DotPaths<Labels>) => string

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${DotPaths<T[K]>}`
    : K
}[keyof T & string]

export const useTranslation = (): Translation => {
  const locale: LocaleTypes | undefined = useLocaleStore((s) => s.lang);
  const t = (key: DotPaths<Labels>): string => {
    const text = key.split('.').reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], messages[locale ?? 'en']);
    if (typeof text !== 'string') {
      console.error(`Missing locale key: `, key);
      return key
    }
    return text;
  };
  return t;
};
