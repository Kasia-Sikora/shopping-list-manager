import type { ListItem, PersistedShoppingListStore } from '../../interfaces';
import { handleKeyDown, sortCards, sortList } from '../../utils/utils';

vi.mock('../../utils/utils.ts', { spy: true })
describe('edge cases utils tests', () => {

  describe('sort list tests', () => {
    it('should return empty array when no list provided', () => {
      const nullObject = null as unknown as ListItem[]
      expect(sortList(nullObject)).toEqual([])
    })
  })

  describe('sortCards', () => {
    it('should return empty array if items are undefinedd', () => {
      const exampleStore = { state: undefined } as unknown as PersistedShoppingListStore
      expect(sortCards(exampleStore)).toEqual([])
    })

    it('should return empty array if items are empty', () => {
      const exampleStore = { state: { items: [] } }
      expect(sortCards(exampleStore)).toEqual([])
    })
  })

  describe('handleKeyDown tests', () => {
    it('it should return if no list was provided', () => {
      const mockEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        code: 'ArrowUp',
        keyCode: 38,
        bubbles: true,
        cancelable: true
      });
      const brokenList = undefined as unknown as Element[]
      handleKeyDown(mockEvent, brokenList)
      expect(handleKeyDown).toHaveBeenCalled()
      expect(handleKeyDown).toHaveReturnedWith(undefined)
    })
  })
})