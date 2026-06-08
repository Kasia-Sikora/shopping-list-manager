import { cleanup, render, waitFor } from "@testing-library/react"
import Card from "../Card"
import { editedElements, elements } from "./testHelpers"
import userEvent from "@testing-library/user-event"
import { LOCAL_STORAGE_STORE_KEY } from "../../consts"
import App from "../../App"

const { getEditCard, getListItemTextarea, queryMenuButton, queryMenuDropdown, queryMenuCardButtons, queryEditCard } = editedElements
const { queryElByText, queryItemsList } = elements

const defaultStoreState = {
  state: {
    items: [
      {
        id: '0',
        title: 'First Card',
        content: [
          {
            listItemId: '1',
            value: 'first el in First List',
            checked: true,
          },
          {
            listItemId: '2',
            value: 'second el in First List',
            checked: false,
          },
          {
            listItemId: '3',
            value: 'third el in First List',
            checked: true,
          },
          {
            listItemId: '4',
            value: 'fourth el in First List',
            checked: false,
          },
        ],
      },
      {
        id: '1',
        title: 'Second Card',
        content: [
          {
            listItemId: '1',
            value: 'first el in Second List',
            checked: true,
          },
          {
            listItemId: '2',
            value: 'second el in Second List',
            checked: false,
          },
          {
            listItemId: '3',
            value: 'third el in Second List',
            checked: true,
          },
          {
            listItemId: '4',
            value: 'fourth el in Second List',
            checked: false,
          },
        ],
      },
    ]
  }
}

const dopdownOpen = true
const dopdownClosed = false

describe('Menu button functionality', () => {
  const user = userEvent.setup()

  it('should display button and not display menu dropdown', () => {
    render(<Card editedItem={defaultStoreState.state.items[0]} />)

    const isDropdownOpen = false
    expect(getEditCard()).toBeVisible()
    expect(queryMenuButton(isDropdownOpen)).toBeVisible()
    expect(queryMenuDropdown()).toHaveClass("hidden")
  })

  it('should display menu dropdown on button click', async () => {
    render(<Card editedItem={defaultStoreState.state.items[0]} />)

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
    const dataToLoad = JSON.stringify(defaultStoreState)
    localStorage.setItem(LOCAL_STORAGE_STORE_KEY, dataToLoad)

    render(<App />);
    expect(localStorage.getItem(LOCAL_STORAGE_STORE_KEY)).not.toBeNull()
    await waitFor(() => expect(getEditCard(defaultStoreState.state.items[0].id)).toBeVisible());

    await user.click(getEditCard());
    expect(getListItemTextarea()[3]).toBeVisible();
    //first unchecked than checked, so lat one is 'third element'
    expect(getListItemTextarea()[3].value).toEqual('third el in First List');
  };


  beforeEach(async () => {
    vi.clearAllMocks();
    cleanup();
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
    expect(queryMenuButton(dopdownClosed)).toBeVisible()
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