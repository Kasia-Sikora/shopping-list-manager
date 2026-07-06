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
    throw new Error(`HTTP ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
};
