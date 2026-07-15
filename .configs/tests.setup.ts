import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import * as db from '../src/services/indexedDB';
import { appGuards } from '../src/consts';

beforeEach(async () => {
  // eslint-disable-next-line no-global-assign
  indexedDB = new IDBFactory();
  db._resetDbForTests(); // drop the app's cached connection
  appGuards._resetForTests();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals()
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

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

vi.mock('zustand');

vi.mock(import('../src/services/apiService'));
vi.mock(import('../src/services/syncEngine'));