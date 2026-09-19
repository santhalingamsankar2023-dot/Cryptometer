// Hybrid Cryptography (AES-256-GCM + RSA-2048/4096)
// As recommended in Image 3 for professional cryptometer implementation

export interface HybridEncryptedEnvelope {
  encryptedDataHex: string;
  encryptedKeyHex: string;
  ivHex: string;
  tagHex: string;
  dataLengthBytes: number;
  cipherLengthBytes: number;
  keyLengthBytes: number;
  totalTimeMs: number;
  aesKeyRawHex: string;
}

export async function runHybridEncryption(
  plaintext: string,
  rsaPublicKey: CryptoKey
): Promise<{
  envelope: HybridEncryptedEnvelope;
  rawPayload: {
    aesKey: CryptoKey;
    iv: Uint8Array;
    cipherBuffer: ArrayBuffer;
    encryptedKeyBuffer: ArrayBuffer;
  };
}> {
  const start = performance.now();

  // 1. Generate an ephemeral AES-256-GCM symmetric key
  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export raw AES key for display
  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const rawAesBytes = new Uint8Array(rawAesKey);
  const aesKeyRawHex = Array.from(rawAesBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // 2. Encrypt actual plaintext with AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard GCM IV
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  const encryptedDataBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    plaintextBytes
  );

  // 3. Encrypt the raw AES-256 key with RSA-OAEP
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    rsaPublicKey,
    rawAesKey
  );

  const end = performance.now();

  const dataBytes = new Uint8Array(encryptedDataBuffer);
  const keyBytes = new Uint8Array(encryptedKeyBuffer);

  const encryptedDataHex = Array.from(dataBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  const encryptedKeyHex = Array.from(keyBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  return {
    envelope: {
      encryptedDataHex,
      encryptedKeyHex,
      ivHex,
      tagHex: encryptedDataHex.slice(-32), // GCM tag is last 16 bytes
      dataLengthBytes: plaintextBytes.byteLength,
      cipherLengthBytes: dataBytes.byteLength,
      keyLengthBytes: keyBytes.byteLength,
      totalTimeMs: Math.max(0.1, end - start),
      aesKeyRawHex,
    },
    rawPayload: {
      aesKey,
      iv,
      cipherBuffer: encryptedDataBuffer,
      encryptedKeyBuffer,
    },
  };
}

export async function runHybridDecryption(
  encryptedKeyBuffer: ArrayBuffer,
  cipherBuffer: ArrayBuffer,
  iv: Uint8Array,
  rsaPrivateKey: CryptoKey
): Promise<{
  decryptedText: string;
  totalTimeMs: number;
}> {
  const start = performance.now();

  // 1. Decrypt AES key with RSA Private Key
  const rawAesKey = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    rsaPrivateKey,
    encryptedKeyBuffer
  );

  // 2. Import raw AES key back to CryptoKey
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    rawAesKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 3. Decrypt ciphertext with AES key
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  const decryptedText = decoder.decode(decryptedBuffer);
  const end = performance.now();

  return {
    decryptedText,
    totalTimeMs: Math.max(0.1, end - start),
  };
}
