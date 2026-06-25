import type { ListItem } from '../../interfaces';
import {
  getDescendants,
  getDragDepth,
  getProjection,
  buildTree,
} from '../../utils/treeUtils';

const mockList: ListItem[] = [
  {
    id: 'item-3',
    value: 'Diary',
    checked: false,
    depth: 0,
    parentId: null,
  },
  {
    id: 'item-4',
    value: 'Milk',
    checked: false,
    depth: 1,
    parentId: 'item-3',
  },
  {
    id: 'item-5',
    value: 'Eggs',
    checked: false,
    depth: 0,
    parentId: 'item-3',
  },
  {
    id: 'item-6',
    value: 'Eggplant',
    checked: false,
    depth: 0,
    parentId: null,
  },
];

vi.mock('../../utils/treeUtils.ts', { spy: true });
describe('edge cases tree utils tests', () => {
  describe('getDescendants tests', () => {
    it('should return all descendants of provided parentId', () => {
      expect(getDescendants(mockList, 'item-3')).toEqual(new Set(['item-4', 'item-5']));
    });
  });

  describe('getDragDepth test', () => {
    it('should return proper depth with given offset and indentation', () => {
      expect(getDragDepth(120, 20)).toEqual(6);
      expect(getDragDepth(66, 30)).toEqual(2);
      expect(getDragDepth(-66, 30)).toEqual(-2);
    });
  });

  describe('getProjection', () => {
    // Sample tree structure for testing
    // depth: 0
    //   id: 'item-1'
    // depth: 1
    //   id: 'item-2' (parent: item-1)
    // depth: 1
    //   id: 'item-3' (parent: item-1)
    // depth: 0
    //   id: 'item-4'
    // depth: 1
    //   id: 'item-5' (parent: item-4)

    const mockItems: ListItem[] = [
      { id: 'item-1', value: 'Parent 1', checked: false, depth: 0, parentId: null },
      { id: 'item-2', value: 'Child 1.1', checked: false, depth: 1, parentId: 'item-1' },
      { id: 'item-3', value: 'Child 1.2', checked: false, depth: 1, parentId: 'item-1' },
      { id: 'item-4', value: 'Parent 2', checked: false, depth: 0, parentId: null },
      { id: 'item-5', value: 'Child 2.1', checked: false, depth: 1, parentId: 'item-4' },
    ];

    describe('Basic projection', () => {
      it('should return correct depth when projecting within valid range', () => {
        // Arrange: Project item-2 with depth 1 (target is item-2)
        const targetId = 'item-2';
        const projectedDepth = 1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Depth should be 1 (within valid range)
        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('item-1')
      });

      it('should clamp to maxDepth when exceeding limit', () => {
        // Arrange: Project item-2 with depth 5 (exceeds maxDepth)
        const targetId = 'item-2';
        const projectedDepth = 5;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Depth should be clamped to maxDepth (not 5)
        expect(result.depth).toBeLessThanOrEqual(result.maxDepth);
        expect(result.depth).toBe(result.maxDepth);
      });

      it('should clamp to minDepth when below limit', () => {
        // Arrange: Project item-5 with depth -1 (below minDepth)
        const targetId = 'item-5';
        const projectedDepth = -1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Depth should be clamped to minDepth (0 or higher)
        expect(result.depth).toBeGreaterThanOrEqual(result.minDepth);
      });
    });

    describe('Parent ID calculation', () => {
      it('should assign null parentId when depth is 0', () => {
        // Arrange: Project item-3 with depth 0 (root level)
        const targetId = 'item-3';
        const projectedDepth = 0;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Root items have no parent
        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should assign correct parentId when depth equals previous item depth', () => {
        // Arrange: item-2 and item-3 are siblings (both depth 1, parent: item-1)
        // Project item-3 with depth 1 (same as item-2)
        const targetId = 'item-3';
        const projectedDepth = 1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Should have same parent as previous item at same depth
        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('item-1'); // item-2's parent
      });

      it('should assign current item as parent when depth increases', () => {
        // Arrange: Project item-2 as child of item-1
        // item-1 at depth 0, project item-2 to depth 1
        const targetId = 'item-2';
        const projectedDepth = 1;
        const previousItem = mockItems[0]; // item-1

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Previous item should become parent
        expect(result.parentId).toBe(previousItem.id);
      });

      it('should find correct parent when depth decreases', () => {
        // Arrange: item-3 is at depth 1, project it to depth 0
        const targetId = 'item-3';
        const projectedDepth = 0;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Root level has no parent
        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should find parent by walking up the tree', () => {
        // Arrange: Create deeper nesting
        const deepItems: ListItem[] = [
          { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
          { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
          { id: 'c', value: 'C', checked: false, depth: 2, parentId: 'b' },
          { id: 'd', value: 'D', checked: false, depth: 2, parentId: 'b' },
        ];

        // Project item 'd' to depth 1
        const result = getProjection(deepItems, 'd', 1);

        // Assert: Should find parent 'a' (the item at depth 0 before d)
        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('a');
      });
    });

    describe('Edge cases', () => {
      it('should handle first item in list', () => {
        // Arrange: First item (item-1)
        const targetId = 'item-1';
        const projectedDepth = 0;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: First item has no previous sibling
        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should handle last item in list', () => {
        // Arrange: Last item (item-5)
        const targetId = 'item-5';
        const projectedDepth = 1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Last item should project correctly
        expect(result).toHaveProperty('depth');
        expect(result).toHaveProperty('parentId');
      });

      it('should return maxDepth property', () => {
        // Arrange
        const targetId = 'item-2';
        const projectedDepth = 1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Should include maxDepth in result
        expect(result).toHaveProperty('maxDepth');
        expect(typeof result.maxDepth).toBe('number');
      });

      it('should return minDepth property', () => {
        // Arrange
        const targetId = 'item-2';
        const projectedDepth = 1;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Should include minDepth in result
        expect(result).toHaveProperty('minDepth');
        expect(typeof result.minDepth).toBe('number');
      });
    });

    describe('Depth constraints', () => {
      it('should respect MAX_LIST_DEPTH constraint', () => {
        // Arrange: Project to very high depth
        const targetId = 'item-3';
        const projectedDepth = 100;

        // Act
        const result = getProjection(mockItems, targetId, projectedDepth);

        // Assert: Should be clamped by maxDepth
        expect(result.depth).toBeLessThanOrEqual(2); // MAX_LIST_DEPTH = 1, so maxDepth = 2
      });

      it('should return consistent depth/parentId relationship', () => {
        // Arrange: Test multiple projections
        const targetId = 'item-3';

        // Act: Project to various depths
        const result0 = getProjection(mockItems, targetId, 0);
        const result1 = getProjection(mockItems, targetId, 1);
        const result2 = getProjection(mockItems, targetId, 2);

        // Assert: All should have valid parentId for their depth
        if (result0.depth === 0) expect(result0.parentId).toBeNull();
        if (result1.depth === 1) expect(result1.parentId).toBeDefined();
        if (result2.depth === 1) expect(result2.parentId).toBeDefined();
      });
    });
  });

  describe('buildTree', () => {
    it('should insert child after parent', () => {
      // Arrange: Parent without children
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
        { id: 'sibling-1', value: 'Sibling', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Child should be inserted after parent
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('sibling-1');
    });

    it('should insert multiple children after same parent', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child 1', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-2', value: 'Child 2', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-3', value: 'Child 3', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Both children inserted after parent
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('child-2');
       expect(result[3].id).toBe('child-3');
    });

    it('should maintain original order of non-child items', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
        { id: 'item-2', value: 'Item 2', checked: false, depth: 0, parentId: null },
        { id: 'item-3', value: 'Item 3', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'item-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Original items maintain order
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('item-2');
      expect(result[3].id).toBe('item-3');
    });

    it('should handle empty children array', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [];

      // Act
      const result = buildTree(list, children);

      // Assert: Should return original list unchanged
      expect(result).toEqual(list);
      expect(result).toHaveLength(1);
    });

    it('should skip children with non-existent parent', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'non-existent' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Child should not be added if parent doesn't exist
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });

    it('should preserve depth and parentId properties', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 2, parentId: 'parent-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Child properties should be preserved
      const addedChild = result[1];
      expect(addedChild.depth).toBe(2);
      expect(addedChild.parentId).toBe('parent-1');
    });

    it('should handle nested hierarchy (children with children)', () => {
      // Arrange: Parent with child, and that child has a child
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'grandchild-1', value: 'Grandchild', checked: false, depth: 2, parentId: 'child-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Grandchild should be inserted after child (which is after parent)
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('grandchild-1');
    });

    it('should not mutate original list', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const listCopy = JSON.parse(JSON.stringify(list));

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      // Act
      buildTree(list, children);

      // Assert: Original list should be unchanged
      expect(list).toEqual(listCopy);
    });

    it('should insert children in correct order when multiple parents exist', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent 1', checked: false, depth: 0, parentId: null },
        { id: 'parent-2', value: 'Parent 2', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1-1', value: 'Child 1.1', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-2-1', value: 'Child 2.1', checked: false, depth: 1, parentId: 'parent-2' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Children should be placed after respective parents
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1-1');
      expect(result[2].id).toBe('parent-2');
      expect(result[3].id).toBe('child-2-1');
    });

    it('should handle checked property correctly', () => {
      // Arrange
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: true, depth: 1, parentId: 'parent-1' },
      ];

      // Act
      const result = buildTree(list, children);

      // Assert: Checked property should be preserved
      const addedChild = result[1];
      expect(addedChild.checked).toBe(true);
    });
  });
});
