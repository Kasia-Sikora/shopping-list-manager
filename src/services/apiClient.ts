export class HttpError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status
  }
}

export const fetchApi = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
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
};
