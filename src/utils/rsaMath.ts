// Mathematical RSA implementation using BigInt and cryptographic analysis metrics
import { EncryptionStep, DecryptionStep } from '../types/crypto';

export interface ExtendedGcdStep {
  step: number;
  rPrev: bigint;
  rCurr: bigint;
  q: bigint;
  rNext: bigint;
  tPrev: bigint;
  tCurr: bigint;
  tNext: bigint;
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function extendedGcd(a: bigint, m: bigint): {
  gcd: bigint;
  x: bigint;
  steps: ExtendedGcdStep[];
} {
  let r0 = m;
  let r1 = a;
  let t0 = 0n;
  let t1 = 1n;
  const steps: ExtendedGcdStep[] = [];
  let stepCount = 1;

  while (r1 !== 0n) {
    const q = r0 / r1;
    const r2 = r0 % r1;
    const t2 = t0 - q * t1;

    steps.push({
      step: stepCount++,
      rPrev: r0,
      rCurr: r1,
      q,
      rNext: r2,
      tPrev: t0,
      tCurr: t1,
      tNext: t2,
    });

    r0 = r1;
    r1 = r2;
    t0 = t1;
    t1 = t2;
  }

  let x = t0;
  if (x < 0n) {
    x += m;
  }

  return { gcd: r0, x, steps };
}

export function modInverse(e: bigint, phi: bigint): { d: bigint; steps: ExtendedGcdStep[] } {
  const result = extendedGcd(e, phi);
  if (result.gcd !== 1n) {
    throw new Error(`Modular inverse does not exist because gcd(${e}, ${phi}) = ${result.gcd} !== 1`);
  }
  return { d: result.x, steps: result.steps };
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  let b = base % modulus;
  let exp = exponent;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * b) % modulus;
    }
    exp = exp / 2n;
    b = (b * b) % modulus;
  }
  return result;
}

// Miller-Rabin Primality Test
export function isProbablePrime(n: bigint, k: number = 20): boolean {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  // Small prime trial division for fast rejection
  const smallPrimes = [5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n];
  for (const p of smallPrimes) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  const trials = Math.min(k, bases.length);

  for (let i = 0; i < trials; i++) {
    const a = bases[i];
    if (n <= a) break;

    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

// Generate random BigInt with specified bit length
export function randomBigInt(bits: number): bigint {
  const bytes = Math.ceil(bits / 8);
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);

  let hex = '';
  for (let i = 0; i < array.length; i++) {
    hex += array[i].toString(16).padStart(2, '0');
  }

  let val = BigInt('0x' + hex);
  // Ensure top bit is 1 so length is accurate
  val |= 1n << BigInt(bits - 1);
  // Ensure odd number
  val |= 1n;
  return val;
}

export function generatePrime(bits: number): bigint {
  if (bits < 4) bits = 4;
  let candidate = randomBigInt(bits);
  while (!isProbablePrime(candidate)) {
    candidate += 2n;
  }
  return candidate;
}

// Preset classic primes for quick demonstration
export const PRESET_PRIMES = [
  { name: 'Small Demonstration', p: 61n, q: 53n, desc: 'Classic textbook RSA (n=3233, 12-bit)' },
  { name: 'Classroom Mini', p: 137n, q: 131n, desc: 'Fast step-by-step numbers (n=17947, 15-bit)' },
  { name: '32-Bit Micro RSA', p: 65537n, q: 65539n, desc: '32-bit modulus for moderate math (n≈4.29B)' },
  { name: '64-Bit Demonstration', p: 3037000493n, q: 3037000499n, desc: '64-bit RSA modulus (n≈9.22×10¹⁸)' },
];

// Encrypt plaintext using RSA (e, n)
export function encryptMathRsa(text: string, e: bigint, n: bigint): {
  cipherBlocks: bigint[];
  cipherHex: string;
  cipherBase64: string;
  steps: EncryptionStep[];
  executionTimeMs: number;
} {
  const start = performance.now();
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const steps: EncryptionStep[] = [];
  const cipherBlocks: bigint[] = [];

  // Determine max chunk size so chunk < n
  // For small n (e.g. n < 256), process character code directly modulo n
  // For standard byte values, 1 byte at a time or multi-byte blocks
  const nBits = n.toString(2).length;
  const bytesPerBlock = Math.max(1, Math.floor((nBits - 1) / 8));

  if (bytesPerBlock <= 1 && n < 256n) {
    // Single byte / character mode with warning if byte >= n
    for (let i = 0; i < bytes.length; i++) {
      const b = BigInt(bytes[i]);
      const m = b % n;
      const c = modPow(m, e, n);
      cipherBlocks.push(c);
      steps.push({
        char: String.fromCharCode(bytes[i]),
        ascii: bytes[i],
        cipherBlock: c,
        formula: `${m}^${e} mod ${n} = ${c}`,
      });
    }
  } else {
    // Chunking bytes into blocks
    for (let i = 0; i < bytes.length; i += bytesPerBlock) {
      const chunk = bytes.slice(i, i + bytesPerBlock);
      let m = 0n;
      for (let j = 0; j < chunk.length; j++) {
        m = (m << 8n) | BigInt(chunk[j]);
      }
      const c = modPow(m, e, n);
      cipherBlocks.push(c);
      steps.push({
        char: Array.from(chunk).map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : `\\x${b.toString(16)}`)).join(''),
        ascii: Number(m <= 65535n ? m : 0),
        cipherBlock: c,
        formula: `${m}^${e} mod ${n} = ${c}`,
      });
    }
  }

  // Convert cipher blocks to Hex representation
  const cipherHex = cipherBlocks.map((b) => b.toString(16).padStart(4, '0')).join(' ');

  // Base64 serialization
  const blockJson = JSON.stringify(cipherBlocks.map((b) => b.toString()));
  const cipherBase64 = btoa(unescape(encodeURIComponent(blockJson)));

  const end = performance.now();
  return {
    cipherBlocks,
    cipherHex,
    cipherBase64,
    steps,
    executionTimeMs: Math.max(0.01, end - start),
  };
}

