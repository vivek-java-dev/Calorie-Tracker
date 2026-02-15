import { getToken } from './authService';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: any,
  timeout = 10000 // default 10s
) {
  const token = await getToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });


    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'API request failed');
    }

    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
