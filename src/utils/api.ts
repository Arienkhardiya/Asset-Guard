/**
 * Safe JSON parser — logs raw response if Cloud Run returns HTML instead of JSON
 * (e.g. on 404s, CORS preflight errors, or deployment issues).
 */
export const safeJson = async (res: Response) => {
  const text = await res.text();
  
  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
    console.error('[AssetGuard] Backend returned HTML instead of JSON. URL:', res.url, '\nResponse:', text.slice(0, 300));
    throw new Error('Backend unreachable — received HTML response instead of JSON. Check CORS or Cloud Run deployment.');
  }

  if (!res.ok) {
    let errorDetail = text;
    try {
      const errorJson = JSON.parse(text);
      errorDetail = errorJson.error || errorJson.message || text;
    } catch (e) {
      // Not JSON, use raw text
    }
    throw new Error(errorDetail || `Request failed with status ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[AssetGuard] Invalid JSON from', res.url, '\nRaw:', text.slice(0, 300));
    throw new Error('Invalid JSON response from backend.');
  }
};
