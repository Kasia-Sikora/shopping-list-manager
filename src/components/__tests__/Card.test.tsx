import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import Card from '../Card';
import type { List } from '../../interfaces';

const exampleItem: List = {
  id: '1',
  title: 'list title',
  content: [{ listItemId: '333', checked: false, value: 'kup bułki' }],
};

describe('Card', () => {
  it('should display default card on page load', () => {
    render(<Card />);
    expect(getEmptyCardTitleEl()).toBeNull();
    expect(getListItem()).not.toBeNull();
    expect(getEmptyCard()).toHaveClass('min-w-75')
  });

  it('should show title input when card is clicked', async () => {
    render(<Card />);
    expect(getEmptyCardTitleEl()).toBeNull();
    await userEvent.click(getEmptyCard());
    waitFor(() => expect(getEmptyCardTitleEl()).not.toBeNull());
    expect(getListItem()).not.toBeNull();
  });

  it('should display edit card in preview mode when item is provided', () => {
    render(<Card editedItem={exampleItem} />);

    //check if item is rendered with given data
    expect(getCard()).toBeVisible();
    expect(getCard()).toHaveClass('w-75')

    expect(getTitleEl().textContent).toEqual('list title');
    expect(getListTextarea().value).toEqual('kup bułki');
    expect(getAddElemButton()).toBeVisible();

    //check if card is in preview mode
    expect(getListTextarea().value).toEqual('kup bułki');
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'true');
  });

  it('should switch between preview and edit mode wen card is not empty', async () => {
    render(<Card editedItem={exampleItem} />);

    expect(getCard()).toBeVisible();
    //check if card is in preview mode
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'true');
    expect(getListTextarea().value).toEqual('kup bułki');

    await userEvent.click(getCard() as Element);

    //check if card is in edit mode
    await waitFor(() => expect(getListTextarea()).not.toBeNull());
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'false');
    expect(getListTextarea().value).toEqual('kup bułki');
  });
});

const getEmptyCard = () => screen.getByTestId('card-empty');
const getEmptyCardTitleEl = () => screen.queryByPlaceholderText('Tytuł');

const getCard = (itemId: string = exampleItem.id) => screen.queryByTestId(`card-${itemId}`);
const getTitleEl = () => screen.getByRole('heading');
const getListItem = (index: number = 0) => screen.queryAllByRole('listitem')[index];
const getEditIndicator = (listId: string = exampleItem.id) => screen.queryByTestId(`card-${listId}-edit-indicator`);
const getListTextarea = (itemId: string = exampleItem.id) =>
  screen.queryByTestId(`card-${itemId}-textarea`) as unknown as HTMLTextAreaElement;
const getAddElemButton = (itemId: string = exampleItem.id) =>
  within(getCard(itemId)!).queryByRole('button', { name: '+ Element listy' });
