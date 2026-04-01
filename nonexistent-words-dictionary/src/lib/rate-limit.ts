const rateMap = new Map<string, number[]>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15;

export function checkRateLimit(key: string, maxRequests = MAX_REQUESTS): boolean {
  const now = Date.now();
  const timestamps = rateMap.get(key) || [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= maxRequests) {
    return false;
  }

  recent.push(now);
  rateMap.set(key, recent);
  return true;
}
