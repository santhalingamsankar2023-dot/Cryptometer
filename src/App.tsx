/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CryptometerGauges } from './components/CryptometerGauges';
import { RsaKeyGenerator } from './components/RsaKeyGenerator';
import { RsaEncryptionPanel } from './components/RsaEncryptionPanel';
import { RsaDecryptionPanel } from './components/RsaDecryptionPanel';
import { AlgorithmComparisonTable } from './components/AlgorithmComparisonTable';
import { HybridCryptoFlow } from './components/HybridCryptoFlow';
import { MathStepVisualizer } from './components/MathStepVisualizer';
import {
  CryptometerMetrics,
  DecryptionStep,
  EncryptionStep,
  RsaMathKey,
  RsaMode,
  WebCryptoKeyData,
} from './types/crypto';
import {
  calculateShannonEntropy,
  decryptMathRsa,
  encryptMathRsa,
  evaluateSecurity,
  modInverse,
} from './utils/rsaMath';
import { generateWebCryptoKeyPair } from './utils/webCryptoRsa';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('workbench');
  const [mode, setMode] = useState<RsaMode>('educational');

  // Initial Math Key: p = 61, q = 53, n = 3233, phi = 3120, e = 17, d = 2753
  const [mathKey, setMathKey] = useState<RsaMathKey>(() => {
    const p = 61n;
    const q = 53n;
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    const e = 17n;
    const { d } = modInverse(e, phi);
    return {
      p,
      q,
      n,
      phi,
      e,
      d,
      bitLength: n.toString(2).length,
    };
  });

  // WebCrypto Key Data
  const [webCryptoData, setWebCryptoData] = useState<WebCryptoKeyData>({
    publicKeyPem: 'Generating 2048-bit RSA key...',
    privateKeyPem: 'Generating 2048-bit RSA key...',
    keyLength: 2048,
    publicKeyObj: null,
    privateKeyObj: null,
  });
  const [webCryptoKeyPair, setWebCryptoKeyPair] = useState<CryptoKeyPair | null>(null);
  const [isGeneratingWebCrypto, setIsGeneratingWebCrypto] = useState<boolean>(false);

  // Encryption & Decryption state
  const [plaintext, setPlaintext] = useState<string>('CRYPTOMETER');
  const [cipherBlocks, setCipherBlocks] = useState<bigint[]>([]);
  const [cipherHex, setCipherHex] = useState<string>('');
  const [cipherBase64, setCipherBase64] = useState<string>('');
  const [encSteps, setEncSteps] = useState<EncryptionStep[]>([]);
  const [encryptTimeMs, setEncryptTimeMs] = useState<number>(0.15);

  const [cipherBlocksInput, setCipherBlocksInput] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [decSteps, setDecSteps] = useState<DecryptionStep[]>([]);
  const [decryptTimeMs, setDecryptTimeMs] = useState<number>(0.32);

  // Benchmarking state
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [keyGenTimeMs, setKeyGenTimeMs] = useState<number>(1.2);

  // Cryptometer Metrics
  const [metrics, setMetrics] = useState<CryptometerMetrics>(() => {
    const sec = evaluateSecurity(12);
    return {
      keyBitLength: 12,
      securityRating: sec.rating,
      securityScore: sec.score,
      nistStatus: sec.nistStatus,
      factoringComplexity: sec.factoringComplexity,
      plaintextEntropy: 2.85,
      ciphertextEntropy: 3.32,
      entropyRatio: 116,
      encryptTimeMs: 0.15,
      decryptTimeMs: 0.32,
      keyGenTimeMs: 1.2,
      quantumVulnerability: sec.quantumVulnerability,
    };
  });

  // Handle Encryption
  const handleEncrypt = useCallback(() => {
    if (!plaintext.trim()) return;

    try {
      const res = encryptMathRsa(plaintext, mathKey.e, mathKey.n);
      setCipherBlocks(res.cipherBlocks);
      setCipherHex(res.cipherHex);
      setCipherBase64(res.cipherBase64);
      setEncSteps(res.steps);
      setEncryptTimeMs(res.executionTimeMs);

      // Also prefill decryption input
      const formattedInput = `[${res.cipherBlocks.join(', ')}]`;
      setCipherBlocksInput(formattedInput);

      // Compute Entropies
      const pEntropy = calculateShannonEntropy(plaintext);
      // Byte array from cipher blocks
      const cipherBytes: number[] = [];
      res.cipherBlocks.forEach((b) => {
        let temp = b;
        while (temp > 0n) {
          cipherBytes.push(Number(temp & 0xffn));
          temp = temp >> 8n;
        }
      });
      const cEntropy = calculateShannonEntropy(new Uint8Array(cipherBytes));

      const sec = evaluateSecurity(mode === 'educational' ? mathKey.bitLength : webCryptoData.keyLength);

      setMetrics((prev) => ({
        ...prev,
        keyBitLength: mode === 'educational' ? mathKey.bitLength : webCryptoData.keyLength,
        securityRating: sec.rating,
        securityScore: sec.score,
        nistStatus: sec.nistStatus,
        factoringComplexity: sec.factoringComplexity,
        quantumVulnerability: sec.quantumVulnerability,
        plaintextEntropy: pEntropy,
        ciphertextEntropy: cEntropy,
        entropyRatio: pEntropy > 0 ? Math.round((cEntropy / pEntropy) * 100) : 100,
        encryptTimeMs: res.executionTimeMs,
      }));
    } catch (err: any) {
      console.error(err);
    }
  }, [plaintext, mathKey, mode, webCryptoData.keyLength]);

  // Handle Decryption
  const handleDecrypt = useCallback(() => {
    try {
      // Parse blocks from input string like [123, 456] or 123, 456
      const cleaned = cipherBlocksInput.replace(/[\[\]]/g, '').trim();
      if (!cleaned) return;

      const blocks = cleaned
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => BigInt(s));

      const res = decryptMathRsa(blocks, mathKey.d, mathKey.n, plaintext.length);
      setDecryptedText(res.decryptedText);
      setDecSteps(res.steps);
      setDecryptTimeMs(res.executionTimeMs);

      setMetrics((prev) => ({
        ...prev,
        decryptTimeMs: res.executionTimeMs,
      }));
    } catch (err: any) {
      console.error('Decryption parse error:', err);
    }
  }, [cipherBlocksInput, mathKey, plaintext.length]);

  // Generate WebCrypto Keypair
  const handleGenerateWebCrypto = useCallback(
    async (length: 1024 | 2048 | 4096 = 2048) => {
      try {
        setIsGeneratingWebCrypto(true);
        const res = await generateWebCryptoKeyPair(length);
        setWebCryptoKeyPair(res.keyPair);
        setWebCryptoData({
          publicKeyPem: res.publicKeyPem,
          privateKeyPem: res.privateKeyPem,
          keyLength: length,
          publicKeyObj: res.keyPair.publicKey,
          privateKeyObj: res.keyPair.privateKey,
        });
        setKeyGenTimeMs(res.durationMs);

        const sec = evaluateSecurity(length);
        setMetrics((prev) => ({
          ...prev,
          keyBitLength: length,
          securityRating: sec.rating,
          securityScore: sec.score,
          nistStatus: sec.nistStatus,
          factoringComplexity: sec.factoringComplexity,
          quantumVulnerability: sec.quantumVulnerability,
          keyGenTimeMs: res.durationMs,
        }));
      } catch (err: any) {
        console.error('WebCrypto error:', err);
      } finally {
        setIsGeneratingWebCrypto(false);
      }
    },
    []
  );

  // Performance benchmark
  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const iterations = 40;
      let totalEnc = 0;
      let totalDec = 0;

      for (let i = 0; i < iterations; i++) {
        const enc = encryptMathRsa('CRYPTOMETER_BENCHMARK_TOKEN_2026', mathKey.e, mathKey.n);
        totalEnc += enc.executionTimeMs;
        const dec = decryptMathRsa(enc.cipherBlocks, mathKey.d, mathKey.n, 32);
        totalDec += dec.executionTimeMs;
      }

      const avgEnc = totalEnc / iterations;
      const avgDec = totalDec / iterations;

      setMetrics((prev) => ({
        ...prev,
        encryptTimeMs: avgEnc,
        decryptTimeMs: avgDec,
      }));
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Initial setup: generate keys and run initial encryption
  useEffect(() => {
    handleGenerateWebCrypto(2048);
  }, [handleGenerateWebCrypto]);

  useEffect(() => {
    handleEncrypt();
  }, [handleEncrypt]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        securityRating={metrics.securityRating}
        securityScore={metrics.securityScore}
        keyBitLength={metrics.keyBitLength}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: WORKBENCH (Main View) */}
        {activeTab === 'workbench' && (
          <div className="space-y-6">
            {/* 1. Key Generator (with Public (e, n) and Private (d, n) as in Image 1) */}
            <RsaKeyGenerator
              mode={mode}
              setMode={setMode}
              mathKey={mathKey}
              setMathKey={(key) => {
                setMathKey(key);
                const sec = evaluateSecurity(key.bitLength);
                setMetrics((prev) => ({
                  ...prev,
                  keyBitLength: key.bitLength,
                  securityRating: sec.rating,
                  securityScore: sec.score,
                  nistStatus: sec.nistStatus,
                  factoringComplexity: sec.factoringComplexity,
                  quantumVulnerability: sec.quantumVulnerability,
                }));
              }}
              webCryptoData={webCryptoData}
              onGenerateWebCrypto={handleGenerateWebCrypto}
              isGeneratingWebCrypto={isGeneratingWebCrypto}
            />

            {/* 2. Cryptometer Quick Gauges Bar */}
            <CryptometerGauges
              metrics={metrics}
              onRunBenchmark={handleRunBenchmark}
              isBenchmarking={isBenchmarking}
            />

            {/* 3. Encryption & Decryption Split Panes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RsaEncryptionPanel
                mode={mode}
                mathKey={mathKey}
                plaintext={plaintext}
                setPlaintext={setPlaintext}
                cipherBlocks={cipherBlocks}
                cipherHex={cipherHex}
                cipherBase64={cipherBase64}
                steps={encSteps}
                encryptTimeMs={encryptTimeMs}
                onEncrypt={handleEncrypt}
                onSendToDecrypt={() => {
                  setCipherBlocksInput(`[${cipherBlocks.join(', ')}]`);
                  handleDecrypt();
                }}
              />

              <RsaDecryptionPanel
                mode={mode}
                mathKey={mathKey}
                cipherBlocksInput={cipherBlocksInput}
                setCipherBlocksInput={setCipherBlocksInput}
                decryptedText={decryptedText}
                originalPlaintext={plaintext}
                steps={decSteps}
                decryptTimeMs={decryptTimeMs}
                onDecrypt={handleDecrypt}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CRYPTOMETER DEEP GAUGES */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <CryptometerGauges
              metrics={metrics}
              onRunBenchmark={handleRunBenchmark}
              isBenchmarking={isBenchmarking}
            />
          </div>
        )}

        {/* TAB 3: ALGORITHM MATRIX (From User Screenshot 2 & 3) */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <AlgorithmComparisonTable />
          </div>
        )}

        {/* TAB 4: HYBRID AES+RSA (From User Screenshot 3) */}
        {activeTab === 'hybrid' && (
          <div className="space-y-6">
            <HybridCryptoFlow
              rsaKeyPair={webCryptoKeyPair}
              publicKeyPem={webCryptoData.publicKeyPem}
            />
          </div>
        )}

        {/* TAB 5: MATH & PROOFS */}
        {activeTab === 'math' && (
          <div className="space-y-6">
            <MathStepVisualizer mathKey={mathKey} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Cryptometer Project • RSA Algorithm <span className="font-mono font-medium text-slate-700">Public (e, n) / Private (d, n)</span>
          </span>
          <span className="text-slate-400">
            Compliant with Web Crypto API • Modular BigInt Arithmetic Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
