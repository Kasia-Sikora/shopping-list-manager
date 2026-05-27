import { describe, expect, it } from "vitest";
import { cleanup, render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from '../../App';
import { editCardElem } from "./utils";
import type { List } from "../../interfaces";
import { useStore } from '../../stores/store'

const initialState = useStore.getState();

describe('<App>', () => {
  const user = userEvent.setup()
  const { getEditCard, getEditIndicator, getTitleEl, getListItems, getListItemTextarea, queryCheckbox, getAddElButton, getDeleteButton, getCheckbox, checkedItemsList, uncheckedItemsList, getDoneElemExpandButton } = editCardElem

  const defaultStoreState = [{
    id: "0", title: "First Card", content: [{
      listItemId: "1",
      value: "first el in First List",
      checked: false
    }, {
      listItemId: "2",
      value: "second el in First List",
      checked: false
    }, {
      listItemId: "3",
      value: "third el in First List",
      checked: false
    }, {
      listItemId: "4",
      value: "fourth el in First List",
      checked: false
    }]
  }] as List[]

  const prepareComponent = async () => {
    useStore.setState({
      ...initialState, items: defaultStoreState
    })

    render(<App />)
    await waitFor(() => expect(getEditCard()).toBeVisible)

    await user.click(getEditCard())
    expect(getListItemTextarea()[3]).toBeVisible()
    await user.type(getListItemTextarea()[3], '{enter}')
    expect(getListItemTextarea()[4]).toBeVisible()
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanup();
    useStore.setState(initialState, true)
    await prepareComponent()
  })

  it('should create new line when Enter key was hit', async () => {
    await user.type(getListItemTextarea()[4], 'Kup chleb{enter}')

    expect(getListItems()).toHaveLength(6)
  })

  it('should create new line when "+ Element List" button was clicked', async () => {

    expect(getListItems()).toHaveLength(5)

    expect(getAddElButton()).toBeInTheDocument()
    await user.click(getAddElButton())

    expect(getListItems()).toHaveLength(6)
  })

  it('should save list when Enter + Shift keys was hit', async () => {

    await user.type(getListItemTextarea()[4], 'Kup chleb{Enter}')
    expect(getListItems()).toHaveLength(6)

    expect(getListItemTextarea()[5]).toBeVisible()
    await user.type(getListItemTextarea()[5], 'Kup mleko{Enter}')
    expect(getListItems()).toHaveLength(7)

    expect(getListItemTextarea()[6]).toBeVisible()
    await user.type(getListItemTextarea()[6], '{Shift>}{Enter}{/Shift}')

    //After Enter+Shift cardContent should be saved and cleared
    expect(getListItems()).toHaveLength(6)
  })

  it('should move trough list using arrow up and down', async () => {

    await user.click(getListItemTextarea()[4])
    expect(getListItemTextarea()[4]).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getListItemTextarea()[3]).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getListItemTextarea()[2]).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getListItemTextarea()[1]).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getListItemTextarea()[0]).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getTitleEl()).toHaveFocus()

    await user.keyboard('{arrowup}')
    expect(getTitleEl()).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[0]).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[1]).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[2]).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[3]).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[4]).toHaveFocus()

    await user.keyboard('{arrowdown}')
    expect(getListItemTextarea()[4]).toHaveFocus()
  })

  it('should remove element when delete button was clicked', async () => {
    expect(getListItems()).toHaveLength(5)

    await user.hover(getListItems()[0])
    expect(getDeleteButton()).toBeVisible()

    await user.click(getDeleteButton(1))

    expect(getListItems()).toHaveLength(4)
  })

  it('should save data when user clicked outside card', async () => {
    expect(getListItemTextarea()[4]).toBeVisible()
    await user.type(getListItemTextarea()[4], 'Kup mleko{Enter}')
    expect(getListItems()).toHaveLength(6)

    expect(getListItemTextarea()[5]).toBeVisible()
    await user.type(getListItemTextarea()[5], 'Kup jaja')
    await user.click(document.body)

    //After click outside the card, cardContent should be saved and cleared
    expect(getListItems()).toHaveLength(6)
  })

  it('should not save data when listItem is empty', async () => {
    expect(getListItems()).toHaveLength(5)
    await user.keyboard('{enter}{enter}{enter}{enter}{enter}{enter}{enter}')
    expect(getListItems()).toHaveLength(12)
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', "true")
    expect(getListItems()).toHaveLength(4)
  })


  it('should create separate list in card with checked items', async () => {

    expect(checkedItemsList()).not.toBeInTheDocument()
    expect(uncheckedItemsList()).toBeVisible()
    expect(getListItems()).toHaveLength(5)
    expect(queryCheckbox('0', '5')).toBeNull()

    await user.click(getCheckbox("0", "2")!)
    await user.click(getCheckbox("0", "3")!)

    expect(getDoneElemExpandButton()).toBeVisible()
    expect(getDoneElemExpandButton()).toHaveTextContent('2 ukończonych elementów')

    expect(checkedItemsList()).toBeVisible()
    expect(checkedItemsList()?.children).toHaveLength(2)
    expect(uncheckedItemsList()?.children).toHaveLength(3)

    expect(getCheckbox("0", "1")).toHaveProperty("checked", false)
    expect(getCheckbox("0", "2")).toHaveProperty("checked", true)
    expect(getCheckbox("0", "3")).toHaveProperty("checked", true)
    expect(getCheckbox("0", "4")).toHaveProperty("checked", false)
  })

  it('should remove separate list in card when no checked items', async () => {
    await user.click(getCheckbox("0", "1"))
    await user.click(getCheckbox("0", "4"))
    expect(checkedItemsList()).toBeVisible()
    expect(getDoneElemExpandButton()).toHaveTextContent('2 ukończonych elementów')

    expect(checkedItemsList()?.children).toHaveLength(2)
    expect(uncheckedItemsList()?.children).toHaveLength(3)

    await user.click(getCheckbox("0", "1"))
    await user.click(getCheckbox("0", "4"))
    expect(getDoneElemExpandButton()).not.toBeInTheDocument()

    expect(checkedItemsList()).not.toBeInTheDocument()
    expect(uncheckedItemsList()?.children).toHaveLength(5)
    expect(checkedItemsList()).not.toBeInTheDocument()
  })

  it('should remove separate list in card when no unchecked items', async () => {
    await user.click(getCheckbox("0", "1"))
    await user.click(getCheckbox("0", "2"))
    await user.click(getCheckbox("0", "3"))
    await user.click(getCheckbox("0", "4"))
    await user.click(document.body)

    expect(checkedItemsList()).toBeVisible()
    expect(uncheckedItemsList()).not.toBeInTheDocument()
    expect(getDoneElemExpandButton()).toHaveTextContent('4 ukończonych elementów')

    await user.click(getCheckbox("0", "1"))
    await user.click(getCheckbox("0", "2"))
    await user.click(getCheckbox("0", "3"))
    await user.click(getCheckbox("0", "4"))

    expect(checkedItemsList()).not.toBeInTheDocument()
    expect(uncheckedItemsList()?.children).toHaveLength(4)
    expect(checkedItemsList()).not.toBeInTheDocument()
  })

  it('should update element', async () => {
    await user.type(getListItemTextarea()[4], 'Kup chleb{Enter}')
    expect(getListItemTextarea()).toHaveLength(6)
    expect(getListItemTextarea()[4].value).toBe('Kup chleb')

    await user.click(getListItemTextarea()[2])
    expect(getListItemTextarea()[2].value).toEqual("third el in First List")

    await user.clear(getListItemTextarea()[2])
    await user.type(getListItemTextarea()[2], "updated element")
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(getListItems()).toHaveLength(5)
    expect(getListItemTextarea()[2].value).toEqual('updated element')
  })

  it('should hide and expand list with checked items', async () => {
    await user.click(getCheckbox("0", "1"))
    await user.click(getCheckbox("0", "2"))

    expect(getDoneElemExpandButton()).toBeInTheDocument()

    expect(uncheckedItemsList()?.children).toHaveLength(3)
    expect(checkedItemsList()?.children).toHaveLength(2)

    await user.click(getDoneElemExpandButton()!)

    expect(checkedItemsList()).not.toBeInTheDocument()

    await user.click(getDoneElemExpandButton()!)

    expect(checkedItemsList()).toBeVisible()
    expect(checkedItemsList()?.children).toHaveLength(2)
  })
})