import { screen, within } from '@testing-library/react';

export const elements = {
  getCard: (cardId?: string) => screen.getByTestId(cardId ? `card-${cardId}` : 'card-empty'),
  getTitleEl: (id?: string) => within(elements.getCard(id)).queryByPlaceholderText('Title...'),
  getListItemTextarea: (id?: string) =>
    within(elements.getCard(id)).getAllByPlaceholderText('Create a list item...') as unknown as HTMLTextAreaElement[],
  queryListItemTextarea: (id?: string) =>
    within(elements.getCard(id)).queryAllByPlaceholderText('Create a list item...') as unknown as HTMLTextAreaElement[],
  getAddElButton: (id?: string) => within(elements.getCard(id)).getByRole('button', { name: 'Add list item' }),
  getDeleteButton: (index: number = 0, id?: string) => {
    const listElement = within(elements.getCard(id)).getAllByPlaceholderText('Create a list item...')?.[index]?.parentElement?.parentElement
    if (listElement) {
      return within(listElement).getByLabelText('Remove list item', {exact: false})
    } return null
  },
  getCheckbox: (checkboxId: string, id?: string) =>
    within(elements.getCard(id)).getByTestId(`list-item-${checkboxId}-checkbox`),
  queryCheckbox: (checkboxId: string, id?: string) =>
    within(elements.getCard(id)).queryByTestId(`list-item-${checkboxId}-checkbox`),
  getEditIndicator: (id: string = '0') => screen.queryByTestId(`card-${id}-edit-indicator`),
  getDoneElemExpandButton: (id?: string) =>
    within(elements.getCard(id)).queryByRole('button', { expanded: true }),
  queryItemsList: (isChecked: boolean, id: string = '0') => {
    const list = screen.queryByTestId(`card-${id}-${isChecked ? 'checkedItems' : 'uncheckedItems'}`)
    if (list) {
      return within(list).queryAllByPlaceholderText('Create a list item...') as HTMLUListElement[]
    }
    return null;
  },
  queryElByText: (text: string) => screen.queryAllByDisplayValue(text)
};

export const editedElements = {
  getEditCard: (id: string = '0') => screen.getByTestId(`card-${id}`),
  getTitleEl: (id: string = '0') => elements.getTitleEl(id),
  getListItemTextarea: (id: string = '0') => elements.getListItemTextarea(id),
  getAddElButton: (id: string = '0') => elements.getAddElButton(id),
  getDeleteButton: (index: number = 0, id: string = '0') => elements.getDeleteButton(index, id),
  getCheckbox: (checkboxId: string, id: string = '0') => elements.getCheckbox(checkboxId, id),
  queryCheckbox: (checkboxId: string, id: string = '0') => elements.queryCheckbox(checkboxId, id),
  getEditIndicator: (id: string = '0') => elements.getEditIndicator(id),
  getDoneElemExpandButton: (id: string = '0') => elements.getDoneElemExpandButton(id),
  queryEditCard: (id: string = '0') => screen.queryByTestId(`card-${id}`),
  queryItemsList: (isChecked: boolean, id: string = '0') => elements.queryItemsList(isChecked, id),
  queryMenuButton: (open: boolean, id: string = '0') => within(editedElements.getEditCard(id)).queryByLabelText(open ? 'close menu' : 'open menu'),
  queryMenuPopover: (id: string = '0') => screen.queryByTestId(`${id}-menu`),
  queryMenuCardButtons: (buttonText: string, id: string = '0') => {
    const dropdown = editedElements.queryMenuPopover(id)
    if (dropdown) {
      return within(dropdown).getByLabelText(buttonText)
    }
  },
  queryLoadingSpinner: (id: string = '0') => screen.queryByTestId(`${id}-spinner`)
}