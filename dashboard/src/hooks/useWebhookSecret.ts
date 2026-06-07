import { useCallback } from 'react';

/**
 * Generate a cryptographically random webhook secret as a hex string.
 * Uses the WebCrypto API. Defaults to 16 bytes (32 hex chars).
 */
export function useWebhookSecret() {
  const generate = useCallback((bytes = 16) => {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    const hex = Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
    return `whsec_${hex}`;
  }, []);

  return { generate };
}
