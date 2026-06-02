import { screen, within } from '@testing-library/react';

export const elements = {
  getCard: (cardId?: string) => screen.getByTestId(cardId ? `card-${cardId}` : 'card-empty'),
  getTitleEl: (id?: string) => within(elements.getCard(id)).queryByPlaceholderText('Tytuł...'),
  getListItemTextarea: (id?: string) =>
    within(elements.getCard(id)).getAllByPlaceholderText('Utwórz listę...') as unknown as HTMLTextAreaElement[],
  getAddElButton: (id?: string) => within(elements.getCard(id)).getByRole('button', { name: '+ Element listy' }),
  getDeleteButton: (index: number = 0, id?: string) => {
    const listElement = within(elements.getCard(id)).getAllByPlaceholderText('Utwórz listę...')?.[index]?.parentElement
    if (listElement) {
      return within(listElement).getByLabelText('Delete')
    } return null
  },
  getCheckbox: (checkboxId: string, id?: string) =>
    within(elements.getCard(id)).getByTestId(`list-item-${checkboxId}-checkbox`),
  queryCheckbox: (checkboxId: string, id?: string) =>
    within(elements.getCard(id)).queryByTestId(`list-item-${checkboxId}-checkbox`),
  getEditIndicator: (id: string = '0') => screen.queryByTestId(`card-${id}-edit-indicator`),
  getDoneElemExpandButton: (id?: string) =>
    within(elements.getCard(id)).queryByText('ukończonych elementów', { exact: false }),
  queryItemsList: (isChecked: boolean, id: string = '0') => {
    const list = screen.queryByTestId(`card-${id}-${isChecked ? 'checkedItems' : 'uncheckedItems'}`)
    if (list) {
      return within(list).queryAllByPlaceholderText('Utwórz listę...') as HTMLUListElement[]
    }
    return null;
  }
};

export const editedElements = {
  getEditCard: (id: string = '0') => screen.getByTestId(`card-${id}`),
  getTitleEl: (id: string = '0') => elements.getTitleEl(id),
  getListItemTextarea: (id: string = '0') => elements.getListItemTextarea(id),
  getAddElButton: (id: string = '0') => elements.getAddElButton(id),
  getDeleteButton: (index: number = 0, id: string = '0') =>  elements.getDeleteButton(index, id),
  getCheckbox: (checkboxId: string, id: string = '0') =>elements.getCheckbox(checkboxId, id),
  queryCheckbox: (checkboxId: string, id: string = '0') =>elements.queryCheckbox(checkboxId, id),
  getEditIndicator: (id: string = '0') => elements.getEditIndicator(id),
  getDoneElemExpandButton: (id: string = '0') =>elements.getDoneElemExpandButton(id),
  queryItemsList: (isChecked: boolean, id: string = '0') => elements.queryItemsList(isChecked, id),
}