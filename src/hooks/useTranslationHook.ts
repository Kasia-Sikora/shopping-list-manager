import en from '../locales/en';
import pl from '../locales/pl';
import type { Labels } from '../locales/types';
import { useLocaleStore, type LocaleTypes } from '../stores/store';

const messages = {
  en,
  pl,
};

type Translation = (key: DotPaths<Labels>, values?: ObjectToInterpolate) => string;

export type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends object ? `${K}.${DotPaths<T[K]>}` : K;
}[keyof T & string];

type ObjectToInterpolate = {
  [key: string]: string;
};

export const useTranslation = (): Translation => {
  const locale: LocaleTypes | undefined = useLocaleStore((s) => s.lang);
  const t = (key: DotPaths<Labels>, values?: ObjectToInterpolate): string => {
    const text = key
      .split('.')
      .reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], messages[locale ?? 'en']);
    if (typeof text !== 'string') {
      console.error(`Missing locale key: `, key);
      return key;
    }
    if (values) { 
      return text.replace(/\{(\w+)\}/g, (_, token) => values[token] ?? `{${token}}`)
    }
    return text;
  };
  return t;
};
