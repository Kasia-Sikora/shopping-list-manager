import { describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { editedElements } from './testHelpers';
import type { PersistedShoppingListStore } from '../../interfaces';
import * as db from '../../services/indexedDB'

describe('<App>', () => {
  const user = userEvent.setup();
  const {
    getEditCard,
    getEditIndicator,
    getTitleEl,
    getListItemTextarea,
    queryCheckbox,
    getAddElButton,
    getDeleteButton,
    getCheckbox,
    queryItemsList,
    getDoneElemExpandButton,
  } = editedElements;

  const defaultStoreState: PersistedShoppingListStore = {
    state: {
      lists: [
        {
          id: '0',
          title: 'First Card',
          content: [
            {
              id: '1',
              value: 'first el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
            {
              id: '2',
              value: 'second el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
            {
              id: '3',
              value: 'third el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
            {
              id: '4',
              value: 'fourth el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '1',
          title: 'Second Card',
          content: [
            {
              id: '1',
              value: 'first el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
            {
              id: '2',
              value: 'second el in First List',
              checked: false,
              depth: 0,
              parentId: '1'
            },
            {
              id: '3',
              value: 'third el in First List',
              checked: false,
              depth: 0,
              parentId: '1'
            },
            {
              id: '4',
              value: 'fourth el in First List',
              checked: false,
              depth: 0,
              parentId: null
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }
  }

  const prepareComponent = async () => {

    render(<App />);
    await waitFor(() => expect(getEditCard(defaultStoreState.state.lists[0].id)).toBeVisible());

    await user.click(getEditCard());
    expect(getListItemTextarea()[3]).toBeVisible();
    await user.type(getListItemTextarea()[3], '{enter}');
    expect(getListItemTextarea()[4]).toBeVisible();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanup();
    await db.insertList(defaultStoreState.state.lists[0]);
    await db.insertList(defaultStoreState.state.lists[1]);
    await prepareComponent();
  });

  afterEach(() => {
    localStorage.clear()
  });

  it('should create new line when Enter key was hit', async () => {
    await user.type(getListItemTextarea("0")[4], 'Kup chleb{enter}');
    expect(getListItemTextarea()).toHaveLength(6);
  });

  it('should create new line when "+ Element List" button was clicked', async () => {
    expect(getListItemTextarea("0")).toHaveLength(5);

    expect(getAddElButton()).toBeInTheDocument();
    await user.click(getAddElButton());

    expect(getListItemTextarea()).toHaveLength(6);
  });

  it('should save list when Enter + Shift keys was hit', async () => {
    await user.type(getListItemTextarea()[4], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(6);

    expect(getListItemTextarea()[5]).toBeVisible();
    await user.type(getListItemTextarea()[5], 'Kup mleko{Enter}');
    expect(getListItemTextarea()).toHaveLength(7);

    expect(getListItemTextarea()[6]).toBeVisible();
    await user.type(getListItemTextarea()[6], '{Shift>}{Enter}{/Shift}');

    //After Enter+Shift cardContent should be saved and cleared
    await waitFor(() => expect(getListItemTextarea()).toHaveLength(6));
  });

  it('should move trough list using arrow up and down', async () => {
    await user.click(getListItemTextarea()[4]);
    expect(getListItemTextarea()[4]).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getListItemTextarea()[3]).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getListItemTextarea()[2]).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getListItemTextarea()[1]).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getListItemTextarea()[0]).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getTitleEl()).toHaveFocus();

    await user.keyboard('{arrowup}');
    expect(getTitleEl()).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[0]).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[1]).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[2]).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[3]).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[4]).toHaveFocus();

    await user.keyboard('{arrowdown}');
    expect(getListItemTextarea()[4]).toHaveFocus();
  });

  it('should remove element when delete button was clicked', async () => {
    expect(getListItemTextarea()).toHaveLength(5);

    await user.hover(getListItemTextarea()[0]);
    expect(getDeleteButton(1)).toBeVisible();

    await user.click(getDeleteButton(1)!);

    expect(getListItemTextarea()).toHaveLength(4);
  });

  it('should save data when user clicked outside card', async () => {
    expect(getListItemTextarea()[4]).toBeVisible();
    await user.type(getListItemTextarea()[4], 'Kup mleko{Enter}');
    expect(getListItemTextarea()).toHaveLength(6);

    expect(getListItemTextarea()[5]).toBeVisible();
    await user.type(getListItemTextarea()[5], 'Kup jaja');
    await user.click(document.body);

    //After click outside the card, cardContent should be saved and cleared
    expect(getListItemTextarea()).toHaveLength(6);
  });

  it('should not save data when listItem is empty', async () => {
    expect(getListItemTextarea()).toHaveLength(5);
    await user.keyboard('{enter}{enter}{enter}{enter}{enter}{enter}{enter}');
    expect(getListItemTextarea()).toHaveLength(12);
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await waitFor(() => expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'true'));
    expect(getListItemTextarea()).toHaveLength(4);
  });

  it('should create separate list in card with checked items', async () => {
    expect(queryItemsList(true)).not.toBeInTheDocument();

    expect(queryItemsList(false)).toHaveLength(5);
    expect(queryItemsList(false)?.[0]).toBeVisible();
    expect(getListItemTextarea()).toHaveLength(5);
    expect(queryCheckbox('5')).toBeNull();

    await user.click(getCheckbox('2')!);
    await user.click(getCheckbox('3')!);

    expect(getDoneElemExpandButton()).toBeVisible();
    expect(getDoneElemExpandButton()).toHaveTextContent('2 ukończonych elementów');

    expect(queryItemsList(true)).toHaveLength(2);
    expect(queryItemsList(true)?.[0]).toBeVisible();


    expect(queryItemsList(true)).toHaveLength(2)
    expect(queryItemsList(false)).toHaveLength(3);

    expect(getCheckbox('1')).toHaveProperty('checked', false);
    expect(getCheckbox('2')).toHaveProperty('checked', true);
    expect(getCheckbox('3')).toHaveProperty('checked', true);
    expect(getCheckbox('4')).toHaveProperty('checked', false);
  });

  it('should remove separate list in card when no checked items', async () => {
    await user.click(getCheckbox('1'));
    await user.click(getCheckbox('4'));
    expect(queryItemsList(true)).toHaveLength(2);
    expect(queryItemsList(true)?.[0]).toBeVisible();
    expect(getDoneElemExpandButton()).toHaveTextContent('2 ukończonych elementów');

    expect(queryItemsList(true)).toHaveLength(2);
    expect(queryItemsList(false)).toHaveLength(3);

    await user.click(getCheckbox('1'));
    await user.click(getCheckbox('4'));
    expect(getDoneElemExpandButton()).not.toBeInTheDocument();

    expect(queryItemsList(true)).not.toBeInTheDocument();
    expect(queryItemsList(false)).toHaveLength(5);
    expect(queryItemsList(true)).not.toBeInTheDocument();
  });

  it('should remove separate list in card when no unchecked items', async () => {
    await user.click(getCheckbox('1'));
    await user.click(getCheckbox('2'));
    await user.click(getCheckbox('3'));
    await user.click(getCheckbox('4'));
    await user.click(document.body);

    expect(queryItemsList(true)).toHaveLength(4);
    expect(queryItemsList(true)?.[0]).toBeVisible();
    expect(queryItemsList(false)).not.toBeInTheDocument();
    expect(getDoneElemExpandButton()).toHaveTextContent('4 ukończonych elementów');

    await user.click(getCheckbox('1'));
    await user.click(getCheckbox('2'));
    await user.click(getCheckbox('3'));
    await user.click(getCheckbox('4'));

    expect(queryItemsList(true)).not.toBeInTheDocument();
    expect(queryItemsList(false)).toHaveLength(4);
  });

  it('should update element', async () => {
    await user.type(getListItemTextarea()[4], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(6);
    expect(getListItemTextarea()[4].value).toBe('Kup chleb');

    await user.click(getListItemTextarea()[2]);
    expect(getListItemTextarea()[2].value).toEqual('third el in First List');

    await user.clear(getListItemTextarea()[2]);
    await user.type(getListItemTextarea()[2], 'updated element');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await waitFor(() => expect(getListItemTextarea()).toHaveLength(5));
    expect(getListItemTextarea()[2].value).toEqual('updated element');
  });

  it('should hide and expand list with checked items', async () => {
    await user.click(getCheckbox('1'));
    await user.click(getCheckbox('2'));

    expect(getDoneElemExpandButton()).toBeInTheDocument();

    expect(queryItemsList(false)).toHaveLength(3);
    expect(queryItemsList(true)).toHaveLength(2);

    await user.click(getDoneElemExpandButton()!);

    expect(queryItemsList(true)).not.toBeInTheDocument();

    await user.click(getDoneElemExpandButton()!);

    expect(queryItemsList(true)).toHaveLength(2);
    expect(queryItemsList(true)?.[0]).toBeVisible();
  });

  it('should remove element with all descendants when delete button was clicked', async () => {
    expect(getListItemTextarea('1')).toHaveLength(4);

    await user.hover(getListItemTextarea('1')[0]);
    expect(getDeleteButton(0, '1')).toBeVisible();

    await user.click(getDeleteButton(0, '1')!);

    expect(getListItemTextarea('1')).toHaveLength(1);
  });
});
