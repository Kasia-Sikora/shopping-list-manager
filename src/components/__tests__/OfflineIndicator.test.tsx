import { render, screen } from "@testing-library/react";
import { OfflineIndicator } from "../OfflineIndicator";
import { useLocaleStore, useSyncStore } from "../../stores/store";

describe('OfflineIndicator', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('should set default status to synced', () => {
    render(<OfflineIndicator loading={false} />)

    expect(getSyncIndicator()).toHaveTextContent('Saved')
    expect(getPillIcon()).toBeVisible()
    expect(getOfflineIcon()).not.toBeInTheDocument()
  })

  it.each`
    status               | statusText      | statusIcon
${'synced'}   | ${'Saved'} | ${'syncedIcon'}
${'syncing'}   | ${'Saving...'} | ${'syncingIcon'}
${'pending'}   | ${'Saving...'} | ${'syncingIcon'}
${'failed'}   | ${'0 sync failed - retry'} | ${'failedIcon'}
    ` ('should set $statusText text and $statusIcon icon for $status status store', ({ status, statusText, statusIcon }) => {
    useSyncStore.getState().setSyncStatus(status)
    render(<OfflineIndicator loading={false} />)

    if (status !== 'failed') {
      expect(getSyncIndicator()).toHaveTextContent(statusText)
    } else {
      expect(screen.getByRole("button")).toHaveTextContent(statusText)
    }
    expect(getPillIcon(statusIcon)).toBeVisible()
    expect(getOfflineIcon()).not.toBeInTheDocument()
  })

  it('should display offline banner when offline', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    render(<OfflineIndicator loading={false} />)

    expect(getSyncIndicator()).toHaveTextContent('Working Offline')
    expect(getOfflineIcon()).toBeVisible()
    expect(getPillIcon()).not.toBeInTheDocument()
  })

  it.each`
    quantity               | statusText      
${0}   | ${'Working Offline - 0 changes will sync when back online'} 
${1}   | ${'Working Offline - 1 change will sync when back online'}
${5}   | ${'Working Offline - 5 changes will sync when back online'} 
    ` ('should set $statusText text in English for $quantity pending items when offline', ({ quantity, statusText }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    useLocaleStore.getState().setLang('en')
    useSyncStore.getState().setPendingChangesCount(quantity)
    render(<OfflineIndicator loading={false} />)

    expect(getOfflineIcon()).toBeInTheDocument()
    expect(getSyncIndicator()).toHaveTextContent(statusText)
  })

  it.each`
    quantity               | statusText      
${0}   | ${'Offline - 0 zmian zapisze się po ponownym połączeniu'} 
${1}   | ${'Offline - 1 zmiana zapisze się po ponownym połączeniu'}
${3}   | ${'Offline - 3 zmiany zapiszą się po ponownym połączeniu'}
${5}   | ${'Offline - 5 zmian zapisze się po ponownym połączeniu'} 
    ` ('should set $statusText text in Polish for $quantity pending items when offline', ({ quantity, statusText }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    useLocaleStore.getState().setLang('pl')
    useSyncStore.getState().setPendingChangesCount(quantity)
    render(<OfflineIndicator loading={false} />)

    expect(getOfflineIcon()).toBeInTheDocument()
    expect(getSyncIndicator()).toHaveTextContent(statusText)
  })

  it.each`
    quantity               | statusText      
${0}   | ${"Can't reach the server - 0 changes will sync when the server is available"} 
${1}   | ${"Can't reach the server - 1 change will sync when the server is available"}
${5}   | ${"Can't reach the server - 5 changes will sync when the server is available"} 
    ` ('should set $statusText text in English for $quantity pending items when server is not reachable', ({ quantity, statusText }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });

    useLocaleStore.getState().setLang('en')
    useSyncStore.getState().setPendingChangesCount(quantity)
    useSyncStore.getState().setConnectionStatus('server-unreachable')

    render(<OfflineIndicator loading={false} />)

    expect(getServUnavailableIcon()).toBeInTheDocument()
    expect(getSyncIndicator()).toHaveTextContent(statusText)
  })

    it.each`
    quantity               | statusText      
${0}   | ${"Brak połączenia z serwerem - 0 zmian zapisze się, gdy serwer znów będzie dostępny"} 
${1}   | ${'Brak połączenia z serwerem - 1 zmiana zapisze się, gdy serwer znów będzie dostępny'}
${3}   | ${'Brak połączenia z serwerem - 3 zmiany zapiszą się, gdy serwer znów będzie dostępny'}
${5}   | ${'Brak połączenia z serwerem - 5 zmian zapisze się, gdy serwer znów będzie dostępny'} 
    ` ('should set $statusText text in Polish for $quantity pending items when server is not reachable', ({ quantity, statusText }) => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });

    useLocaleStore.getState().setLang('pl')
    useSyncStore.getState().setPendingChangesCount(quantity)
    useSyncStore.getState().setConnectionStatus('server-unreachable')

    render(<OfflineIndicator loading={false} />)

    expect(getServUnavailableIcon()).toBeInTheDocument()
    expect(getSyncIndicator()).toHaveTextContent(statusText)
  })

  it('should display loading pill when loading', () => {

    render(<OfflineIndicator loading={true} />)

    expect(getLoadingPill()).toBeVisible()
    expect(getPillIcon()).not.toBeInTheDocument()
  })
})

const getSyncIndicator = () => screen.getByRole("status")
const getPillIcon = (iconName: string = 'syncedIcon') => screen.queryByTitle(iconName)
const getOfflineIcon = () => screen.queryByTitle('offlineIcon')
const getServUnavailableIcon = () => screen.queryByTitle('serverUnreachableIcon')
const getLoadingPill = () => screen.getByTitle('loadingPill')
