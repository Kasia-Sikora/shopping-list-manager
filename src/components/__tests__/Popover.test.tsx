import { render, screen, waitFor } from "@testing-library/react"
import Popover from "../atoms/Popover"
import { usePopoverIdStore } from "../../stores/store"

const popoverId = 'test-id'
const children = <div>Some Text</div>
const props = { placementStyles: {}, children: children, id: popoverId }

describe('Popover', () => {

  it('renders its children when open', async () => {
    usePopoverIdStore.getState().setOpenPopoverId(popoverId)
    render(<Popover {...props} />)

    await waitFor(() => expect(screen.getByTestId(popoverId)).toBeInTheDocument())
    expect(getPopover()).not.toHaveClass('hidden')
  })

  it('hides its children when closed', async () => {
    usePopoverIdStore.getState().closePopover()
    render(<Popover {...props} />)

    await waitFor(() => expect(screen.getByTestId(popoverId)).toBeInTheDocument())
     expect(getPopover()).toHaveClass('hidden')
  })
})

const getPopover = () => screen.getByTestId(popoverId)