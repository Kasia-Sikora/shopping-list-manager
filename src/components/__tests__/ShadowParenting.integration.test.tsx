import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { editedElements } from './testHelpers';
import type { List } from '../../interfaces';
import * as db from '../../services/indexedDB';

describe('<App /> — shadow parenting', () => {
  const user = userEvent.setup();
  const { getCheckbox, queryCheckbox, queryItemsList, getEditCard } = editedElements;

  const makeCard = (content: List['content']): List => ({
    id: '0',
    title: 'Groceries',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const seedAndRender = async (content: List['content']) => {
    await db.insertList(makeCard(content));
    render(<App />);
    await waitFor(() => expect(getEditCard('0')).toBeVisible());
    await user.click(getEditCard('0'));
  };

  // The done/todo lists render textareas; read their values to assert order + grouping at a glance.
  const valuesOf = (nodes: HTMLElement[] | null) =>
    (nodes ?? []).map((node) => (node as HTMLTextAreaElement).value);

  const GROCERIES: List['content'] = [
    { id: 'n', value: 'Dairy', checked: false, depth: 0, parentId: null },
    { id: 'm', value: 'Milk', checked: false, depth: 1, parentId: 'n' },
    { id: 's', value: 'Cheese', checked: false, depth: 1, parentId: 'n' },
    { id: 'p', value: 'Vegetables', checked: false, depth: 0, parentId: null },
    { id: 'c', value: 'Cucumber', checked: false, depth: 1, parentId: 'p' },
  ];

  it('checking a child shows a shadow of its parent in the done list while the real parent stays unchecked', async () => {
    await seedAndRender(GROCERIES);

    // Before: everything is a to-do; there is no done section yet.
    expect(queryItemsList(true)).toBeNull();
    expect(valuesOf(queryItemsList(false))).toEqual(['Dairy', 'Milk', 'Cheese', 'Vegetables', 'Cucumber']);

    await user.click(getCheckbox('m'));

    // The real parent stays in the to-do list, still unchecked.
    expect(getCheckbox('n')).toHaveProperty('checked', false);
    expect(valuesOf(queryItemsList(false))).toEqual(['Dairy', 'Cheese', 'Vegetables', 'Cucumber']);

    // The checked child nests under a *shadow* of the parent: same label, disabled, checked.
    expect(valuesOf(queryItemsList(true))).toEqual(['Dairy', 'Milk']);
    expect(getCheckbox('shadow-n')).toBeDisabled();
    expect(getCheckbox('shadow-n')).toHaveProperty('checked', true);
    expect(getCheckbox('m')).toHaveProperty('checked', true);
  });

  it('checking the parent moves it and all its children into the done list as one group (no duplicate header)', async () => {
    await seedAndRender(GROCERIES);

    await user.click(getCheckbox('m')); // a shadow parent now exists in the done list
    expect(queryCheckbox('shadow-n')).toBeInTheDocument();

    await user.click(getCheckbox('n')); // check the real parent

    // Parent listed once, then its children — not doubled.
    expect(valuesOf(queryItemsList(true))).toEqual(['Dairy', 'Milk', 'Cheese']);
    // The shadow is gone: the real (checked) parent is the header now.
    expect(queryCheckbox('shadow-n')).toBeNull();
    expect(getCheckbox('n')).toHaveProperty('checked', true);
    expect(getCheckbox('n')).not.toBeDisabled();
    // Only the untouched group is left to do.
    expect(valuesOf(queryItemsList(false))).toEqual(['Vegetables', 'Cucumber']);
  });

  it('renders a checked parent once even when a checked child precedes it in stored content (duplicate-key regression)', async () => {
    // Mirrors the app's post-drag storage: content is persisted as [...checked, ...undone], so a
    // checked child can sit BEFORE its checked parent and survive the load sort (both are checked).
    // Before the fix, the parent header was emitted twice → duplicate React keys.
    await seedAndRender([
      { id: 'm', value: 'Milk', checked: true, depth: 1, parentId: 'n' },
      { id: 'n', value: 'Dairy', checked: true, depth: 0, parentId: null },
      { id: 's', value: 'Cheese', checked: true, depth: 1, parentId: 'n' },
    ]);

    const doneValues = valuesOf(queryItemsList(true));
    expect(doneValues).toEqual(['Dairy', 'Milk', 'Cheese']);
    expect(new Set(doneValues).size).toBe(doneValues.length); // no duplicated rows
    expect(queryItemsList(false)).toBeNull();
  });

  it('unchecking a child returns it to the to-do list under its parent, not orphaned at the top', async () => {
    await seedAndRender(GROCERIES);

    await user.click(getCheckbox('m')); // move Milk to done (shadow appears)
    expect(valuesOf(queryItemsList(true))).toEqual(['Dairy', 'Milk']);

    await user.click(getCheckbox('m')); // and back

    // Done section is gone; Milk sits back under Dairy in original sibling order — no depth-1 orphan on top.
    expect(queryItemsList(true)).toBeNull();
    expect(valuesOf(queryItemsList(false))).toEqual(['Dairy', 'Milk', 'Cheese', 'Vegetables', 'Cucumber']);
  });

  it('unchecking one child of a fully-checked parent restores the parent to the to-do list and shadows it for the remaining checked child', async () => {
    await seedAndRender(GROCERIES);

    await user.click(getCheckbox('n')); // checks parent + all its children
    expect(valuesOf(queryItemsList(true))).toEqual(['Dairy', 'Milk', 'Cheese']);

    await user.click(getCheckbox('s')); // uncheck ONE child

    // Parent is restored to the to-do list, unchecked, next to the child that came back.
    expect(getCheckbox('n')).toHaveProperty('checked', false);
    expect(valuesOf(queryItemsList(false))).toEqual(['Dairy', 'Cheese', 'Vegetables', 'Cucumber']);

    // The still-checked child stays in done under a shadow of the parent.
    expect(valuesOf(queryItemsList(true))).toEqual(['Dairy', 'Milk']);
    expect(getCheckbox('shadow-n')).toBeDisabled();
  });
});
