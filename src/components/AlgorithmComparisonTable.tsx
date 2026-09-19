import React, { useState } from 'react';
import { Check, X, Shield, ArrowRight, Play, Info, Sparkles, Key } from 'lucide-react';
import { ALGORITHM_COMPARISON_DATA, runCaesarCipher, simulateDiffieHellman } from '../utils/algorithmComparison';

export const AlgorithmComparisonTable: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'caesar-demo' | 'dh-demo'>('matrix');

  // Caesar demo state
  const [caesarInput, setCaesarInput] = useState<string>('CRYPTOMETER PROJECT');
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [caesarResult, setCaesarResult] = useState<{ cipher: string; decrypted: string } | null>(() =>
    runCaesarCipher('CRYPTOMETER PROJECT', 3)
  );

  // Diffie-Hellman demo state
  const [dhP, setDhP] = useState<string>('353');
  const [dhG, setDhG] = useState<string>('3');
  const [dhAliceSecret, setDhAliceSecret] = useState<string>('97');
  const [dhBobSecret, setDhBobSecret] = useState<string>('233');
  const [dhResult, setDhResult] = useState<any>(() =>
    simulateDiffieHellman(353n, 3n, 97n, 233n)
  );

  const handleRunCaesar = () => {
    setCaesarResult(runCaesarCipher(caesarInput, caesarShift));
  };

  const handleRunDh = () => {
    try {
      const res = simulateDiffieHellman(
        BigInt(dhP),
        BigInt(dhG),
        BigInt(dhAliceSecret),
        BigInt(dhBobSecret)
      );
      setDhResult(res);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Cryptometer Algorithm Selection & Comparison</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparative analysis of algorithms evaluated for Cryptometer (from project blueprint)
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Algorithm Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('caesar-demo')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'caesar-demo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Caesar Cipher Demo
          </button>
          <button
            onClick={() => setActiveSubTab('dh-demo')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'dh-demo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Diffie-Hellman Key Exchange
          </button>
        </div>
      </div>

      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Exact Recreation & Expansion of the Table in Screenshot 2 */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-3.5">Algorithm</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-center">Encryption</th>
                  <th className="p-3.5 text-center">Decryption</th>
                  <th className="p-3.5 text-center">Key Exchange</th>
                  <th className="p-3.5">Security Level</th>
                  <th className="p-3.5">Suitable for Cryptometer?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ALGORITHM_COMPARISON_DATA.map((item) => {
                  const isRsa = item.id === 'rsa';
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isRsa ? 'bg-indigo-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">{item.name}</span>
                          {isRsa && (
                            <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5 max-w-xs">{item.description}</p>
                      </td>

                      <td className="p-3.5 text-slate-600">{item.type}</td>

                      <td className="p-3.5 text-center">
                        {item.encryption ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {item.decryption ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {item.keyExchange ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.securityLevel === 'Very Low'
                              ? 'bg-rose-100 text-rose-800'
                              : item.securityLevel === 'High'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.securityLevel}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {item.suitableStatus === 'yes' ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <Check className="w-4 h-4" /> {item.suitableForCryptometer}
                          </span>
                        ) : item.suitableStatus === 'best-bulk' ? (
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            ★ {item.suitableForCryptometer}
                          </span>
                        ) : item.suitableStatus === 'key-exchange-only' ? (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            ▲ {item.suitableForCryptometer}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">
                            {item.suitableForCryptometer}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Screenshot 3 Recommendations Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900">For an Academic Mini Project</h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-800">• Caesar Cipher:</span>
                  <span>Simple implementation, demonstrates basic cryptography, but not secure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-700 font-bold">• RSA Algorithm:</span>
                  <span>Public-key cryptography, supports encryption and decryption, widely used in secure communication. (Implemented here!)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-indigo-900 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-indigo-950">For a Professional Cryptometer</h4>
              </div>
              <p className="text-xs text-indigo-900 mb-2">
                Use a hybrid approach matching real-world HTTPS and banking systems:
              </p>
              <ul className="text-xs text-indigo-950 space-y-1.5 font-medium">
                <li>• <strong className="text-slate-900">AES-256:</strong> Encrypt the actual data payload</li>
                <li>• <strong className="text-slate-900">RSA-2048 / RSA-4096:</strong> Encrypt the AES session key</li>
                <li>• <strong className="text-slate-900">Diffie-Hellman / ECDH:</strong> Secure key exchange</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Caesar Cipher Interactive Demo */}
      {activeSubTab === 'caesar-demo' && (
        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Caesar Cipher Live Simulation</h3>
            <p className="text-xs text-slate-500">
              Monoalphabetic substitution where each character is shifted by fixed key <span className="font-mono">k</span> (Security: Very Low).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plaintext</label>
              <input
                type="text"
                value={caesarInput}
                onChange={(e) => setCaesarInput(e.target.value)}
                className="w-full text-xs font-mono p-2.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Key (k): {caesarShift}</label>
              <input
                type="range"
                min="1"
                max="25"
                value={caesarShift}
                onChange={(e) => setCaesarShift(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>

          <button
            onClick={handleRunCaesar}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Compute Caesar Cipher
          </button>

          {caesarResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Ciphertext (Shift +{caesarShift})</span>
                <div className="font-mono text-sm font-bold text-purple-700 mt-1">{caesarResult.cipher}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Decrypted Text (Shift -{caesarShift})</span>
                <div className="font-mono text-sm font-bold text-emerald-700 mt-1">{caesarResult.decrypted}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diffie-Hellman Key Exchange Interactive Demo */}
      {activeSubTab === 'dh-demo' && (
        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Diffie-Hellman Key Exchange Simulation</h3>
            <p className="text-xs text-slate-500">
              Establish a shared secret between Alice and Bob over an open channel using discrete logarithms: <span className="font-mono">s = Bᵃ mod p = Aᵇ mod p</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Public Prime (p)</label>
              <input
                type="text"
                value={dhP}
                onChange={(e) => setDhP(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Public Generator (g)</label>
              <input
                type="text"
                value={dhG}
                onChange={(e) => setDhG(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alice Private (a)</label>
              <input
                type="text"
                value={dhAliceSecret}
                onChange={(e) => setDhAliceSecret(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bob Private (b)</label>
              <input
                type="text"
                value={dhBobSecret}
                onChange={(e) => setDhBobSecret(e.target.value)}
                className="w-full text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleRunDh}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Compute Shared Secret
          </button>

          {dhResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500">Alice Public (A = gᵃ mod p)</span>
                <div className="font-mono text-sm font-bold text-indigo-700 mt-1">{dhResult.alicePublic.toString()}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500">Bob Public (B = gᵇ mod p)</span>
                <div className="font-mono text-sm font-bold text-indigo-700 mt-1">{dhResult.bobPublic.toString()}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[11px] font-bold text-emerald-800">Shared Secret Key (s)</span>
                <div className="font-mono text-sm font-bold text-emerald-900 mt-1">
                  s = {dhResult.sharedSecretAlice.toString()} ({dhResult.match ? 'Match ✓' : 'Mismatch ✗'})
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