// Decrypt ciphertext using RSA (d, n)
export function decryptMathRsa(
  cipherBlocks: bigint[],
  d: bigint,
  n: bigint,
  originalTextLength?: number
): {
  decryptedText: string;
  steps: DecryptionStep[];
  executionTimeMs: number;
} {
  const start = performance.now();
  const nBits = n.toString(2).length;
  const bytesPerBlock = Math.max(1, Math.floor((nBits - 1) / 8));
  const steps: DecryptionStep[] = [];
  const recoveredBytes: number[] = [];

  for (let i = 0; i < cipherBlocks.length; i++) {
    const c = cipherBlocks[i];
    const m = modPow(c, d, n);

    if (bytesPerBlock <= 1 && n < 256n) {
      const byteVal = Number(m % 256n);
      recoveredBytes.push(byteVal);
      steps.push({
        cipherBlock: c,
        plainVal: m,
        char: String.fromCharCode(byteVal),
        formula: `${c}^${d} mod ${n} = ${m}`,
      });
    } else {
      // Unpack bytes from BigInt block
      const blockBytes: number[] = [];
      let temp = m;
      for (let j = 0; j < bytesPerBlock; j++) {
        blockBytes.unshift(Number(temp & 0xffn));
        temp = temp >> 8n;
      }
      // If leading zeros were padded, trim if beyond original text
      for (const b of blockBytes) {
        if (b !== 0 || recoveredBytes.length < (originalTextLength || Infinity)) {
          recoveredBytes.push(b);
        }
      }
      steps.push({
        cipherBlock: c,
        plainVal: m,
        char: blockBytes.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join(''),
        formula: `${c}^${d} mod ${n} = ${m}`,
      });
    }
  }

  const decoder = new TextDecoder();
  const decryptedText = decoder.decode(new Uint8Array(recoveredBytes)).replace(/\0+$/, '');
  const end = performance.now();

  return {
    decryptedText,
    steps,
    executionTimeMs: Math.max(0.01, end - start),
  };
}

// Calculate Shannon Entropy (0 to 8 bits per byte)
export function calculateShannonEntropy(data: Uint8Array | string): number {
  let bytes: Uint8Array;
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  } else {
    bytes = data;
  }

  if (bytes.length === 0) return 0;

  const frequencies = new Map<number, number>();
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    frequencies.set(b, (frequencies.get(b) || 0) + 1);
  }

  let entropy = 0;
  const len = bytes.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return Math.min(8, Math.max(0, entropy));
}

// Compute security rating and metrics based on bit length
export function evaluateSecurity(bitLength: number): {
  rating: 'Very Weak' | 'Weak' | 'Moderate' | 'High' | 'Very High' | 'Military Grade';
  score: number; // 0 to 100
  nistStatus: string;
  factoringComplexity: string;
  quantumVulnerability: string;
} {
  if (bitLength < 64) {
    return {
      rating: 'Very Weak',
      score: 10,
      nistStatus: 'Academic / Toy Key: trivial to factorize on smartphone in milliseconds',
      factoringComplexity: 'O(√N) via Pollard rho or simple trial division (< 1ms)',
      quantumVulnerability: 'Trivially solved on minimal quantum circuit (< 100 qubits)',
    };
  } else if (bitLength < 512) {
    return {
      rating: 'Weak',
      score: 28,
      nistStatus: 'Broken / Obsolete: crackable using desktop PC in minutes to hours',
      factoringComplexity: 'Factored via Quadratic Sieve (QS) or ECM in minutes',
      quantumVulnerability: 'Broken by Shor’s algorithm with ~1,000 physical qubits',
    };
  } else if (bitLength < 1024) {
    return {
      rating: 'Moderate',
      score: 52,
      nistStatus: 'Deprecated by NIST since 2011. Vulnerable to nation-state clusters (GNFS)',
      factoringComplexity: 'GNFS factoring cost: ~2⁷³ operations (feasible on cloud botnet)',
      quantumVulnerability: 'Vulnerable to Shor’s algorithm (~2,000 logical qubits)',
    };
  } else if (bitLength < 2048) {
    return {
      rating: 'High',
      score: 75,
      nistStatus: 'Phase-out status: 1024-bit provides ~80 bits symmetric equivalent security',
      factoringComplexity: 'GNFS complexity: ~2⁸⁰ operations. Exceeded safe bounds for new data',
      quantumVulnerability: 'Requires ~4,000 physical qubits under surface-code fault tolerance',
    };
  } else if (bitLength < 4096) {
    return {
      rating: 'Very High',
      score: 94,
      nistStatus: 'NIST Recommended: 2048-bit standard provides 112 bits of symmetric security through 2030+',
      factoringComplexity: 'GNFS complexity: ~2¹¹² operations. Infeasible with classical computers',
      quantumVulnerability: 'Requires ~4,096 logical qubits (~20 million noisy physical qubits)',
    };
  } else {
    return {
      rating: 'Military Grade',
      score: 99,
      nistStatus: 'Top Secret / Defense Grade: 4096-bit provides 128+ bits of security margin',
      factoringComplexity: 'GNFS complexity: ~2¹²⁸ operations. Resistant for decades to come',
      quantumVulnerability: 'Quantum-vulnerable long term, but requires millions of coherent physical qubits',
    };
  }
}
