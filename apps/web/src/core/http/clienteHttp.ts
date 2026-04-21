const apiBaseUrl = "/api";

type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function buildUrl(path: string, searchParams?: Record<string, string | undefined>) {
  const url = new URL(path, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export async function httpJson<T>(
  path: string,
  options: {
    method?: MetodoHttp;
    searchParams?: Record<string, string | undefined>;
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const { method = "GET", searchParams, body, signal } = options;
  const url = buildUrl(`${apiBaseUrl}${path}`, searchParams);

  const requestInit: RequestInit = {
    method,
    credentials: "same-origin",
  };

  if (signal !== undefined) requestInit.signal = signal;
  if (body !== undefined) {
    requestInit.headers = { "Content-Type": "application/json" };
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);
  if (!response.ok) {
    const text = await response.text();
    throw new HttpError(response.status, text || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
