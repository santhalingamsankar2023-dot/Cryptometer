import React, { useState } from 'react';
import { Key, RefreshCw, Copy, Check, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RsaMathKey, RsaMode, WebCryptoKeyData } from '../types/crypto';
import { PRESET_PRIMES, generatePrime, isProbablePrime, modInverse, gcd } from '../utils/rsaMath';

interface RsaKeyGeneratorProps {
  mode: RsaMode;
  setMode: (mode: RsaMode) => void;
  mathKey: RsaMathKey;
  setMathKey: (key: RsaMathKey) => void;
  webCryptoData: WebCryptoKeyData;
  onGenerateWebCrypto: (length: 1024 | 2048 | 4096) => Promise<void>;
  isGeneratingWebCrypto: boolean;
}

export const RsaKeyGenerator: React.FC<RsaKeyGeneratorProps> = ({
  mode,
  setMode,
  mathKey,
  setMathKey,
  webCryptoData,
  onGenerateWebCrypto,
  isGeneratingWebCrypto,
}) => {
  // Local state for educational inputs
  const [inputP, setInputP] = useState<string>(mathKey.p.toString());
  const [inputQ, setInputQ] = useState<string>(mathKey.q.toString());
  const [inputE, setInputE] = useState<string>(mathKey.e.toString());
  const [mathBitSize, setMathBitSize] = useState<number>(16);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [copiedPublic, setCopiedPublic] = useState<boolean>(false);
  const [copiedPrivate, setCopiedPrivate] = useState<boolean>(false);

  // Copy helper
  const handleCopy = (text: string, isPublic: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPublic) {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedPrivate(true);
      setTimeout(() => setCopiedPrivate(false), 2000);
    }
  };

  // Validate and recalculate math key
  const handleApplyCustomMath = () => {
    try {
      setErrorMsg(null);
      const p = BigInt(inputP.trim());
      const q = BigInt(inputQ.trim());
      let e = BigInt(inputE.trim());

      if (p <= 1n || q <= 1n) {
        throw new Error('Primes p and q must be strictly greater than 1.');
      }
      if (p === q) {
        throw new Error('p and q must be distinct primes.');
      }

      if (!isProbablePrime(p)) {
        throw new Error(`p = ${p} is not prime! Please enter a prime number.`);
      }
      if (!isProbablePrime(q)) {
        throw new Error(`q = ${q} is not prime! Please enter a prime number.`);
      }

      const n = p * q;
      const phi = (p - 1n) * (q - 1n);

      if (e <= 1n || e >= phi) {
        // Default to standard 65537 or 17 or 3
        if (phi > 65537n && gcd(65537n, phi) === 1n) {
          e = 65537n;
        } else if (phi > 17n && gcd(17n, phi) === 1n) {
          e = 17n;
        } else if (phi > 3n && gcd(3n, phi) === 1n) {
          e = 3n;
        } else {
          // Find first coprime
          e = 3n;
          while (e < phi && gcd(e, phi) !== 1n) {
            e += 2n;
          }
        }
        setInputE(e.toString());
      }

      if (gcd(e, phi) !== 1n) {
        throw new Error(`e = ${e} is not coprime to φ(n) = ${phi} (gcd is ${gcd(e, phi)}). Choose another e.`);
      }

      const { d } = modInverse(e, phi);
      const bitLength = n.toString(2).length;

      setMathKey({
        p,
        q,
        n,
        phi,
        e,
        d,
        bitLength,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid key generation parameters');
    }
  };

  // Generate random prime pair
  const handleGenerateRandomMath = (bits: number) => {
    setErrorMsg(null);
    const p = generatePrime(bits);
    let q = generatePrime(bits);
    while (q === p) {
      q = generatePrime(bits);
    }

    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    let e = 65537n;
    if (e >= phi || gcd(e, phi) !== 1n) {
      e = 17n;
      if (e >= phi || gcd(e, phi) !== 1n) {
        e = 3n;
        while (e < phi && gcd(e, phi) !== 1n) {
          e += 2n;
        }
      }
    }

    const { d } = modInverse(e, phi);
    const bitLength = n.toString(2).length;

    setInputP(p.toString());
    setInputQ(q.toString());
    setInputE(e.toString());

    setMathKey({
      p,
      q,
      n,
      phi,
      e,
      d,
      bitLength,
    });
  };

  // Apply classic preset
  const handlePresetSelect = (presetIndex: number) => {
    const chosen = PRESET_PRIMES[presetIndex];
    if (!chosen) return;
    setInputP(chosen.p.toString());
    setInputQ(chosen.q.toString());

    const p = chosen.p;
    const q = chosen.q;
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    let e = 17n;
    if (gcd(e, phi) !== 1n || e >= phi) {
      e = 65537n;
      if (gcd(e, phi) !== 1n || e >= phi) {
        e = 3n;
        while (e < phi && gcd(e, phi) !== 1n) {
          e += 2n;
        }
      }
    }

    const { d } = modInverse(e, phi);
    setInputE(e.toString());

    setMathKey({
      p,
      q,
      n,
      phi,
      e,
      d,
      bitLength: n.toString(2).length,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">RSA Key Pair Generation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Construct Public Key <span className="font-mono text-slate-700">(e, n)</span> and Private Key <span className="font-mono text-slate-700">(d, n)</span>
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            id="tab-educational-mode"
            onClick={() => setMode('educational')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'educational'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Step-by-Step Math Mode
          </button>
          <button
            id="tab-production-mode"
            onClick={() => setMode('production')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'production'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Production WebCrypto Mode
          </button>
        </div>
      </div>

      {/* Mode 1: Educational Math Mode */}
      {mode === 'educational' && (
        <div className="space-y-5">
          {/* Quick Presets & Random Generator */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PRIMES.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(idx)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 rounded-lg transition-all shadow-xs"
                    title={preset.desc}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={mathBitSize}
                onChange={(e) => setMathBitSize(Number(e.target.value))}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-medium"
              >
                <option value={8}>8-bit primes (Fast Demo)</option>
                <option value={16}>16-bit primes (32-bit Modulus)</option>
                <option value={24}>24-bit primes (48-bit Modulus)</option>
                <option value={32}>32-bit primes (64-bit Modulus)</option>
              </select>
              <button
                id="btn-gen-random-primes"
                onClick={() => handleGenerateRandomMath(mathBitSize)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Primes
              </button>
            </div>
          </div>

          {/* Prime inputs p & q */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prime 1 (p)
              </label>
              <input
                id="input-prime-p"
                type="text"
                value={inputP}
                onChange={(e) => setInputP(e.target.value)}
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="e.g. 61"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prime 2 (q)
              </label>
              <input
                id="input-prime-q"
                type="text"
                value={inputQ}
                onChange={(e) => setInputQ(e.target.value)}
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="e.g. 53"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Exponent (e)
              </label>
              <input
                id="input-exponent-e"
                type="text"
                value={inputE}
                onChange={(e) => setInputE(e.target.value)}
                className="w-full text-sm font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="e.g. 17 or 65537"
              />
            </div>
          </div>

          {/* Recalculate Button & Errors */}
          <div className="flex items-center justify-between">
            <button
              id="btn-recalculate-keys"
              onClick={handleApplyCustomMath}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate RSA Parameters
            </button>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Mathematical Derivations Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Modulus (n = p × q)</span>
              <div className="font-mono text-sm font-bold text-slate-800 mt-1 break-all">
                {mathKey.n.toString()}
              </div>
              <span className="text-[10px] text-slate-500">{mathKey.bitLength} bits</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Totient φ(n) = (p-1)(q-1)</span>
              <div className="font-mono text-sm font-bold text-slate-800 mt-1 break-all">
                {mathKey.phi.toString()}
              </div>
              <span className="text-[10px] text-slate-500">Euler's Totient</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Public Exponent (e)</span>
              <div className="font-mono text-sm font-bold text-indigo-700 mt-1 break-all">
                {mathKey.e.toString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">gcd(e, φ) = 1</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Private Exponent (d)</span>
              <div className="font-mono text-sm font-bold text-purple-700 mt-1 break-all">
                {mathKey.d.toString()}
              </div>
              <span className="text-[10px] text-slate-500">d ≡ e⁻¹ mod φ(n)</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Production WebCrypto Mode */}
      {mode === 'production' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900">Standard Web Crypto API (RSA-OAEP with SHA-256)</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates cryptographically secure keys conforming to FIPS/NIST standards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[1024, 2048, 4096].map((len) => (
                <button
                  key={len}
                  disabled={isGeneratingWebCrypto}
                  onClick={() => onGenerateWebCrypto(len as 1024 | 2048 | 4096)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    webCryptoData.keyLength === len
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {len}-bit {len === 2048 ? '(Standard)' : len === 4096 ? '(Military)' : '(Legacy)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prominent RSA Components Display (Directly matching Image 1: Public Key = (e, n), Private Key = (d, n)) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Public Key Card */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border-2 border-indigo-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Public Key</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                  Used for encryption
                </span>
              </div>
              <button
                id="btn-copy-public-key"
                onClick={() =>
                  handleCopy(
                    mode === 'educational'
                      ? `Public Key = (e: ${mathKey.e}, n: ${mathKey.n})`
                      : webCryptoData.publicKeyPem,
                    true
                  )
                }
                className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg transition-all"
              >
                {copiedPublic ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPublic ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-3 font-mono text-xs bg-white p-3 rounded-lg border border-indigo-100 text-slate-800 break-all max-h-32 overflow-y-auto">
              {mode === 'educational' ? (
                <div>
                  <div className="text-slate-500 font-semibold mb-1">Example Format:</div>
                  <div className="text-indigo-950 font-bold">Public Key = (e, n)</div>
                  <div className="mt-1 text-slate-700">
                    e = {mathKey.e.toString()}
                  </div>
                  <div className="text-slate-700">
                    n = {mathKey.n.toString()}
                  </div>
                </div>
              ) : (
                <pre className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {webCryptoData.publicKeyPem}
                </pre>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Publicly shareable: Anyone can use this to encrypt messages for you.</span>
          </div>
        </div>

        {/* Private Key Card */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Private Key</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md">
                  Used for decryption
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-toggle-private-key-visibility"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="p-1 text-slate-500 hover:text-slate-700 rounded-md"
                  title={showPrivateKey ? 'Mask private key' : 'Show private key'}
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  id="btn-copy-private-key"
                  onClick={() =>
                    handleCopy(
                      mode === 'educational'
                        ? `Private Key = (d: ${mathKey.d}, n: ${mathKey.n})`
                        : webCryptoData.privateKeyPem,
                      false
                    )
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg transition-all"
                >
                  {copiedPrivate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPrivate ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mt-3 font-mono text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-800 break-all max-h-32 overflow-y-auto">
              {mode === 'educational' ? (
                <div>
                  <div className="text-slate-500 font-semibold mb-1">Example Format:</div>
                  <div className="text-slate-900 font-bold">Private Key = (d, n)</div>
                  {showPrivateKey ? (
                    <>
                      <div className="mt-1 text-purple-700 font-semibold">
                        d = {mathKey.d.toString()}
                      </div>
                      <div className="text-slate-700">
                        n = {mathKey.n.toString()}
                      </div>
                    </>
                  ) : (
                    <div className="mt-1 text-slate-400 font-mono tracking-wider">
                      d = •••••••••••••••• (Click eye icon to reveal)
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {showPrivateKey
                    ? webCryptoData.privateKeyPem
                    : '-----BEGIN PRIVATE KEY-----\n••••••••••••••••••••••••••••••••\n-----END PRIVATE KEY-----'}
                </pre>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Confidential: Must never be revealed. Used exclusively to decrypt ciphertext.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
