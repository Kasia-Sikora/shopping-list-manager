import { expect } from 'vitest';
import { render } from '@testing-library/react';
import { LOCAL_STORAGE_STORE_KEY } from '../../consts';
import { DEFAULT_VALUES } from '../../stores/store';
import { elements } from './testHelpers';
import App from '../../App';

const { getListItemTextarea } = elements

describe('LocalStorage without data', () => {
  let confirmSpy = vi.fn()

  beforeEach(() => {
    localStorage.clear();
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockReset();
    localStorage.clear()
  });

  it('should ask for loading default data if localStorage is empty', () => {
    render(<App />)

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(confirmSpy).toHaveBeenCalledWith('Załadować testowe dane?')
    confirmSpy.mockReturnValue(false)
  })

  it("should not load default data when user do not consent", () => {
    confirmSpy.mockReturnValue(() => false);
    render(<App />)

    expect(localStorage.getItem(LOCAL_STORAGE_STORE_KEY)).toBeNull()
  })

  it('should sort list from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_STORE_KEY, JSON.stringify(DEFAULT_VALUES))
    const defaultValuesSecondCardValues = DEFAULT_VALUES.state.lists[1].content.map(item => item.value)
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