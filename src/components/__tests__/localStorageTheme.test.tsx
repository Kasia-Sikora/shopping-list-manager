import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ThemeToggle from '../atoms/ThemeToggle';
import { LOCAL_STORAGE_THEME_KEY } from '../../consts';
import { useThemeStore } from '../../stores/store';

describe('ThemeToggle component', () => {
  const user = userEvent.setup();


  beforeEach(() => {
    localStorage.clear();
  });

  it('set localStorage theme on mount when theme is not present', () => {
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toBeNull();
    expect(document.documentElement).not.toHaveAttribute('data-theme')
    render(<ThemeToggle />);

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'light' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'theme-light')
  });

  it('saves dark theme in localStorage when machMefia returns true', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => ({
        matches: true,
      })),
    })

    localStorage.getItem(LOCAL_STORAGE_THEME_KEY);

    render(<ThemeToggle />);

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'dark' }));
  });

  it('saves light theme in localStorage when machMefia returns false', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => ({
        matches: false,
      })),
    })

    localStorage.getItem(LOCAL_STORAGE_THEME_KEY);

    render(<ThemeToggle />);

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'light' }));
  });

  it('saves theme to localStorage when toggled', async () => {
    render(<ThemeToggle />);
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'light' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'theme-light')

    await user.click(getThemeToggle());

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'theme-dark')

  });

  it('does not write an empty "theme-" to <html> while the store theme is still unresolved (the guard)', () => {
    document.documentElement.dataset.theme = 'theme-dark';
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify({ state: { theme: 'dark' }, version: 0 }));

    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'theme-dark');
  });

  it('applies a persisted theme to <html> without falling back to matchMedia (return visit)', () => {
    localStorage.setItem(
      LOCAL_STORAGE_THEME_KEY,
      JSON.stringify({ state: { theme: 'dark' }, version: 0 }),
    );
    useThemeStore.setState({ theme: 'dark' });
    const matchMediaSpy = vi.fn().mockImplementation(() => ({ matches: false }));
    Object.defineProperty(window, 'matchMedia', { value: matchMediaSpy, configurable: true });

    render(<ThemeToggle />);

    expect(matchMediaSpy).not.toHaveBeenCalled();
    expect(document.documentElement).toHaveAttribute('data-theme', 'theme-dark');
  });
})

const getThemeToggle = () => screen.getByTestId('theme-toggle')