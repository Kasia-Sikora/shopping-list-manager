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
    const mockItems: ListItem[] = [
      { id: 'item-1', value: 'Parent 1', checked: false, depth: 0, parentId: null },
      { id: 'item-2', value: 'Child 1.1', checked: false, depth: 1, parentId: 'item-1' },
      { id: 'item-3', value: 'Child 1.2', checked: false, depth: 1, parentId: 'item-1' },
      { id: 'item-4', value: 'Parent 2', checked: false, depth: 0, parentId: null },
      { id: 'item-5', value: 'Child 2.1', checked: false, depth: 1, parentId: 'item-4' },
    ];

    describe('Basic projection', () => {
      it('should return correct depth when projecting within valid range', () => {
        const targetId = 'item-2';
        const projectedDepth = 1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('item-1')
      });

      it('should clamp to maxDepth when exceeding limit', () => {
        const targetId = 'item-2';
        const projectedDepth = 5;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBeLessThanOrEqual(result.maxDepth);
        expect(result.depth).toBe(result.maxDepth);
      });

      it('should clamp to minDepth when below limit', () => {
        const targetId = 'item-5';
        const projectedDepth = -1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBeGreaterThanOrEqual(result.minDepth);
      });
    });

    describe('Parent ID calculation', () => {
      it('should assign null parentId when depth is 0', () => {
        const targetId = 'item-3';
        const projectedDepth = 0;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should assign correct parentId when depth equals previous item depth', () => {
        const targetId = 'item-3';
        const projectedDepth = 1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('item-1');
      });

      it('should assign current item as parent when depth increases', () => {
        const targetId = 'item-2';
        const projectedDepth = 1;
        const previousItem = mockItems[0];

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.parentId).toBe(previousItem.id);
      });

      it('should find correct parent when depth decreases', () => {
        const targetId = 'item-3';
        const projectedDepth = 0;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should find parent by walking up the tree', () => {
        const deepItems: ListItem[] = [
          { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
          { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
          { id: 'c', value: 'C', checked: false, depth: 2, parentId: 'b' },
          { id: 'd', value: 'D', checked: false, depth: 2, parentId: 'b' },
        ];

        const result = getProjection(deepItems, 'd', 1);

        expect(result.depth).toBe(1);
        expect(result.parentId).toBe('a');
      });
    });

    describe('Edge cases', () => {
      it('should handle first item in list', () => {
        const targetId = 'item-1';
        const projectedDepth = 0;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBe(0);
        expect(result.parentId).toBeNull();
      });

      it('should handle last item in list', () => {
        const targetId = 'item-5';
        const projectedDepth = 1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result).toHaveProperty('depth');
        expect(result).toHaveProperty('parentId');
      });

      it('should return maxDepth property', () => {
        const targetId = 'item-2';
        const projectedDepth = 1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result).toHaveProperty('maxDepth');
        expect(typeof result.maxDepth).toBe('number');
      });

      it('should return minDepth property', () => {
        const targetId = 'item-2';
        const projectedDepth = 1;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result).toHaveProperty('minDepth');
        expect(typeof result.minDepth).toBe('number');
      });
    });

    describe('Depth constraints', () => {
      it('should respect MAX_LIST_DEPTH constraint', () => {
        const targetId = 'item-3';
        const projectedDepth = 100;

        const result = getProjection(mockItems, targetId, projectedDepth);

        expect(result.depth).toBeLessThanOrEqual(2); 
      });

      it('should return consistent depth/parentId relationship', () => {
        const targetId = 'item-3';

        const result0 = getProjection(mockItems, targetId, 0);
        const result1 = getProjection(mockItems, targetId, 1);
        const result2 = getProjection(mockItems, targetId, 2);

        if (result0.depth === 0) expect(result0.parentId).toBeNull();
        if (result1.depth === 1) expect(result1.parentId).toBeDefined();
        if (result2.depth === 1) expect(result2.parentId).toBeDefined();
      });
    });
  });

  describe('buildTree', () => {
    it('should insert child after parent', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
        { id: 'sibling-1', value: 'Sibling', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      const result = buildTree(list, children);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('sibling-1');
    });

    it('should insert multiple children after same parent', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child 1', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-2', value: 'Child 2', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-3', value: 'Child 3', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      const result = buildTree(list, children);

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('child-2');
       expect(result[3].id).toBe('child-3');
    });

    it('should maintain original order of non-child items', () => {
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
        { id: 'item-2', value: 'Item 2', checked: false, depth: 0, parentId: null },
        { id: 'item-3', value: 'Item 3', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'item-1' },
      ];

      const result = buildTree(list, children);

      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('item-2');
      expect(result[3].id).toBe('item-3');
    });

    it('should handle empty children array', () => {
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [];

      const result = buildTree(list, children);

      expect(result).toEqual(list);
      expect(result).toHaveLength(1);
    });

    it('should skip children with non-existent parent', () => {
      const list: ListItem[] = [
        { id: 'item-1', value: 'Item 1', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'non-existent' },
      ];

      const result = buildTree(list, children);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });

    it('should preserve depth and parentId properties', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 2, parentId: 'parent-1' },
      ];

      const result = buildTree(list, children);

      const addedChild = result[1];
      expect(addedChild.depth).toBe(2);
      expect(addedChild.parentId).toBe('parent-1');
    });

    it('should handle nested hierarchy (children with children)', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'grandchild-1', value: 'Grandchild', checked: false, depth: 2, parentId: 'child-1' },
      ];

      const result = buildTree(list, children);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1');
      expect(result[2].id).toBe('grandchild-1');
    });

    it('should not mutate original list', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const listCopy = JSON.parse(JSON.stringify(list));

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: false, depth: 1, parentId: 'parent-1' },
      ];

      buildTree(list, children);

      expect(list).toEqual(listCopy);
    });

    it('should insert children in correct order when multiple parents exist', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent 1', checked: false, depth: 0, parentId: null },
        { id: 'parent-2', value: 'Parent 2', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1-1', value: 'Child 1.1', checked: false, depth: 1, parentId: 'parent-1' },
        { id: 'child-2-1', value: 'Child 2.1', checked: false, depth: 1, parentId: 'parent-2' },
      ];

      const result = buildTree(list, children);

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('parent-1');
      expect(result[1].id).toBe('child-1-1');
      expect(result[2].id).toBe('parent-2');
      expect(result[3].id).toBe('child-2-1');
    });

    it('should handle checked property correctly', () => {
      const list: ListItem[] = [
        { id: 'parent-1', value: 'Parent', checked: false, depth: 0, parentId: null },
      ];

      const children: ListItem[] = [
        { id: 'child-1', value: 'Child', checked: true, depth: 1, parentId: 'parent-1' },
      ];

      const result = buildTree(list, children);

      const addedChild = result[1];
      expect(addedChild.checked).toBe(true);
    });
  });
});
