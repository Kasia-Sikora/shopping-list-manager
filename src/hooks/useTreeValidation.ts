import { useDragDropMonitor } from '@dnd-kit/react';
import { useEffect, useRef } from 'react';
import { isValidTreeOrder, ensureTreeOrder } from '../utils/treeValidation';
import type { ListItem } from '../interfaces';

/**
 * Hook that validates and reorders tree structure before drag starts
 * Ensures all parents appear before their children in the items array
 *
 * @param tree - Current flat array of list items
 * @param onValidate - Callback when tree is reordered (receives validated tree)
 *
 * @example
 * const [tree, setTree] = useState(list);
 *
 * useTreeValidation(tree, (validatedTree) => {
 *   setTree(validatedTree);
 *   actions.update({ content: validatedTree });
 * });
 */
export function useTreeValidation(
  tree: ListItem[],
  onValidate: (validatedTree: ListItem[]) => void
) {
  const treeRef = useRef(tree);
  const onValidateRef = useRef(onValidate);

  useEffect(() => {
    treeRef.current = tree;
    onValidateRef.current = onValidate;
  }, [tree, onValidate]);

  useDragDropMonitor({
    onBeforeDragStart: (event) => {
      const { source } = event.operation;

      if (!source) return;

      if (!isValidTreeOrder(treeRef.current)) {
        console.warn(
          `[useTreeValidation] Tree order invalid before drag, reordering...`
        );
        const validatedTree = ensureTreeOrder(treeRef.current);
        onValidateRef.current(validatedTree);
      }
    }
  });
}