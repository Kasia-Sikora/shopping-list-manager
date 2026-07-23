import { splitItemsToDoneAndUndoneLists } from '../utils';

describe('shadow parenting mechanism', () => {
  it("should put parent and all it's children in checkedList when all are checked", () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: false,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: true,
        depth: 0,
        parentId: null,
      },
      {
        id: '4',
        value: 'fourth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
      {
        id: '5',
        value: 'fifth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: false,
          depth: 1,
          parentId: '1',
        },
      ],
      checkedItems: [
        {
          id: '3',
          value: 'third el in First List',
          checked: true,
          depth: 0,
          parentId: null,
        },
        {
          id: '4',
          value: 'fourth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
        {
          id: '5',
          value: 'fifth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
      ],
    });
  });

  it('should create shadow copy of parent when some children are checked', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: false,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '4',
        value: 'fourth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
      {
        id: '5',
        value: 'fifth el in First List',
        checked: false,
        depth: 1,
        parentId: '3',
      },
      {
        id: '6',
        value: 'sixth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '5',
          value: 'fifth el in First List',
          checked: false,
          depth: 1,
          parentId: '3',
        },
      ],
      checkedItems: [
        {
          id: 'shadow-3',
          value: 'third el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '4',
          value: 'fourth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
        {
          id: '6',
          value: 'sixth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
      ],
    });
  });

  it('should not auto-check parent when all children are checked', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: false,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '4',
        value: 'fourth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
      {
        id: '5',
        value: 'fifth el in First List',
        checked: true,
        depth: 1,
        parentId: '3',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: false,
          depth: 1,
          parentId: '1',
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
      ],
      checkedItems: [
        {
          id: 'shadow-3',
          value: 'third el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '4',
          value: 'fourth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
        {
          id: '5',
          value: 'fifth el in First List',
          checked: true,
          depth: 1,
          parentId: '3',
        },
      ],
    });
  });

  it('should create shadow copy of parent when some children are checked when parent is first on the list', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: true,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: false,
        depth: 1,
        parentId: '1',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: false,
          depth: 1,
          parentId: '1',
        },
      ],
      checkedItems: [
        {
          id: 'shadow-1',
          value: 'first el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: true,
          depth: 1,
          parentId: '1',
        },
      ],
    });
  });

  it('should not auto-check parent when all children are checked when parent is first on the list', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: true,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: true,
        depth: 1,
        parentId: '1',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
      ],
      checkedItems: [
        {
          id: 'shadow-1',
          value: 'first el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: true,
          depth: 1,
          parentId: '1',
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: true,
          depth: 1,
          parentId: '1',
        },
      ],
    });
  });

  it.todo('should restore parent from checked when any child was unchecked', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: true,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: true,
        depth: 1,
        parentId: '1',
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: false,
        depth: 1,
        parentId: '1',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: false,
          depth: 1,
          parentId: '1',
        },
      ],
      checkedItems: [
        {
          id: 'shadow-1',
          value: 'first el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: true,
          depth: 1,
          parentId: '1',
        },
      ],
    });
  });

  it('nests a re-parented checked child under a shadow of its real parent, not the depth-0 item directly above it', () => {
    const exampleList = [
      {
        id: '1',
        value: 'first el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'second el in First List',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '3',
        value: 'third el in First List',
        checked: true,
        depth: 1,
        parentId: '1',
      },
    ];

    expect(splitItemsToDoneAndUndoneLists(exampleList)).toMatchObject({
      uncheckedItems: [
        {
          id: '1',
          value: 'first el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
        {
          id: '2',
          value: 'second el in First List',
          checked: false,
          depth: 0,
          parentId: null,
        },
      ],
      checkedItems: [
        {
          id: 'shadow-1',
          value: 'first el in First List',
          checked: true,
          depth: 0,
          parentId: null,
          isShadow: true,
        },
        {
          id: '3',
          value: 'third el in First List',
          checked: true,
          depth: 1,
          parentId: '1',
        },
      ],
    });
  });

  it('emits a checked parent as a header only once when a checked child precedes it in the array', () => {
    const exampleList = [
      {
        id: '2',
        value: 'first child',
        checked: true,
        depth: 1,
        parentId: '1',
      },
      {
        id: '1',
        value: 'the parent',
        checked: true,
        depth: 0,
        parentId: null,
      },
      {
        id: '3',
        value: 'second child',
        checked: true,
        depth: 1,
        parentId: '1',
      },
    ];

    const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(exampleList);

    expect(uncheckedItems).toEqual([]);
    expect(checkedItems).toMatchObject([
      { id: '1', value: 'the parent', checked: true, depth: 0, parentId: null },
      { id: '2', value: 'first child', checked: true, depth: 1, parentId: '1' },
      { id: '3', value: 'second child', checked: true, depth: 1, parentId: '1' },
    ]);

    const ids = checkedItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('promotes an orphaned checked child (parent missing from the list) to a top-level checked row instead of crashing', () => {
    // A checked child at depth 1 whose parentId points at an id that isn't in the list. Before the
    // guard, byId.get(parentId) returned undefined and reading `.checked` threw during render.
    const exampleList = [
      {
        id: '1',
        value: 'a normal root',
        checked: false,
        depth: 0,
        parentId: null,
      },
      {
        id: '2',
        value: 'orphaned checked child',
        checked: true,
        depth: 1,
        parentId: 'ghost', // 'ghost' is not present in the list
      },
    ];

    const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(exampleList);

    // The orphan is promoted to a standalone checked root (depth 0, no parent) — no invented shadow.
    expect(checkedItems).toMatchObject([
      {
        id: '2',
        value: 'orphaned checked child',
        checked: true,
        depth: 0,
        parentId: null,
      },
    ]);
    expect(checkedItems).toHaveLength(1);
    expect(checkedItems.some((item) => item.isShadow)).toBe(false);

    // The real root is untouched and stays in the to-do list.
    expect(uncheckedItems).toMatchObject([
      { id: '1', value: 'a normal root', checked: false, depth: 0, parentId: null },
    ]);
  });
});
