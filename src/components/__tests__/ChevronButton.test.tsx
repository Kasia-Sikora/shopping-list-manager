import { render, screen, waitFor } from "@testing-library/react"
import { ChevronButton } from "../atoms/ChevronButton"
import { useLocaleStore } from "../../stores/store"

const props = {
  contentExpanded: true,
  quantity: 2,
  toggle: vi.fn()
}

describe('Chevron button', () => {
  describe('English Locale', () => {
    it('should display default expanded button with aria-expanded set to true', async () => {
      render(<ChevronButton {...props} />)

      await waitFor(() => expect(chevronButton()).toBeVisible())
      expect(chevronButton()).toHaveAttribute('aria-expanded', "true")
    })

    it('should display closed button with aria-expanded set to false when prop set to false', async () => {
      render(<ChevronButton {...props} contentExpanded={false} />)

      await waitFor(() => expect(chevronButton(false)).toBeVisible())
      expect(chevronButton(false)).toHaveAttribute('aria-expanded', "false")
    })

    it.each`
    quantity | label
    ${0}| ${'0 done items'}
    ${1}| ${'1 done item'}
    ${2}| ${'2 done items'}
    `('should display proper $label label for English locale with given $quantity quantity', async ({ quantity, label }) => {
      render(<ChevronButton {...props} quantity={quantity} />)

      await waitFor(() => expect(chevronButton()).toBeVisible())
      expect(chevronButton()).toHaveTextContent(label)
    })
  })

  describe('Polish Locale', () => {

    beforeEach(() => {
      useLocaleStore.getState().setLang("pl")
    })

    it.each`
    quantity | label
    ${0}| ${'0 ukończonych elementów'}
    ${1}| ${'1 ukończony element'}
    ${2}| ${'2 ukończone elementy'}
    ${15}| ${'15 ukończonych elementów'}
    `('should display proper $label label for Polish locale with given $quantity quantity', async ({ quantity, label }) => {
      render(<ChevronButton {...props} quantity={quantity} />)

      await waitFor(() => expect(chevronButton()).toBeVisible())
      expect(chevronButton()).toHaveTextContent(label)
    })
  })
})

const chevronButton = (open: boolean = true) => screen.queryByRole('button', { expanded: open })