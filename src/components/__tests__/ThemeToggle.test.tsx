import { render, screen, waitFor, within } from "@testing-library/react"
import ThemeToggle from "../atoms/ThemeToggle"
import { useThemeStore } from "../../stores/store"
import userEvent from "@testing-library/user-event"

describe('ThemeToggle', () => {
  const user = userEvent.setup()
  it('reflects the current theme in its checked state', async () => {
    useThemeStore.getState().setTheme('light')
    render(<ThemeToggle />)

    await waitFor(() => expect(getToggleLabel()).toBeVisible())
    expect(getToggleLabel()).toHaveAttribute('aria-label', 'light mode')
    expect(getInput()).toBeChecked()
  })

  it('flips the theme when toggled', async () => {
    useThemeStore.getState().setTheme('light')
    render(<ThemeToggle />)

    await waitFor(() => expect(getToggleLabel()).toBeVisible())
    expect(getToggleLabel()).toHaveAttribute('aria-label', 'light mode')

    await user.click(getInput())

    expect(getToggleLabel()).toHaveAttribute('aria-label', 'dark mode')
  })
})

const getToggleLabel = () => screen.getByTestId('theme-toggle')
const getInput = () => within(getToggleLabel()).getByRole("checkbox")