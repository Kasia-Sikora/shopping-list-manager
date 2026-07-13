import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from '../../App';
import { LOADING_CARDS } from '../../consts';
import LoadingBoard from '../LoadingBoard';

describe('LoadingBoard', () => {
  it('renders a skeleton card for each configured loading card', async () => {
    render(<LoadingBoard />)

    const skeletonCards = screen.getAllByTestId('loading-card')
    expect(skeletonCards).toHaveLength(LOADING_CARDS.length)
    expect(skeletonCards[1]).toBeVisible()
  });

  it('renders the configured number of skeleton item rows per card', () => {
    render(<LoadingBoard />)

    const skeletonCards = screen.getAllByTestId('loading-card')
    expect(skeletonCards).toHaveLength(LOADING_CARDS.length)

    for (let i = 0; i < skeletonCards.length; i++) {
      const itemsInCards = within(skeletonCards[i]).getAllByTestId('loading-card-item')
      expect(itemsInCards).toHaveLength(LOADING_CARDS[i].items)
    }
  });

  it('renders a title skeleton bar in each card', () => {
    render(<LoadingBoard />)
    const skeletonTitle = screen.getAllByTestId('loading-card-title')
    expect(skeletonTitle).toHaveLength(LOADING_CARDS.length)
  });

  it('keeps each skeleton item width stable across re-renders (no reshuffle)', () => {
    const { rerender } = render(<LoadingBoard />)
    const widths = screen.getAllByTestId('loading-card-item')?.map(i => i.style.width)

    rerender(<LoadingBoard />)
    const widthsAfterRender = screen.getAllByTestId('loading-card-item')?.map(i => i.style.width)
    expect(widths).toEqual(widthsAfterRender)
  });
});

describe('LoadingBoard — when it renders (App)', () => {
  it('renders while data is not yet ready', () => {
    render(<App />)

    const skeletonCards = screen.getAllByTestId('loading-card')
    expect(skeletonCards).toHaveLength(LOADING_CARDS.length)
    expect(skeletonCards[1]).toBeVisible()
  });

  it('stops rendering once data is ready (board or empty state takes over)', async () => {
    render(<App />)

    const skeletonCards = screen.getAllByTestId('loading-card')
    expect(skeletonCards).toHaveLength(LOADING_CARDS.length)
    expect(skeletonCards[1]).toBeVisible()

    await waitFor(() => expect(screen.queryAllByTestId('loading-card')).toEqual([]))
  });
})
