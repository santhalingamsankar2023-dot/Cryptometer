import React, { useState } from 'react';
import { Cpu, ArrowRight, ShieldCheck, Lock, Key, Zap, CheckCircle2, Play } from 'lucide-react';
import { HybridEncryptedEnvelope, runHybridDecryption, runHybridEncryption } from '../utils/hybridCrypto';

interface HybridCryptoFlowProps {
  rsaKeyPair: CryptoKeyPair | null;
  publicKeyPem: string;
}

export const HybridCryptoFlow: React.FC<HybridCryptoFlowProps> = ({
  rsaKeyPair,
  publicKeyPem,
}) => {
  const [hybridInput, setHybridInput] = useState<string>(
    'Professional Cryptometer Payload: Financial Transaction #49281, Amount: $50,000.00 USD, Routing: 021000021'
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [envelope, setEnvelope] = useState<HybridEncryptedEnvelope | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [rawPayload, setRawPayload] = useState<any>(null);

  const handleExecuteHybrid = async () => {
    if (!rsaKeyPair) {
      alert('Please wait for RSA key generation or generate a WebCrypto key first.');
      return;
    }
    try {
      setIsRunning(true);
      setDecryptedText(null);

      // 1. Run Hybrid Encryption
      const res = await runHybridEncryption(hybridInput, rsaKeyPair.publicKey);
      setEnvelope(res.envelope);
      setRawPayload(res.rawPayload);

      // 2. Run Hybrid Decryption
      const decRes = await runHybridDecryption(
        res.rawPayload.encryptedKeyBuffer,
        res.rawPayload.cipherBuffer,
        res.rawPayload.iv,
        rsaKeyPair.privateKey
      );
      setDecryptedText(decRes.decryptedText);
    } catch (e: any) {
      console.error(e);
      alert('Hybrid encryption error: ' + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Professional Cryptometer: Hybrid Architecture</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Combining <strong className="text-slate-800">AES-256-GCM</strong> (high-throughput symmetric cipher) + <strong className="text-slate-800">RSA-2048/4096</strong> (asymmetric key encapsulation).
        </p>
      </div>

      {/* Visual Workflow Steps (HTTPS / Banking standard) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-2">
            1
          </div>
          <h4 className="text-xs font-bold text-slate-900">Generate AES Key</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Generate ephemeral 256-bit symmetric session key via cryptographically secure RNG.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-2">
            2
          </div>
          <h4 className="text-xs font-bold text-slate-900">AES Data Encryption</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Encrypt bulk message data at hardware speeds (GB/s) using AES-256-GCM with unique IV.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-2">
            3
          </div>
          <h4 className="text-xs font-bold text-slate-900">RSA Key Encapsulation</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Encrypt the 32-byte AES key using the recipient's RSA Public Key (e, n).
          </p>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-2">
            4
          </div>
          <h4 className="text-xs font-bold text-emerald-950">Recipient Decrypts</h4>
          <p className="text-[11px] text-emerald-800 mt-1">
            RSA Private Key decrypts AES key, which decrypts bulk ciphertext in real-time.
          </p>
        </div>
      </div>

      {/* Input & Action */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
          Payload for Hybrid Encryption
        </label>
        <textarea
          rows={2}
          value={hybridInput}
          onChange={(e) => setHybridInput(e.target.value)}
          className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <button
          id="btn-run-hybrid"
          onClick={handleExecuteHybrid}
          disabled={isRunning || !rsaKeyPair}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Processing Hybrid Pipeline...' : 'Execute Hybrid AES-256 + RSA Encryption'}
        </button>
      </div>

      {/* Envelope Inspection */}
      {envelope && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Transmitted Cryptographic Envelope
            </span>
            <span className="text-xs text-slate-500">
              Total execution: <strong className="font-mono text-slate-800">{envelope.totalTimeMs.toFixed(2)} ms</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ephemeral AES Key & RSA-wrapped Key */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">1. Raw 256-bit AES Session Key</span>
                <div className="font-mono text-xs text-amber-700 bg-white p-2 rounded-lg border border-slate-200 break-all mt-1">
                  {envelope.aesKeyRawHex}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  2. RSA Encrypted AES Key (Transmitted in Header)
                </span>
                <div className="font-mono text-xs text-indigo-900 bg-white p-2 rounded-lg border border-slate-200 break-all mt-1 max-h-24 overflow-y-auto">
                  {envelope.encryptedKeyHex}
                </div>
              </div>
            </div>

            {/* AES-GCM Ciphertext & IV */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">3. AES-GCM 96-bit Nonce / IV</span>
                <div className="font-mono text-xs text-purple-700 bg-white p-2 rounded-lg border border-slate-200 break-all mt-1">
                  {envelope.ivHex}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  4. AES-GCM Encrypted Payload (Body)
                </span>
                <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200 break-all mt-1 max-h-24 overflow-y-auto">
                  {envelope.encryptedDataHex}
                </div>
              </div>
            </div>
          </div>

          {/* Decryption Verification */}
          {decryptedText && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recipient Verified Output (RSA-Unwrapped AES Key → Decrypted Data)</span>
              </div>
              <div className="font-mono text-xs bg-white p-3 rounded-lg border border-emerald-200 text-slate-900 font-semibold break-all">
                {decryptedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
