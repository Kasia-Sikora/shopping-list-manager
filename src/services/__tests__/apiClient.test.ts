import { makeList } from '../../utils/testHelpers';
import { fetchApi, HttpError } from '../apiClient';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('apiClient', () => {
  it('sets the default Content-Type header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchApi('/lists');

    expect(fetchMock).toHaveBeenCalledWith(
      '/lists',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('throws HttpError with the response status on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
      status: 500,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/lists')).rejects.toBeInstanceOf(HttpError);
    await expect(fetchApi('/lists')).rejects.toMatchObject({ status: 500 });
  });

  it("uses the error body's `error` field in the message when the body is JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed fetch' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/lists')).rejects.toThrow('Failed fetch');
  });

  it('falls back to statusText when the error response has no JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('no body');
      },
      statusText: 'Failed fetch status text',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/lists')).rejects.toThrow('Failed fetch status text');
  });

  it('returns the parsed JSON body on a successful response', async () => {
    const list = [makeList('a')];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => list,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchApi('/lists')).resolves.toStrictEqual(list);
  });

  it('merges caller headers with the defaults', async () => {
    const customHeader = { 'Content-Language': 'en-US' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchApi('/lists', { headers: customHeader });

    expect(fetchMock).toHaveBeenCalledWith(
      '/lists',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json', 'Content-Language': 'en-US' }),
      })
    );
  });
});
