import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { LOCAL_STORAGE_STORE_KEY } from '../../consts';
import { DEFAULT_VALUES } from '../../stores/store';
import { elements } from './utils';
import App from '../../App';
import { sortCards } from '../utils';

const { getListItemTextarea } = elements

describe('LocalStorage with Data', () => {
  let confirmSpy = vi.fn()

  beforeEach(() => {
    localStorage.clear();
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockReset();
    localStorage.clear()
  });

  it('should load default data when user consents', async () => {
    const dataToLoad = JSON.stringify(sortCards(DEFAULT_VALUES))

    render(<App />)
    await waitFor(() => expect(localStorage.getItem(LOCAL_STORAGE_STORE_KEY)).not.toBeNull())

    await waitFor(() => expect(localStorage.getItem(LOCAL_STORAGE_STORE_KEY)).toContain(dataToLoad))
  })

  it("should not load default data when user do not consent", () => {
    confirmSpy.mockReturnValue(() => false);
    render(<App />)

    expect(localStorage.getItem(LOCAL_STORAGE_STORE_KEY)).toBeNull()
  })

  it('should sort list from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_STORE_KEY, JSON.stringify(DEFAULT_VALUES))
    const defaultValuesSecondCardValues = DEFAULT_VALUES.state.items[1].content.map(item => item.value)
    expect(defaultValuesSecondCardValues).toEqual(['first el in Second List', 'second el in Second List', 'third el in Second List', 'fourth el in Second List'])

    render(<App />)

    expect(getListValues('2')).toEqual(['second el in Second List', 'third el in Second List', 'first el in Second List', 'fourth el in Second List'])
  })
})

const getListValues = (id: string) => {
  const cardElements = getListItemTextarea(id)
  if (cardElements) {
    return cardElements.map(elem => elem.value)
  }
}