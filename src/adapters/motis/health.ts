export async function engineIsUp(baseUrl: string, timeoutMs = 2000): Promise<boolean> {
  try {
    const response = await fetch(new URL('/api/v1/health', baseUrl), { signal: AbortSignal.timeout(timeoutMs) });
    return response.ok;
  } catch {
    return false;
  }
}
