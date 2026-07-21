import { renderHook } from '@testing-library/react';
import { useTranslation, type DotPaths } from '../useTranslationHook';
import type { Labels } from '../../locales/types';
import { useLocaleStore } from '../../stores/store';

describe('useTranslationHook', () => {
  const { result } = renderHook(() => useTranslation());
  const t = result.current;

  it('should translate existing key', () => {
    expect(t('card.header.emptyTitle')).toEqual('Untitled');
  });

  it('should return key for non existing key and log error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(t('card.header.invalidKey' as DotPaths<Labels>)).toEqual('card.header.invalidKey');
    expect(consoleSpy).toHaveBeenCalledWith('Missing locale key: ', 'card.header.invalidKey');
    consoleSpy.mockRestore();
  });

  it('should return interpolate string when value is provided', () => {
    useLocaleStore.getState().setLang('en');
    expect(t('header.offlineMessage.label', { count: `some count example`, change: 'some change example' })).toEqual(
      'Working Offline - some count example some change example will sync when back online'
    );
  });

  it('should return interpolate string with proper keys in brackets when value with invalid key is provided', () => {
    useLocaleStore.getState().setLang('en');
    expect(
      t('header.offlineMessage.label', { invalidCount: `some count example`, invalidChange: 'some change example' })
    ).toEqual('Working Offline - {count} {change} will sync when back online');
  });
});
