import { screen, within } from '@testing-library/react'


export const emptyCardElem = {
  getCard: () => screen.getByTestId('empty-card'),
  getTitleEl: () => within(emptyCardElem.getCard()).queryByPlaceholderText('Tytuł...'),
  getListItemTextarea: () => within(emptyCardElem.getCard()).getAllByPlaceholderText('Utwórz listę...') as unknown as HTMLTextAreaElement[],
  getListItems: () => within(emptyCardElem.getCard()).getAllByRole('listitem'),
  getAddElButton: () => within(emptyCardElem.getCard()).getByRole('button', { name: '+ Element listy' }),
  getDeleteButton: (index: number = 0) => within(emptyCardElem.getListItems()[index]).getByLabelText("Delete"),
}

export const editCardElem = {
  queryEditCard: (id: string = "0") => screen.queryByTestId(`card-${id}`),
  getEditCard: (id: string = "0") => screen.getByTestId(`card-${id}`),
  getTitleEl: (id: string = "0") => within(editCardElem.getEditCard(id)).queryByPlaceholderText('Tytuł...'),
  getListItemTextarea: (id: string = "0") => within(editCardElem.getEditCard(id)).getAllByPlaceholderText('Utwórz listę...') as unknown as HTMLTextAreaElement[],
  getListItems: (id: string = "0") => within(editCardElem.getEditCard(id)).getAllByRole('listitem'),
  getAddElButton: (id: string = "0") => within(editCardElem.getEditCard(id)).getByRole('button', { name: '+ Element listy' }),
  getDeleteButton: (index: number = 0) => within(editCardElem.getListItems()[index]).getByLabelText("Delete"),
  getCheckbox: (id: string = "0", checkboxId: string) => within(editCardElem.getEditCard(id)).getByTestId(`list-item-${checkboxId}-checkbox`),
  queryCheckbox: (id: string = "0", checkboxId: string) => within(editCardElem.getEditCard(id)).queryByTestId(`list-item-${checkboxId}-checkbox`),
  getEditIndicator: (id: string = "0") => screen.queryByTestId(`card-${id}-edit-indicator`),
  getDoneElemExpandButton: (id: string = "0") => within(editCardElem.getEditCard(id)).queryByText('ukończonych elementów', {exact: false}),
  uncheckedItemsList: (id: string = "0") => within(editCardElem.getEditCard(id)).queryByTestId("uncheckedItems"),
  checkedItemsList: (id: string = "0") => within(editCardElem.getEditCard(id)).queryByTestId("checkedItems")
}
