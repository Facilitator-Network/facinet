/**
 * Key Intake (Ephemeral RSA Envelope)
 *
 * Problem: the facilitator's private key must reach the server so it can be
 * re-encrypted with SYSTEM_MASTER_KEY for backend signing. Sending it as
 * plaintext in a request body exposes it to TLS-terminating proxies, access
 * logs, and serverless runtime memory dumps.
 *
 * Solution: the server holds an RSA keypair (private half in
 * KEY_INTAKE_PRIVATE_KEY, never sent anywhere). The browser fetches the
 * public half, seals the facilitator private key with RSA-OAEP, and sends
 * only the sealed blob. The server unseals it in memory, immediately
 * re-encrypts with SYSTEM_MASTER_KEY, and discards the plaintext.
 *
 * This keypair is intentionally SEPARATE from SYSTEM_MASTER_KEY so that a
 * leak of one does not compromise the other, and so the intake key can be
 * rotated independently (regenerate, swap the env var, redeploy — old
 * sealed blobs are transient and never stored, so nothing to migrate).
 *
 * Generate a keypair for the env var with:
 *   node -e "const c=require('crypto');const{privateKey}=c.generateKeyPairSync('rsa',{modulusLength:3072});console.log(Buffer.from(privateKey.export({type:'pkcs8',format:'pem'})).toString('base64'))"
 * Put the output in KEY_INTAKE_PRIVATE_KEY.
 */

import crypto from 'crypto';

const RSA_OAEP_HASH = 'sha256';

let cachedPrivateKey: crypto.KeyObject | null = null;
let cachedPublicPem: string | null = null;

function loadPrivateKey(): crypto.KeyObject {
  if (cachedPrivateKey) return cachedPrivateKey;

  const b64 = process.env.KEY_INTAKE_PRIVATE_KEY;
  if (!b64) {
    throw new Error(
      'KEY_INTAKE_PRIVATE_KEY is not set. Generate one with the snippet in lib/key-intake.ts.'
    );
  }

  let pem: string;
  try {
    pem = Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    throw new Error('KEY_INTAKE_PRIVATE_KEY is not valid base64');
  }

  if (!pem.includes('BEGIN PRIVATE KEY') && !pem.includes('BEGIN RSA PRIVATE KEY')) {
    throw new Error('KEY_INTAKE_PRIVATE_KEY did not decode to a PEM private key');
  }

  cachedPrivateKey = crypto.createPrivateKey(pem);
  return cachedPrivateKey;
}

/**
 * Public key (SPKI PEM) to hand to the browser. Derived from the private
 * key, cached for the lifetime of the serverless instance.
 */
export function getIntakePublicKeyPem(): string {
  if (cachedPublicPem) return cachedPublicPem;

  const priv = loadPrivateKey();
  const pub = crypto.createPublicKey(priv);
  cachedPublicPem = pub
    .export({ type: 'spki', format: 'pem' })
    .toString();
  return cachedPublicPem;
}

/**
 * Unseal a base64 RSA-OAEP(SHA-256) ciphertext produced by the browser.
 * Returns the plaintext (the facilitator private key). The caller MUST
 * re-encrypt it immediately and never log or store the return value.
 */
export function unsealPrivateKey(sealedBase64: string): string {
  if (!sealedBase64 || typeof sealedBase64 !== 'string') {
    throw new Error('sealedPrivateKey is missing or not a string');
  }

  let ciphertext: Buffer;
  try {
    ciphertext = Buffer.from(sealedBase64, 'base64');
  } catch {
    throw new Error('sealedPrivateKey is not valid base64');
  }

  if (ciphertext.length === 0) {
    throw new Error('sealedPrivateKey decoded to empty bytes');
  }

  const priv = loadPrivateKey();

  let plaintext: Buffer;
  try {
    plaintext = crypto.privateDecrypt(
      {
        key: priv,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: RSA_OAEP_HASH,
      },
      ciphertext
    );
  } catch {
    // Deliberately generic — do not leak crypto internals to the caller.
    throw new Error('Failed to unseal private key (wrong key or corrupt blob)');
  }

  const result = plaintext.toString('utf8');

  // Best-effort scrub of the intermediate buffer.
  plaintext.fill(0);

  // Sanity-check it looks like an EVM private key before handing it back.
  if (!/^0x[a-fA-F0-9]{64}$/.test(result)) {
    throw new Error('Unsealed value is not a valid EVM private key');
  }

  return result;
}

/**
 * True if the intake keypair is configured. Lets routes return a clear
 * error instead of a 500 stack trace when the env var is absent.
 */
export function isKeyIntakeConfigured(): boolean {
  return !!process.env.KEY_INTAKE_PRIVATE_KEY;
}
