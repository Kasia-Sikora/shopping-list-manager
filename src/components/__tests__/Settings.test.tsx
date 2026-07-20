import { render, screen, waitFor } from "@testing-library/react"
import SettingsButton from "../atoms/SettingsButton"
import userEvent from "@testing-library/user-event"
import { usePopoverIdStore } from "../../stores/store"

describe('SettingsButton', () => {
  const user = userEvent.setup()

  it('renders the popover hidden by default', async () => {
    render(<SettingsButton />)

    await waitFor(() => expect(getSettingsButton()).toBeVisible())
    expect(getPopover()).toHaveClass('hidden')
    expect(getSettingsButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the popover when the cogwheel is clicked', async () => {
    render(<SettingsButton />)

    await waitFor(() => expect(getSettingsButton()).toBeVisible())
    expect(getPopover()).toHaveClass('hidden')

    await user.click(getSettingsButton())

    await waitFor(() => expect(getPopover()).not.toHaveClass('hidden'))
    expect(getSettingsButton()).toHaveAttribute('aria-expanded', 'true')
    expect(getThemeSwitcher()).toBeVisible()
  })

  it('closes the popover when Escape is pressed', async () => {
    usePopoverIdStore.getState().setOpenPopoverId("settings")
    render(<SettingsButton />)

    await waitFor(() => expect(getSettingsButton()).toBeVisible())
    expect(getPopover()).not.toHaveClass('hidden')

    await user.keyboard('{Escape}')

    expect(getPopover()).toHaveClass('hidden')
    expect(getSettingsButton()).toHaveFocus()
  })

  it('closes the popover when clicking outside it', async () => {
    usePopoverIdStore.getState().setOpenPopoverId("settings")
    render(<SettingsButton />)

    await waitFor(() => expect(getSettingsButton()).toBeVisible())
    expect(getPopover()).not.toHaveClass('hidden')

    await user.click(document.body)

    expect(getPopover()).toHaveClass('hidden')
    expect(getSettingsButton()).not.toHaveFocus()
  })

  const getSettingsButton = () => screen.getByRole('button', { name: 'Settings' })
  const getPopover = () => screen.getByTestId('settings')
  const getThemeSwitcher = () => screen.getByTestId('theme-toggle')
})

