import { describe, expect, it } from "vitest";
import { render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from '../../App';
import { emptyCardElem } from "./utils";
import { useStore } from '../../stores/store'

const initialState = useStore.getState();

describe('<App>', () => {

  const { getCard, getTitleEl, getListItems, getListItemTextarea, getAddElButton, getDeleteButton } = emptyCardElem
  const prepareComponent = async () => {
    render(<App />)
    expect(getCard()).toBeVisible()
    expect(getTitleEl()).toBeNull()
    expect(getListItemTextarea()[0]).not.toBeNull()

    await userEvent.click(getCard())

    expect(getTitleEl()).toBeVisible()

    await userEvent.click(getListItemTextarea()[0])
    expect(getListItemTextarea()[0]).toHaveFocus()
  }

  beforeEach(async () => {
    useStore.setState({ ...initialState, items: [] }, true);
    await prepareComponent()
  })

  it('should create new line when Enter key was hit', async () => {

    userEvent.type(getListItemTextarea()[0], 'Kup chleb{enter}')

    await waitFor(() => expect(getListItems()).toHaveLength(2))
  })

  it('should create new line when "+ Element Listy" button was clicked', async () => {

    userEvent.type(getListItemTextarea()[0], 'Kup chleb')
    await waitFor(() => expect(getListItems()).toHaveLength(1))

    expect(getAddElButton()).toBeInTheDocument()
    userEvent.click(getAddElButton())

    await waitFor(() => expect(getListItems()).toHaveLength(2))
  })

  it('should save list when Enter + Shift keys was hit', async () => {

    userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(2))

    expect(getListItemTextarea()[1]).toBeVisible()
    userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(3))

    expect(getListItemTextarea()[2]).toBeVisible()
    userEvent.type(getListItemTextarea()[2], '{Shift>}{Enter}{/Shift}')

    //After Enter+Shift cardContent should be saved and cleared
    await waitFor(() => expect(getListItems()).toHaveLength(1))
    expect(getListItemTextarea()[0].value).toEqual('')
  })

  it('should move trough list using arrow up and down', async () => {
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(2))

    expect(getListItemTextarea()[1]).toBeVisible()
    await userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(3))
    expect(getListItemTextarea()[2]).toHaveFocus()

    await userEvent.keyboard('{arrowup}')
    await waitFor(() => expect(getListItemTextarea()[1]).toHaveFocus())

    await userEvent.keyboard('{arrowup}')
    await waitFor(() => expect(getListItemTextarea()[0]).toHaveFocus())

    await userEvent.keyboard('{arrowup}')
    await waitFor(() => expect(getTitleEl()).toHaveFocus())

    await userEvent.keyboard('{arrowup}')
    await waitFor(() => expect(getTitleEl()).toHaveFocus())

    await userEvent.keyboard('{arrowdown}')
    await waitFor(() => expect(getListItemTextarea()[0]).toHaveFocus())

    await userEvent.keyboard('{arrowdown}')
    await waitFor(() => expect(getListItemTextarea()[1]).toHaveFocus())

    await userEvent.keyboard('{arrowdown}')
    await waitFor(() => expect(getListItemTextarea()[2]).toHaveFocus())

    await userEvent.keyboard('{arrowdown}')
    await waitFor(() => expect(getListItemTextarea()[2]).toHaveFocus())
  })

  it('should remove element when delete button was clicked', async () => {

    await waitFor(() => expect(getListItems()).toHaveLength(1))
    await userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(2))
    await waitFor(() => expect(getListItemTextarea()[0].value).toBe('Kup chleb'))

    userEvent.hover(getListItems()[0])
    await waitFor(() => expect(getDeleteButton()).toBeVisible())

    userEvent.click(getDeleteButton(1))

    await waitFor(() => expect(getListItems()).toHaveLength(1))
  })

  it('should save data when user clicked outside card', async () => {
    userEvent.type(getListItemTextarea()[0], 'Kup chleb{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(2))

    expect(getListItemTextarea()[1]).toBeVisible()
    userEvent.type(getListItemTextarea()[1], 'Kup mleko{Enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(3))

    expect(getListItemTextarea()[2]).toBeVisible()
    userEvent.click(document.body)

    //After click outside the card, cardContent should be saved and cleared
    await waitFor(() => expect(getListItems()).toHaveLength(1))
    expect(getListItemTextarea()[0].value).toEqual('')
  })

  it('should not save data when listItem is empty', async () => {
    expect(getListItems()).toHaveLength(1)
    userEvent.keyboard('{enter}{enter}{enter}{enter}{enter}{enter}{enter}')
    await waitFor(() => expect(getListItems()).toHaveLength(8))
    userEvent.keyboard('{Shift>}{Enter}{/Shift}')
    await waitFor(() => expect(getListItems()).toHaveLength(1))
    expect(getListItemTextarea()[0].value).toEqual('')
  })
})