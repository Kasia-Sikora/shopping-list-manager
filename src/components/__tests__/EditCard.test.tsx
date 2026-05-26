import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from '@testing-library/react'
import EditCard from '../EditCard';
import type { List } from "../../interfaces";
import userEvent from "@testing-library/user-event";

const exampleItem: List = {
  id: "1",
  type: 'list',
  title: 'list title',
  content: [{ listItemId: '333', checked: false, value: 'kup bułki' }]
}

describe('EditCard', () => {
  it('should display edit card in preview mode when item is provided', () => {
    render(<EditCard editedItem={exampleItem} />)

    //check if item is rendered with given data
    expect(getCard()).toBeVisible()
    expect(getTitleEl().textContent).toEqual('list title')
    expect(getListItem().textContent).toEqual('kup bułki')

    //check if card is in preview mode
    expect(getListParagraph()).toBeVisible();
    expect(getListParagraph().textContent).toBe('kup bułki')
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', "true")
    expect(getListTextarea()).not.toBeInTheDocument()
    expect(getAddElemButton()).not.toBeInTheDocument()
  })

  it('should switch between preview and edit mode', async () => {
    render(<EditCard editedItem={exampleItem} />)

    expect(getCard()).toBeVisible();
    //check if card is in preview mode
    expect(getListParagraph()).toBeVisible()
    expect(getListParagraph().textContent).toEqual('kup bułki')
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'true')
    expect(getListTextarea()).toBeNull()
    expect(getAddElemButton()).toBeNull()


    await userEvent.click(getCard() as Element)

    //check if card is in edit mode
    await waitFor(() => expect(getListTextarea()).not.toBeNull())
    expect(getListParagraph()).toBeNull()
    expect(getEditIndicator()).toHaveAttribute('aria-hidden', 'false')
    expect(getListTextarea().value).toEqual('kup bułki')
    expect(getAddElemButton()).toBeVisible()
    expect(getAddElemButton()?.textContent).toEqual('+ Element listy')
  })


  // it('should show title input when users clicks on card', async () => {
  //   render(<EditCard editedItem={exampleItem} />)
  //   expect(getTitleEl()).toBeNull()
  //   await userEvent.click(getCard())
  //   waitFor(() => expect(getTitleEl()).not.toBeNull())
  //   expect(getListItem()).not.toBeNull()
  // })
})

const getCard = (itemId: string = exampleItem.id) => screen.queryByTestId(`card-${itemId}`);
const getTitleEl = () => screen.getByRole('heading');
const getListItem = (index: number = 0) => screen.queryAllByRole('listitem')[index];
const getEditIndicator = (listId: string = exampleItem.id) => screen.queryByTestId(`card-${listId}-edit-indicator`)
const getListParagraph = (itemId: string = exampleItem.id) => screen.queryByTestId(`card-${itemId}-paragraph`) as unknown as HTMLParagraphElement
const getListTextarea = (itemId: string = exampleItem.id) => screen.queryByTestId(`card-${itemId}-textarea`) as unknown as HTMLTextAreaElement
const getAddElemButton = (itemId: string = exampleItem.id) => within(getCard(itemId)!).queryByRole('button', { name: '+ Element listy' })