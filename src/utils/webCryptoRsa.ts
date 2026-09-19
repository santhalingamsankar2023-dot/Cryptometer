// Production WebCrypto API implementation for RSA-OAEP

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function formatPem(base64: string, label: 'PUBLIC KEY' | 'RSA PRIVATE KEY' | 'PRIVATE KEY'): string {
  const chunks = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN ${label}-----\n${chunks.join('\n')}\n-----END ${label}-----`;
}

export async function generateWebCryptoKeyPair(modulusLength: 1024 | 2048 | 4096 = 2048): Promise<{
  keyPair: CryptoKeyPair;
  publicKeyPem: string;
  privateKeyPem: string;
  durationMs: number;
}> {
  const start = performance.now();
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export SPKI for public key
  const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicBase64 = arrayBufferToBase64(exportedPublic);
  const publicKeyPem = formatPem(publicBase64, 'PUBLIC KEY');

  // Export PKCS8 for private key
  const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateBase64 = arrayBufferToBase64(exportedPrivate);
  const privateKeyPem = formatPem(privateBase64, 'PRIVATE KEY');

  const durationMs = performance.now() - start;

  return {
    keyPair,
    publicKeyPem,
    privateKeyPem,
    durationMs,
  };
}

export async function encryptWithWebCrypto(
  publicKey: CryptoKey,
  plaintext: string
): Promise<{
  cipherBuffer: ArrayBuffer;
  cipherBase64: string;
  cipherHex: string;
  durationMs: number;
}> {
  const start = performance.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    data
  );

  const cipherBase64 = arrayBufferToBase64(cipherBuffer);
  const bytes = new Uint8Array(cipherBuffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0') + (i % 2 === 1 ? ' ' : '');
  }

  const durationMs = performance.now() - start;
  return {
    cipherBuffer,
    cipherBase64,
    cipherHex: hex.trim(),
    durationMs,
  };
}

export async function decryptWithWebCrypto(
  privateKey: CryptoKey,
  cipherBase64OrBuffer: string | ArrayBuffer
): Promise<{
  decryptedText: string;
  durationMs: number;
}> {
  const start = performance.now();
  const buffer =
    typeof cipherBase64OrBuffer === 'string'
      ? base64ToArrayBuffer(cipherBase64OrBuffer)
      : cipherBase64OrBuffer;

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    buffer
  );

  const decoder = new TextDecoder();
  const decryptedText = decoder.decode(decryptedBuffer);
  const durationMs = performance.now() - start;

  return {
    decryptedText,
    durationMs,
  };
}
