import React from 'react';
import { Shield, Activity, Zap, Cpu, AlertTriangle, CheckCircle2, Lock, Terminal } from 'lucide-react';
import { CryptometerMetrics } from '../types/crypto';

interface CryptometerGaugesProps {
  metrics: CryptometerMetrics;
  onRunBenchmark?: () => void;
  isBenchmarking?: boolean;
}

export const CryptometerGauges: React.FC<CryptometerGaugesProps> = ({
  metrics,
  onRunBenchmark,
  isBenchmarking,
}) => {
  // Gauge color determination
  const getScoreColor = (score: number) => {
    if (score < 30) return { bg: 'bg-rose-500', text: 'text-rose-600', ring: 'border-rose-400', badge: 'bg-rose-100 text-rose-800' };
    if (score < 60) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'border-amber-400', badge: 'bg-amber-100 text-amber-800' };
    if (score < 85) return { bg: 'bg-blue-500', text: 'text-blue-600', ring: 'border-blue-400', badge: 'bg-blue-100 text-blue-800' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' };
  };

  const scoreTheme = getScoreColor(metrics.securityScore);

  // Entropy evaluation
  const entropyQuality =
    metrics.ciphertextEntropy > 7.0
      ? { label: 'High Randomness (Cryptographically Ideal)', color: 'text-emerald-600' }
      : metrics.ciphertextEntropy > 4.5
      ? { label: 'Moderate Dispersion', color: 'text-amber-600' }
      : { label: 'Low Entropy (Statistical Patterns Visible)', color: 'text-rose-600' };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Benchmark */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Cryptometer Live Instrumentation</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time cryptographic metrics, entropy calculation, NIST standard verification, and latency benchmarks.
          </p>
        </div>
        {onRunBenchmark && (
          <button
            id="btn-run-benchmark"
            onClick={onRunBenchmark}
            disabled={isBenchmarking}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isBenchmarking ? 'animate-spin' : ''}`} />
            {isBenchmarking ? 'Running Benchmark...' : 'Run Performance Benchmark'}
          </button>
        )}
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meter 1: Security Strength Meter */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Strength</span>
              <Shield className={`w-4 h-4 ${scoreTheme.text}`} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.securityScore}</span>
              <span className="text-sm text-slate-400">/ 100</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${scoreTheme.badge}`}>
                {metrics.securityRating}
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${scoreTheme.bg}`}
                style={{ width: `${metrics.securityScore}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Key Modulus:</span>
            <span className="font-mono font-bold text-slate-800">{metrics.keyBitLength} bits</span>
          </div>
        </div>

        {/* Meter 2: Shannon Entropy Meter */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cipher Entropy</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.ciphertextEntropy.toFixed(2)}</span>
              <span className="text-sm text-slate-400">/ 8.00 bits</span>
            </div>
            {/* Plaintext vs Ciphertext Entropy comparison */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Plaintext: {metrics.plaintextEntropy.toFixed(2)} bits</span>
                <span>Cipher: {metrics.ciphertextEntropy.toFixed(2)} bits</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className="h-2 bg-slate-400"
                  style={{ width: `${(metrics.plaintextEntropy / 8) * 100}%` }}
                ></div>
                <div
                  className="h-2 bg-purple-600"
                  style={{ width: `${(Math.max(0, metrics.ciphertextEntropy - metrics.plaintextEntropy) / 8) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium truncate text-purple-700">
            {entropyQuality.label}
          </div>
        </div>

        {/* Meter 3: Encryption Latency */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Encryption Speed</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.encryptTimeMs.toFixed(2)}</span>
              <span className="text-sm text-slate-400">ms</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Formula: <span className="font-mono text-slate-700">C = Mᵉ mod n</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Fast Exponent (e):</span>
            <span className="font-mono font-medium text-emerald-600">65537 / 3</span>
          </div>
        </div>

        {/* Meter 4: Decryption Latency */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Decryption Speed</span>
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.decryptTimeMs.toFixed(2)}</span>
              <span className="text-sm text-slate-400">ms</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Formula: <span className="font-mono text-slate-700">M = Cᵈ mod n</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Private Exponent (d):</span>
            <span className="font-mono font-medium text-slate-800">Full {metrics.keyBitLength}-bit size</span>
          </div>
        </div>
      </div>

      {/* Deep Cryptographic Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factorization & Security Standard Assessment */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Cryptographic Hardness & NIST Status</h3>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">NIST Standard Compliance</div>
              <div className="text-sm font-medium text-slate-800 mt-1 flex items-start gap-2">
                {metrics.securityScore >= 70 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{metrics.nistStatus}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Classical Factoring Complexity</div>
              <div className="text-sm font-mono text-slate-800 mt-1 flex items-start gap-2">
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{metrics.factoringComplexity}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Based on General Number Field Sieve (GNFS): <code className="text-slate-700">exp((64/9·b)^(1/3) · (ln b)^(2/3))</code>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Quantum Vulnerability (Shor's Algorithm)</div>
              <div className="text-sm text-slate-800 mt-1 flex items-start gap-2">
                <Terminal className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>{metrics.quantumVulnerability}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Shor's quantum algorithm can factor in polynomial time <code className="text-slate-700">O((log N)³)</code> when sufficiently large fault-tolerant quantum computers emerge.
              </p>
            </div>
          </div>
        </div>

        {/* Why RSA Has Computational Asymmetry */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">RSA Asymmetry & Performance Rationale</h3>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <p className="font-semibold text-indigo-950 mb-1">Why is Decryption Slower than Encryption?</p>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  The public exponent <span className="font-mono font-bold">e</span> is intentionally chosen as a small Fermat prime (commonly <span className="font-mono font-bold">65537 = 2¹⁶ + 1</span> or <span className="font-mono font-bold">3</span>), requiring only 17 modular multiplications.
                </p>
                <p className="text-xs text-indigo-900 leading-relaxed mt-1.5">
                  In contrast, the private exponent <span className="font-mono font-bold">d</span> has roughly the same bit-length as the entire modulus <span className="font-mono font-bold">n</span> (e.g. 2048 bits), demanding extensive square-and-multiply operations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Key Generation Time</span>
                  <div className="text-lg font-mono font-bold text-slate-800 mt-1">
                    {metrics.keyGenTimeMs.toFixed(2)} ms
                  </div>
                  <span className="text-[11px] text-slate-500">Finding safe primes p, q</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Asymmetric Ratio (Dec/Enc)</span>
                  <div className="text-lg font-mono font-bold text-slate-800 mt-1">
                    {(metrics.decryptTimeMs / Math.max(0.01, metrics.encryptTimeMs)).toFixed(1)}x
                  </div>
                  <span className="text-[11px] text-slate-500">Decryption computation ratio</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cryptometer Engine:</span>
            <span className="font-mono font-medium text-slate-700">Modular Exponentiation Square-and-Multiply</span>
          </div>
        </div>
      </div>
    </div>
  );
};
