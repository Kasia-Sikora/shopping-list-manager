import { render, screen, waitFor } from "@testing-library/react"
import LanguageSwitcher from "../atoms/LanguageSwitcher"
import { useLocaleStore } from "../../stores/store"
import userEvent from "@testing-library/user-event"

describe('LanguageSwitcher', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    useLocaleStore.getState().setLang('en')
  })

  it('should not be selected as a default', async () => {

    useLocaleStore.getState().lang = undefined
    render(<LanguageSwitcher />)

    const radioEnLabel = screen.getByText('EN')
    await waitFor(() => expect(radioEnLabel).toBeVisible())
    const inputs = screen.getAllByRole("radio")
    expect(inputs[0]).not.toBeChecked()
    expect(inputs[1]).not.toBeChecked()
  })

  it('marks the current language as the checked radio', async () => {
    useLocaleStore.getState().setLang('en')
    render(<LanguageSwitcher />)
    const radioEnLabel = screen.getByText('EN')
    await waitFor(() => expect(radioEnLabel).toBeVisible())

    const inputs = screen.getAllByRole("radio")
    expect(inputs[0]).toHaveAccessibleName('EN')
    expect(inputs[0]).toBeChecked()
    expect(inputs[1]).toHaveAccessibleName('PL')
    expect(inputs[1]).not.toBeChecked()
  })      // Assert the input for lang is checked

  it('calls setLang when the other language is selected', async () => {

    render(<LanguageSwitcher />)
    const radioEnLabel = screen.getByText('EN')
    await waitFor(() => expect(radioEnLabel).toBeVisible())

    const inputs = screen.getAllByRole("radio")
    expect(inputs[0]).toHaveAccessibleName('EN')
    expect(inputs[0]).toBeChecked()
    expect(inputs[1]).toHaveAccessibleName('PL')
    expect(inputs[1]).not.toBeChecked()

    await user.click(inputs[1])
    expect(useLocaleStore.getState().lang).toBe('pl')
  })

  it('moves selection with arrow keys', async () => {
    render(<LanguageSwitcher />)
    const radioEnLabel = screen.getByText('EN')
    await waitFor(() => expect(radioEnLabel).toBeVisible())

    const inputs = screen.getAllByRole("radio")
    await user.click(inputs[1])
    expect(inputs[0]).not.toHaveFocus()
    expect(inputs[1]).toHaveFocus()

    await user.keyboard('{arrowleft}')
    expect(inputs[0]).toHaveFocus()
    expect(inputs[1]).not.toHaveFocus()

    await user.keyboard('{arrowright}')
    expect(inputs[0]).not.toHaveFocus()
    expect(inputs[1]).toHaveFocus()
  })
})