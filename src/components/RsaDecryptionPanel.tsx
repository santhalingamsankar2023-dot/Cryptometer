import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { DecryptionStep, RsaMathKey, RsaMode } from '../types/crypto';

interface RsaDecryptionPanelProps {
  mode: RsaMode;
  mathKey: RsaMathKey;
  cipherBlocksInput: string;
  setCipherBlocksInput: (input: string) => void;
  decryptedText: string;
  originalPlaintext: string;
  steps: DecryptionStep[];
  decryptTimeMs: number;
  onDecrypt: () => void;
}

export const RsaDecryptionPanel: React.FC<RsaDecryptionPanelProps> = ({
  mode,
  mathKey,
  cipherBlocksInput,
  setCipherBlocksInput,
  decryptedText,
  originalPlaintext,
  steps,
  decryptTimeMs,
  onDecrypt,
}) => {
  const [showSteps, setShowSteps] = useState<boolean>(true);

  // Check if decrypted matches original
  const isMatch = originalPlaintext && decryptedText && originalPlaintext === decryptedText;
  const isMismatch = originalPlaintext && decryptedText && originalPlaintext !== decryptedText;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">RSA Decryption Engine</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconstruct original plaintext <span className="font-mono font-semibold text-slate-700">M ≡ Cᵈ (mod n)</span> using confidential private exponent <span className="font-mono font-semibold text-slate-700">d</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg text-purple-900">
          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
          <span>Using Private Key: <strong className="font-mono">(d, n)</strong></span>
        </div>
      </div>

      {/* Ciphertext Input Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
          Ciphertext Input (Decimal Array or Hex)
        </label>
        <textarea
          id="input-ciphertext-blocks"
          rows={3}
          value={cipherBlocksInput}
          onChange={(e) => setCipherBlocksInput(e.target.value)}
          placeholder="e.g. [1420, 2819, 891, ...] or paste ciphertext blocks"
          className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">
            Private exponent length: <strong className="font-mono text-slate-700">{mathKey.d.toString(2).length} bits</strong>
          </span>
          <button
            id="btn-decrypt-message"
            onClick={onDecrypt}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-purple-400" />
            Decrypt with Private Key (d, n)
          </button>
        </div>
      </div>

      {/* Decrypted Plaintext Output */}
      {decryptedText && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Recovered Plaintext (M)</span>
            <span className="text-xs text-slate-500">
              Latency: <strong className="font-mono text-slate-800">{decryptTimeMs.toFixed(2)} ms</strong>
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-sm font-mono font-bold text-slate-900 break-all bg-white p-3 rounded-lg border border-slate-200">
              {decryptedText}
            </div>

            {/* Verification Status */}
            <div className="mt-3 flex items-center justify-between text-xs">
              {isMatch && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrity Confirmed: Recovered text matches original plaintext exactly (100% Match)</span>
                </div>
              )}
              {isMismatch && (
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Differs from current plaintext input (may have been encrypted from earlier input)</span>
                </div>
              )}
              {!originalPlaintext && (
                <div className="text-slate-500">
                  Decryption complete.
                </div>
              )}
            </div>
          </div>

          {/* Mathematical Step-by-Step Table */}
          {mode === 'educational' && steps.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                <span>Step-by-step Modular Recovery: M ≡ Cᵈ (mod n)</span>
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSteps && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl mt-2 max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2.5">Cipher Block (C)</th>
                        <th className="p-2.5">Modular Operation (Cᵈ mod n)</th>
                        <th className="p-2.5">Recovered Value (M)</th>
                        <th className="p-2.5">Decoded Char</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {steps.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-purple-700">{step.cipherBlock.toString()}</td>
                          <td className="p-2.5 text-slate-600">{step.formula}</td>
                          <td className="p-2.5 font-semibold text-indigo-700">{step.plainVal.toString()}</td>
                          <td className="p-2.5 font-bold text-slate-900">{step.char}</td>
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
