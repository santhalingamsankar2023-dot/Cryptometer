export type RsaMode = 'educational' | 'production';

export interface RsaMathKey {
  p: bigint;
  q: bigint;
  n: bigint;
  phi: bigint;
  e: bigint;
  d: bigint;
  bitLength: number;
}

export interface WebCryptoKeyData {
  publicKeyPem: string;
  privateKeyPem: string;
  keyLength: 1024 | 2048 | 4096;
  publicKeyObj: CryptoKey | null;
  privateKeyObj: CryptoKey | null;
}

export interface CryptometerMetrics {
  keyBitLength: number;
  securityRating: 'Very Weak' | 'Weak' | 'Moderate' | 'High' | 'Very High' | 'Military Grade';
  securityScore: number; // 0 - 100
  nistStatus: string;
  factoringComplexity: string;
  plaintextEntropy: number; // 0 to 8 bits
  ciphertextEntropy: number; // 0 to 8 bits
  entropyRatio: number; // percentage
  encryptTimeMs: number;
  decryptTimeMs: number;
  keyGenTimeMs: number;
  quantumVulnerability: string;
}

export interface AlgorithmComparisonItem {
  id: string;
  name: string;
  type: 'Asymmetric' | 'Symmetric' | 'Key Exchange';
  encryption: boolean;
  decryption: boolean;
  keyExchange: boolean;
  securityLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  suitableForCryptometer: string;
  suitableStatus: 'yes' | 'demo-only' | 'key-exchange-only' | 'best-bulk';
  keySizeTypical: string;
  relativeSpeed: string;
  description: string;
}

export interface EncryptionStep {
  char: string;
  ascii: number;
  cipherBlock: bigint;
  formula: string;
}

export interface DecryptionStep {
  cipherBlock: bigint;
  plainVal: bigint;
  char: string;
  formula: string;
}

export interface HybridPackage {
  encryptedDataHex: string;
  encryptedKeyHex: string;
  ivHex: string;
  originalSize: number;
  cipherSize: number;
  timeTakenMs: number;
}
