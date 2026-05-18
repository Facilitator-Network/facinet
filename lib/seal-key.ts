/**
 * Client-side key sealing.
 *
 * Seals a facilitator private key with the server's RSA intake public key
 * using WebCrypto RSA-OAEP(SHA-256), so the plaintext key never leaves the
 * browser. Pairs with lib/key-intake.ts on the server.
 */

let cachedPublicKey: CryptoKey | null = null;

/** Strip PEM armor and base64-decode to DER bytes. */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getServerPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) return cachedPublicKey;

  const res = await fetch('/api/facilitator/intake-key');
  if (!res.ok) {
    throw new Error(
      'Could not fetch the server key-intake public key. Try again in a moment.'
    );
  }
  const { publicKey } = (await res.json()) as { publicKey: string };
  if (!publicKey) {
    throw new Error('Server did not return an intake public key.');
  }

  cachedPublicKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKey),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  return cachedPublicKey;
}

/**
 * Seal an EVM private key (0x + 64 hex) for transit. Returns base64
 * ciphertext to send as `sealedPrivateKey`.
 */
export async function sealPrivateKey(privateKey: string): Promise<string> {
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error('Refusing to seal: value is not a valid EVM private key.');
  }

  const pubKey = await getServerPublicKey();
  const sealed = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    pubKey,
    new TextEncoder().encode(privateKey)
  );

  let binary = '';
  const bytes = new Uint8Array(sealed);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
