import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Card from '../Card';

describe('Card', () => {
  it('should display default card on page load', () => {
    render(<Card />)
    expect(getTitleEl()).toBeNull()
    expect(getListItem()).not.toBeNull()
  })

  it('should show title input when card is clicked', async () => {
    render(<Card />)
    expect(getTitleEl()).toBeNull()
    await userEvent.click(getCard())
    waitFor(() => expect(getTitleEl()).not.toBeNull())
    expect(getListItem()).not.toBeNull()
  })
})

const getCard = () => screen.getByTestId('empty-card');
const getTitleEl = () => screen.queryByPlaceholderText('Tytuł');
const getListItem = () => screen.getByPlaceholderText('Utwórz listę...');
