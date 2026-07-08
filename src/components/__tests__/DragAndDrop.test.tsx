import { describe, it } from 'vitest';

describe('ListOfItems - Drag and Drop (deferred — needs Browser Mode)', () => {
  describe('onDragStart', () => {
    it.todo('should hide descendants of dragged item'); // drag parent → children not visible
    it.todo('should set active state'); // 'active' className added
  });

  describe('onDragOver', () => {
    it.todo('should calculate correct depth when dragging right (31px = INDENT_VALUE)');
    it.todo('should prevent exceeding MAX_DEPTH');
    it.todo('should update parentId correctly (drag A under B → A.parentId === B.id)');
  });

  describe('onDragEnd', () => {
    it.todo('should rebuild tree with dragged item in new position');
    it.todo('should reinsert children at correct position (parent + 2 children move together)');
    it.todo('should call actions.update with the new content array');
  });

  describe('Edge Cases', () => {
    it.todo('should handle dragging a single item (no children)');
    it.todo('should handle dragging to the top of the list');
    it.todo('should handle dragging to the bottom of the list');
  });
});
