export class HttpError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const fetchApi = async <T>(url: string, options: RequestInit = {}, abortTime: number = 5000): Promise<T> => {
  const controller = new AbortController();
  const signal = controller.signal;

  const abortId = setTimeout(() => {
    controller.abort();
  }, abortTime);

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      signal,
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        detail = (await response.json()).error ?? detail;
      } catch {
        /* no body */
      }
      throw new HttpError(response.status, `HTTP ${response.status}: ${detail}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('Request aborted. Error: ', error);
      throw new HttpError(408, 'Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(abortId);
  }
};
