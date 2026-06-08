import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ThemeToggle from '../atoms/ThemeToggle';
import { LOCAL_STORAGE_THEME_KEY } from '../../consts';

describe('ThemeToggle component', () => {
  const user = userEvent.setup();


  beforeEach(() => {
    localStorage.clear();
  });

  it('set localStorage theme on mount when theme is not present', () => {
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toBeNull();
    expect(document.body).not.toHaveAttribute('data-theme')
    render(<ThemeToggle />);

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'light' }));
    expect(document.body).toHaveAttribute('data-theme', 'theme-light')
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
    expect(document.body).toHaveAttribute('data-theme', 'theme-light')

    await user.click(getThemeToggle());

    expect(localStorage.getItem(LOCAL_STORAGE_THEME_KEY)).toContain(JSON.stringify({ theme: 'dark' }));
    expect(document.body).toHaveAttribute('data-theme', 'theme-dark')

  });
})

const getThemeToggle = () => screen.getByTestId('theme-toggle')