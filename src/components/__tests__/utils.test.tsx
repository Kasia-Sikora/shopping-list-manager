import type { ListItem, PersistedShoppingListStore } from '../../interfaces';
import { sortList, sortListContent } from '../../utils/storeUtils';

vi.mock('../../utils/utils.ts', { spy: true })
vi.mock('../../utils/storeUtils', { spy: true })
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
      expect(sortListContent(exampleStore)).toEqual([])
    })

    it('should return empty array if items are empty', () => {
      const exampleStore = { state: { lists: [] } }
      expect(sortListContent(exampleStore)).toEqual([])
    })
  })
})