import { cleanup, render, waitFor } from "@testing-library/react"
import Card from "../Card"
import { editedElements, elements } from "./testHelpers"
import userEvent from "@testing-library/user-event"
import App from "../../App"
import type { PersistedShoppingListStore } from "../../interfaces"
import * as db from '../../services/indexedDB'

const { getEditCard, getListItemTextarea, queryMenuButton, queryMenuDropdown, queryMenuCardButtons, queryEditCard } = editedElements
const { queryElByText, queryItemsList } = elements

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
            checked: true,
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
            checked: true,
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
            value: 'first el in Second List',
            checked: true,
            depth: 0,
            parentId: null
          },
          {
            id: '2',
            value: 'second el in Second List',
            checked: false,
            depth: 0,
            parentId: null
          },
          {
            id: '3',
            value: 'third el in Second List',
            checked: true,
            depth: 0,
            parentId: null
          },
          {
            id: '4',
            value: 'fourth el in Second List',
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

const dopdownOpen = true
const dopdownClosed = false

describe('Menu button functionality', () => {
  const user = userEvent.setup()

  it('should display button and not display menu dropdown', () => {
    render(<Card editedList={defaultStoreState.state.lists[0]} />)

    const isDropdownOpen = false
    expect(getEditCard()).toBeVisible()
    expect(queryMenuButton(isDropdownOpen)).toBeVisible()
    expect(queryMenuDropdown()).toHaveClass("hidden")
  })

  it('should display menu dropdown on button click', async () => {
    render(<Card editedList={defaultStoreState.state.lists[0]} />)

    expect(getEditCard()).toBeVisible()
    expect(queryMenuButton(dopdownClosed)).toBeVisible()
    expect(queryMenuDropdown()).toHaveClass("hidden")

    await user.click(queryMenuButton(dopdownClosed)!)
    expect(queryMenuButton(dopdownOpen)).toBeVisible()
    expect(queryMenuDropdown()).not.toHaveClass("hidden")
  })
})

describe('<App/> dropdown buttons functionality', () => {
  const user = userEvent.setup()

  const prepareComponent = async () => {

    render(<App />);
    await waitFor(() => expect(getEditCard(defaultStoreState.state.lists[0].id)).toBeVisible());

    await user.click(getEditCard());
    expect(getListItemTextarea()[3]).toBeVisible();
    //first unchecked than checked, so lat one is 'third element'
    expect(getListItemTextarea()[3].value).toEqual('third el in First List');
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

  it('should delete card', async () => {
    expect(getEditCard()).toBeVisible()
    expect(getEditCard('1')).toBeVisible()

    await user.click(queryMenuButton(dopdownClosed)!)
    expect(queryMenuButton(dopdownOpen)).not.toHaveClass('hidden')
    expect(queryMenuCardButtons('delete card')).toBeVisible()

    await user.click(queryMenuCardButtons('delete card')!)
    expect(queryEditCard()).not.toBeInTheDocument()
    expect(queryEditCard('1')).toBeVisible()
  })

  it('should copy card', async () => {
    expect(getEditCard()).toBeVisible()
    expect(getEditCard('1')).toBeVisible()

    await user.click(queryMenuButton(dopdownClosed)!)
    expect(queryMenuButton(dopdownOpen)).not.toHaveClass('hidden')
    expect(queryMenuCardButtons('copy card')).toBeVisible()
    expect(queryElByText('second el in First List')).toHaveLength(1)

    await user.click(queryMenuCardButtons('copy card')!)
    await waitFor(() => expect(queryMenuButton(dopdownClosed)).toBeVisible())
    expect(queryMenuDropdown()).toHaveClass("hidden")
    expect(queryElByText('second el in First List')).toHaveLength(2)
  })

  it('should remove checked items from card', async () => {
    expect(getEditCard()).toBeVisible()
    expect(getEditCard('1')).toBeVisible()

    await user.click(queryMenuButton(dopdownClosed)!)
    expect(queryMenuButton(dopdownOpen)).not.toHaveClass('hidden')
    expect(queryMenuCardButtons('delete all checked items')).toBeVisible()
    expect(queryItemsList(true)).toHaveLength(2)
    expect(queryItemsList(false)).toHaveLength(2)


    await user.click(queryMenuCardButtons('delete all checked items')!)
    expect(queryMenuButton(dopdownClosed)).toBeVisible()
    expect(queryMenuDropdown()).toHaveClass("hidden")
    expect(queryItemsList(true)).not.toBeInTheDocument()
    expect(queryItemsList(false)).toHaveLength(2)
  })
})