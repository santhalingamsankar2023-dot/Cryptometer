import React, { useState } from 'react';
import { Lock, Copy, Check, ArrowDown, ArrowRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { EncryptionStep, RsaMathKey, RsaMode } from '../types/crypto';

interface RsaEncryptionPanelProps {
  mode: RsaMode;
  mathKey: RsaMathKey;
  plaintext: string;
  setPlaintext: (text: string) => void;
  cipherBlocks: bigint[];
  cipherHex: string;
  cipherBase64: string;
  steps: EncryptionStep[];
  encryptTimeMs: number;
  onEncrypt: () => void;
  onSendToDecrypt: () => void;
}

export const RsaEncryptionPanel: React.FC<RsaEncryptionPanelProps> = ({
  mode,
  mathKey,
  plaintext,
  setPlaintext,
  cipherBlocks,
  cipherHex,
  cipherBase64,
  steps,
  encryptTimeMs,
  onEncrypt,
  onSendToDecrypt,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState<boolean>(true);

  const sampleMessages = [
    'HELLO RSA',
    'Cryptometer 2026',
    'Secret Token 9482',
    'Public-Key Cryptography',
  ];

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">RSA Encryption Engine</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transform plaintext message <span className="font-mono font-semibold text-slate-700">M</span> into ciphertext <span className="font-mono font-semibold text-slate-700">C ≡ Mᵉ (mod n)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-indigo-900">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Using Public Key: <strong className="font-mono">(e: {mathKey.e.toString()}, n: {mathKey.n.toString().slice(0, 10)}...)</strong></span>
        </div>
      </div>

      {/* Input Plaintext Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Plaintext Message (M)
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {sampleMessages.map((msg) => (
              <button
                key={msg}
                onClick={() => setPlaintext(msg)}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="input-plaintext"
          rows={3}
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="Enter message to encrypt..."
          className="w-full text-sm font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-slate-500">
            Length: <strong className="font-mono text-slate-700">{plaintext.length} characters</strong> ({new TextEncoder().encode(plaintext).length} bytes)
          </div>
          <button
            id="btn-encrypt-message"
            onClick={onEncrypt}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Encrypt with Public Key (e, n)
          </button>
        </div>
      </div>

      {/* Ciphertext Output Formats */}
      {cipherBlocks.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Ciphertext Result (C)</span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Time: <strong className="font-mono text-slate-800">{encryptTimeMs.toFixed(2)} ms</strong></span>
              <button
                id="btn-send-to-decrypt"
                onClick={onSendToDecrypt}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all"
              >
                <span>Send to Decryptor</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Formats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Decimal Blocks */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">Decimal Integer Blocks [C₁, C₂, ...]</span>
                <button
                  onClick={() => handleCopy(`[${cipherBlocks.join(', ')}]`, 'decimal')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {copiedFormat === 'decimal' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedFormat === 'decimal' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 break-all max-h-20 overflow-y-auto">
                [{cipherBlocks.slice(0, 10).map((b) => b.toString()).join(', ')}{cipherBlocks.length > 10 ? ', ...' : ''}]
              </div>
            </div>

            {/* Hexadecimal */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">Hexadecimal Stream</span>
                <button
                  onClick={() => handleCopy(cipherHex, 'hex')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {copiedFormat === 'hex' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedFormat === 'hex' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-indigo-900 bg-white p-2.5 rounded-lg border border-slate-200 break-all max-h-20 overflow-y-auto">
                {cipherHex || 'None'}
              </div>
            </div>
          </div>

          {/* Modular Math Steps Toggle Table */}
          {mode === 'educational' && steps.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                <span>Step-by-step Modular Exponentiation: C ≡ Mᵉ (mod n)</span>
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSteps && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl mt-2 max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2.5">Char</th>
                        <th className="p-2.5">Chunk / Byte (M)</th>
                        <th className="p-2.5">Modular Operation (Mᵉ mod n)</th>
                        <th className="p-2.5">Cipher Block (C)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {steps.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{step.char}</td>
                          <td className="p-2.5 text-slate-600">{step.ascii}</td>
                          <td className="p-2.5 text-indigo-700">{step.formula}</td>
                          <td className="p-2.5 font-bold text-purple-700">{step.cipherBlock.toString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
