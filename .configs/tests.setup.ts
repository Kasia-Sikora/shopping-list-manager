import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { useStore } from '../src/store';
const initialState = useStore.getState();

afterEach(() => {
  cleanup();
});

afterAll(() => {
  useStore.setState(initialState);
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('zustand');
