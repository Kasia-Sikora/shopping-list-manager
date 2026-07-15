import { render, screen, waitFor } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from '../../App';
import * as db from '../../services/indexedDB'
import userEvent from '@testing-library/user-event';
import { DEFAULT_VALUES, useStore } from '../../stores/store';
import { syncEngine } from '../../services/syncEngine';

describe('EmptyBoard', () => {
  const user = userEvent.setup()

  const loadApp = async () => {
    render(<App />)

    const button = await loadDatabutton()
    expect(button).toBeVisible()
  }

  it('renders the empty-state heading ("Nie masz jeszcze żadnych list")', async () => {
    await loadApp()
    expect(await emptyBoardHeader()).toBeVisible()
    expect(await hint()).toBeVisible()
  });

  it('adds the sample lists to the store and persists them on button click', async () => {
    await loadApp()
    const button = await loadDatabutton()
    expect(await db.getLists()).toHaveLength(0)

    await user.click(button)

    const card = await findCard()
    expect(card).toBeVisible()
    expect(card).toHaveTextContent(DEFAULT_VALUES[0].title)

    await waitFor(() => expect(useStore.getState().lists).toHaveLength(DEFAULT_VALUES.length))
    expect(useStore.getState().lists.map(l => l.title)).toContain(DEFAULT_VALUES[0].title)
    await waitFor(async () => expect(await db.getLists()).toHaveLength(DEFAULT_VALUES.length))
  });


  it('generates fresh ids for the sample lists and their items (no reused hardcoded ids)', async () => {
    await loadApp()
    const button = await loadDatabutton()
    const loadedLists = await db.getLists()
    expect(loadedLists).toHaveLength(0)

    await user.click(button)

    await waitFor(async () => expect((await db.getLists())).toHaveLength(DEFAULT_VALUES.length))
    expect((await db.getLists()).map(i => i.id)).not.toEqual(DEFAULT_VALUES.map(i => i.id))
    expect((await db.getLists()).map(i => i.content.map(x => x.id))).not.toEqual(DEFAULT_VALUES.map(i => i.content.map(x => x.id)))
  });

  it('kicks off a sync after loading the sample data', async () => {
    const spy = vi.spyOn(syncEngine, 'syncChanges')
    await loadApp()
    const button = await loadDatabutton()
    const loadedLists = await db.getLists()
    expect(loadedLists).toHaveLength(0)

    await user.click(button)
    await waitFor(() => expect(syncEngine.syncChanges).toHaveBeenCalled())
    spy.mockRestore()
  });

  it('logs an error when db throws', async () => {
    const insertListSpy = vi.spyOn(db, 'insertList').mockRejectedValueOnce(new Error("Failed to create list"))
    await loadApp()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const button = await loadDatabutton()

    await user.click(button)
    await waitFor(() => expect(console.error).toHaveBeenCalledWith("Failed to create list:", expect.any(Error)))
    insertListSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  });
});

describe('EmptyBoard — when it renders (App)', () => {
  it('renders when data is ready and there are no lists', async () => {
    render(<App />)

    expect(getLoadingCards()).toHaveLength(3)
    await waitFor(() => expect(queryLoadingCards()?.[0]).toBeUndefined())
    expect(await loadDatabutton()).toBeVisible()
    expect(await emptyBoardHeader()).toBeVisible()
    expect(await hint()).toBeVisible()
  });

  it('does not render while data is still loading (not ready)', async () => {
    render(<App />)

    expect(screen.getAllByTestId('loading-card')).toHaveLength(3)
    await waitFor(() => expect(queryLoadDatabutton()).not.toBeInTheDocument())
    await waitFor(async () => expect(await emptyBoardHeader()).toBeVisible())
  });

  it('does not render when at least one list exists', async () => {
    await db.insertList(DEFAULT_VALUES[0])

    render(<App />)

    expect(await findCard()).toBeInTheDocument()
    await waitFor(() => expect(queryLoadDatabutton()).not.toBeInTheDocument())
  });
});

const emptyBoardHeader = () => screen.findByText('Nie masz jeszcze żadnych list')
const hint = () => screen.findByText('Utwórz swoją pierwszą listę powyżej')
const loadDatabutton = () => screen.findByText('Załaduj przykładowe dane')
const findCard = (idx = 0) => screen.findByText(DEFAULT_VALUES[idx].title)
const queryLoadDatabutton = () => screen.queryByText('Załaduj przykładowe dane')
const getLoadingCards = () => screen.getAllByTestId('loading-card')
const queryLoadingCards = () => screen.queryAllByTestId('loading-card')