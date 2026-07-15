import { render, screen } from "@testing-library/react";
import { OfflineIndicator } from "../OfflineIndicator";
import { useSyncStore } from "../../stores/store";

describe('OfflineIndicator', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('should set default status to synced', () => {
    render(<OfflineIndicator loading={false} />)

    expect(getSyncIndicator()).toHaveTextContent('Zapisano')
    expect(getPillIcon()).toBeVisible()
    expect(getOfflineIcon()).not.toBeInTheDocument()
  })

  it.each`
    status               | statusText      | statusIcon
${'synced'}   | ${'Zapisano'} | ${'syncedIcon'}
${'syncing'}   | ${'Synchronizuję...'} | ${'syncingIcon'}
${'pending'}   | ${'0 w kolejce'} | ${'pendingIcon'}
${'failed'}   | ${'0 nie zsynchronizowano — ponów'} | ${'failedIcon'}
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

    expect(getSyncIndicator()).toHaveTextContent('Offline - zmiany zapiszą się po ponownym połączeniu')
    expect(getOfflineIcon()).toBeVisible()
    expect(getPillIcon()).not.toBeInTheDocument()
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
const getLoadingPill = () => screen.getByTitle('loadingPill')
