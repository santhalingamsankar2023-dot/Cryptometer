import { AlgorithmComparisonItem } from '../types/crypto';

export const ALGORITHM_COMPARISON_DATA: AlgorithmComparisonItem[] = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    type: 'Symmetric',
    encryption: true,
    decryption: true,
    keyExchange: false,
    securityLevel: 'Very Low',
    suitableForCryptometer: 'Only for learning/demo',
    suitableStatus: 'demo-only',
    keySizeTypical: '1-25 shifts (5 bits)',
    relativeSpeed: 'Instantaneous (< 0.001 ms)',
    description: 'Simple monoalphabetic substitution cipher where each letter in plaintext is shifted by a fixed number. Trivial to break via frequency analysis or 25 brute-force attempts.',
  },
  {
    id: 'rsa',
    name: 'RSA',
    type: 'Asymmetric',
    encryption: true,
    decryption: true,
    keyExchange: true,
    securityLevel: 'High',
    suitableForCryptometer: 'Yes (Core Project Focus)',
    suitableStatus: 'yes',
    keySizeTypical: '2048 - 4096 bits',
    relativeSpeed: 'Moderate for encrypt, slower for decrypt',
    description: 'First public-key cryptosystem based on integer factorization hardness. Public key (e, n) encrypts; private key (d, n) decrypts. Widely used for digital signatures and secure key transport.',
  },
  {
    id: 'diffie-hellman',
    name: 'Diffie-Hellman',
    type: 'Key Exchange',
    encryption: false,
    decryption: false,
    keyExchange: true,
    securityLevel: 'High',
    suitableForCryptometer: 'Only for key exchange',
    suitableStatus: 'key-exchange-only',
    keySizeTypical: '2048 - 4096 bits (or 256-bit ECDH)',
    relativeSpeed: 'Fast key negotiation',
    description: 'Mathematical method allowing two parties without prior knowledge to jointly establish a shared secret over an insecure channel based on discrete logarithms. Cannot encrypt messages directly.',
  },
  {
    id: 'elgamal',
    name: 'ElGamal',
    type: 'Asymmetric',
    encryption: true,
    decryption: true,
    keyExchange: true,
    securityLevel: 'High',
    suitableForCryptometer: 'Yes',
    suitableStatus: 'yes',
    keySizeTypical: '2048 - 4096 bits',
    relativeSpeed: 'Moderate (Ciphertext is 2x plaintext size)',
    description: 'Asymmetric public-key cipher based on the Diffie-Hellman discrete logarithm problem. Ciphertext consists of a pair (c1, c2), resulting in 2x message expansion.',
  },
  {
    id: 'aes',
    name: 'AES (Advanced Encryption Standard)',
    type: 'Symmetric',
    encryption: true,
    decryption: true,
    keyExchange: false,
    securityLevel: 'Very High',
    suitableForCryptometer: 'Best for actual data encryption',
    suitableStatus: 'best-bulk',
    keySizeTypical: '128, 192, 256 bits',
    relativeSpeed: 'Extremely fast (hardware accelerated AES-NI)',
    description: 'SP-network symmetric block cipher adopted by NIST in 2001. De-facto worldwide standard for bulk data, files, and disk encryption. Requires safe out-of-band key exchange (e.g. via RSA).',
  },
];

// Quick live Caesar cipher implementation for the demo test
export function runCaesarCipher(text: string, shift: number = 3): {
  cipher: string;
  decrypted: string;
} {
  const enc = text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join('');

  const dec = enc
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - (shift % 26) + 26) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - (shift % 26) + 26) % 26) + 97);
      }
      return char;
    })
    .join('');

  return { cipher: enc, decrypted: dec };
}

// Diffie-Hellman simulation with small prime modulus p and base g
export function simulateDiffieHellman(p: bigint = 353n, g: bigint = 3n, aSecret: bigint = 97n, bSecret: bigint = 233n) {
  // Alice public key: A = g^a mod p
  const A = (g ** aSecret) % p;
  // Bob public key: B = g^b mod p
  const B = (g ** bSecret) % p;
  // Shared key computed by Alice: s = B^a mod p
  const sAlice = (B ** aSecret) % p;
  // Shared key computed by Bob: s = A^b mod p
  const sBob = (A ** bSecret) % p;

  return {
    p,
    g,
    aliceSecret: aSecret,
    bobSecret: bSecret,
    alicePublic: A,
    bobPublic: B,
    sharedSecretAlice: sAlice,
    sharedSecretBob: sBob,
    match: sAlice === sBob,
  };
}
