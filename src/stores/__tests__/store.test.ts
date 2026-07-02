import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';
import type { List, ListItem } from '../../interfaces';

/**
 * Test setup for store tests.
 * Zustand stores are global singletons, so we reset them before each test.
 */
describe('useStore - Shopping List Store', () => {
  // Sample data for tests
  const mockListItem: ListItem = {
    id: 'item-1',
    value: 'Milk',
    checked: false,
    depth: 0,
    parentId: null,
  };

  const mockList: List = {
    id: 'list-1',
    title: 'Groceries',
    content: [mockListItem],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockList2: List = {
    id: 'list-2',
    title: 'Household',
    content: [
      {
        id: 'item-2',
        value: 'Soap',
        checked: false,
        depth: 0,
        parentId: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockList3: List = {
    id: 'list-3',
    title: 'Hardware',
    content: [
      {
        id: 'item-3',
        value: 'Nails',
        checked: false,
        depth: 0,
        parentId: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockList4: List = {
    id: 'list-4',
    title: 'Groeceries',
    content: [
      {
        id: 'item-4',
        value: 'Milk',
        checked: true,
        depth: 0,
        parentId: null,
      },
      {
        id: 'item-5',
        value: 'Eggs',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: 'item-6',
        value: 'Eggplant',
        checked: true,
        depth: 0,
        parentId: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Reset store before each test
  beforeEach(() => {
    useStore.setState({ lists: [] });
  });

  // ============ moveList Tests ============
  describe('moveList', () => {
    it('should move a list from index 0 to index 1', () => {
      // Arrange: Set up initial state with 3 lists
      useStore.setState({
        lists: [mockList, mockList2, mockList3],
      });

      // Act: Move list at index 0 to index 1
      useStore.getState().moveList(0, 1);

      // Assert: Verify the order changed
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(3);
      expect(lists[0].id).toBe('list-2');
      expect(lists[1].id).toBe('list-1');
      expect(lists[2].id).toBe('list-3');
    });

    it('should move a list from last position to first', () => {
      // Arrange
      useStore.setState({
        lists: [mockList, mockList2, mockList3],
      });

      // Act: Move list at index 2 to index 0
      useStore.getState().moveList(2, 0);

      // Assert
      const lists = useStore.getState().lists;
      expect(lists[0].id).toBe('list-3');
      expect(lists[1].id).toBe('list-1');
      expect(lists[2].id).toBe('list-2');
    });

    it('should maintain list properties when moving', () => {
      // Arrange
      useStore.setState({
        lists: [mockList, mockList2],
      });

      // Act
      useStore.getState().moveList(0, 1);

      // Assert: Verify the moved list still has all properties
      const movedList = useStore.getState().lists[1];
      expect(movedList.id).toBe('list-1');
      expect(movedList.title).toBe('Groceries');
      expect(movedList.content).toHaveLength(1);
      expect(movedList.content[0].value).toBe('Milk');
    });
  });

  // ============ addList Tests ============
  describe('addList', () => {
    it('should add a list to the store', () => {
      // Arrange
      useStore.setState({ lists: [] });

      // Act: Add a list
      useStore.getState().addList(mockList);

      // Assert
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(1);
      expect(lists[0].id).toBe('list-1');
      expect(lists[0].title).toBe('Groceries');
    });

    it('should preserve existing lists when adding', () => {
      // Arrange
      useStore.setState({ lists: [mockList, mockList2] });

      // Act
      useStore.getState().addList(mockList3);

      // Assert
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(3);
    });
  });

  // ============ removeList Tests ============
  describe('removeList', () => {
    it('should remove a list by ID', () => {
      // Arrange
      useStore.setState({
        lists: [mockList, mockList2, mockList3],
      });

      // Act
      useStore.getState().removeList('list-2');

      // Assert
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(2);
      expect(lists.map((l) => l.id)).toEqual(['list-1', 'list-3']);
    });
  });

  // ============ updateList Tests ============
  describe('updateList', () => {
    it('should update list title', () => {
      // Arrange
      useStore.setState({ lists: [mockList, mockList2] });

      // Act
      const updatedList = { ...mockList, title: 'Updated Groceries' };
      useStore.getState().updateList(updatedList);

      // Assert
      const lists = useStore.getState().lists;
      const list = lists.find((l) => l.id === 'list-1');
      expect(list?.title).toBe('Updated Groceries');
    });
  });

  describe('removeCheckedListItems', () => {
    it('should remove all checked list items', () => {
      // Arrange
      useStore.setState({
        lists: [mockList3, mockList4],
      });
      const listsBeforeRemove = useStore.getState().lists;
      expect(listsBeforeRemove[1].content.map((item) => item.id)).toEqual(['item-4', 'item-5', 'item-6']);

      // Act
      useStore.getState().removeCheckedListItems('list-4');

      // Assert
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(2);
      expect(lists[1].content.map((item) => item.id)).toEqual(['item-5']);
      expect(lists.length).toEqual(2);
    });
  });

  describe('copyList', () => {
    it('should copy list with -copy suffix', () => {
      // Arrange
      useStore.setState({
        lists: [mockList3, mockList4],
      });
      const listsBeforeCopy = useStore.getState().lists;
      expect(listsBeforeCopy.map((item) => item.title)).toEqual(['Hardware', 'Groeceries']);
      expect(listsBeforeCopy.length).toEqual(2);
      // Act
      useStore.getState().copyList('list-4');

      // Assert
      const lists = useStore.getState().lists;
      expect(lists).toHaveLength(3);
      expect(lists.map((item) => item.title)).toEqual(['Hardware', 'Groeceries', 'Groeceries-copy']);
    });
  });
});
