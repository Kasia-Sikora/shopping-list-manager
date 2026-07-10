import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { elements } from './testHelpers';

describe('<App>', () => {
  const {getCard, getTitleEl, getListItemTextarea, getAddElButton, getDeleteButton} = elements
  const prepareComponent = async () => {
    render(<App />);
    
    expect(getCard()).toBeVisible();
    expect(getTitleEl()).toBeNull();
    expect(getListItemTextarea()[0]).not.toBeNull();

    await userEvent.click(getCard());

    expect(getTitleEl()).toBeVisible();

    await userEvent.click(getListItemTextarea()[0]);
    expect(getListItemTextarea()[0]).toHaveFocus();
  };

  beforeEach(async () => {
    await prepareComponent();
  });

  it('should create new line when Enter key was hit', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{enter}');

    expect(getListItemTextarea()).toHaveLength(2);
  });

  it('should create new line when "+ Element Listy" button was clicked', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb');
    expect(getListItemTextarea()).toHaveLength(1);

    expect(getAddElButton()).toBeInTheDocument();
    await userEvent.click(getAddElButton());

    expect(getListItemTextarea()).toHaveLength(2);
  });

  it('should save list when Enter + Shift keys was hit', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(2);

    expect(getListItemTextarea()[1]).toBeVisible();
    await userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}');
    expect(getListItemTextarea()).toHaveLength(3);

    expect(getListItemTextarea()[2]).toBeVisible();
    await userEvent.type(getListItemTextarea()[2], '{Shift>}{Enter}{/Shift}');

    //After Enter+Shift cardContent should be saved and cleared
    await waitFor(() => expect(getListItemTextarea()).toHaveLength(1));
    expect(getListItemTextarea()[0].value).toEqual('');
  });

  it('should move trough list using arrow up and down', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(2);

    expect(getListItemTextarea()[1]).toBeVisible();
    await userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}');
    expect(getListItemTextarea()).toHaveLength(3);
    await waitFor(() => expect(getListItemTextarea()[2]).toHaveFocus());

    await userEvent.keyboard('{arrowup}');
    expect(getListItemTextarea()[1]).toHaveFocus();

    await userEvent.keyboard('{arrowup}');
    expect(getListItemTextarea()[0]).toHaveFocus();

    await userEvent.keyboard('{arrowup}');
    expect(getTitleEl()).toHaveFocus();

    await userEvent.keyboard('{arrowup}');
    expect(getTitleEl()).toHaveFocus();

    await userEvent.keyboard('{arrowdown}');
    expect(getListItemTextarea()[0]).toHaveFocus();

    await userEvent.keyboard('{arrowdown}');
    expect(getListItemTextarea()[1]).toHaveFocus();

    await userEvent.keyboard('{arrowdown}');
    expect(getListItemTextarea()[2]).toHaveFocus();

    await userEvent.keyboard('{arrowdown}');
    expect(getListItemTextarea()[2]).toHaveFocus();
  });

  it('should remove element when delete button was clicked', async () => {
    expect(getListItemTextarea()).toHaveLength(1);
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(2);
    expect(getListItemTextarea()[0].value).toBe('Kup chleb');

    await userEvent.hover(getListItemTextarea()[0]);
    expect(getDeleteButton()).toBeVisible();

    await userEvent.click(getDeleteButton()!);

    expect(getListItemTextarea()).toHaveLength(1);
  });

  it('should save data when user clicked outside card', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}');
    expect(getListItemTextarea()).toHaveLength(2);

    expect(getListItemTextarea()[1]).toBeVisible();
    await userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}');
    expect(getListItemTextarea()).toHaveLength(3);

    expect(getListItemTextarea()[2]).toBeVisible();
    await userEvent.click(document.body);

    //After click outside the card, cardContent should be saved and cleared
    await waitFor(() => expect(getListItemTextarea()).toHaveLength(1));
    expect(getListItemTextarea()[0].value).toEqual('');
  });

  it('should not save data when listItem is empty', async () => {
    expect(getListItemTextarea()).toHaveLength(1);
    await userEvent.keyboard('{enter}{enter}{enter}{enter}{enter}{enter}{enter}');
    expect(getListItemTextarea()).toHaveLength(8);
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await waitFor(() => expect(getListItemTextarea()).toHaveLength(1));
    expect(getListItemTextarea()[0].value).toEqual('');
  });
});
