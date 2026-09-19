import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { RsaMathKey } from '../types/crypto';
import { extendedGcd } from '../utils/rsaMath';

interface MathStepVisualizerProps {
  mathKey: RsaMathKey;
}

export const MathStepVisualizer: React.FC<MathStepVisualizerProps> = ({ mathKey }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  // Compute extended Euclidean table for current key
  const extResult = extendedGcd(mathKey.e, mathKey.phi);

  const steps = [
    {
      id: 1,
      title: 'Step 1: Choose Two Distinct Primes',
      formula: 'p, q ∈ ℙ with p ≠ q',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            RSA begins by selecting two large, independent prime numbers <strong className="font-mono text-slate-900">p</strong> and <strong className="font-mono text-slate-900">q</strong>. In commercial RSA (2048-bit), these primes are each 1024 bits long (~308 decimal digits).
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
            <div>Prime p = {mathKey.p.toString()}</div>
            <div>Prime q = {mathKey.q.toString()}</div>
          </div>
          <p className="text-slate-500">
            Hardness principle: Multiplying <span className="font-mono">p · q</span> is trivial <span className="font-mono">O(n²)</span>, but factoring <span className="font-mono">n</span> back into <span className="font-mono">p</span> and <span className="font-mono">q</span> is computationally intractable for classical computers (Integer Factorization Problem).
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Step 2: Compute Modulus & Euler\'s Totient',
      formula: 'n = p · q  and  φ(n) = (p - 1)(q - 1)',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            The modulus <strong className="font-mono text-slate-900">n</strong> serves as the common divisor for both public and private operations.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono space-y-1">
            <div>Modulus n = p × q = {mathKey.p.toString()} × {mathKey.q.toString()} = <strong className="text-indigo-900">{mathKey.n.toString()}</strong></div>
            <div>Bit-length: {mathKey.bitLength} bits</div>
            <div>Euler Totient φ(n) = ({mathKey.p.toString()} - 1) × ({mathKey.q.toString()} - 1) = <strong className="text-purple-900">{mathKey.phi.toString()}</strong></div>
          </div>
          <p className="text-slate-500">
            Euler's totient <span className="font-mono">φ(n)</span> counts how many positive integers up to <span className="font-mono">n</span> are coprime to <span className="font-mono">n</span>. Since <span className="font-mono">p</span> and <span className="font-mono">q</span> are prime, <span className="font-mono">φ(p · q) = φ(p) · φ(q) = (p - 1)(q - 1)</span>.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Step 3: Select Public Exponent e',
      formula: '1 < e < φ(n)  and  gcd(e, φ(n)) = 1',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            The public exponent <strong className="font-mono text-slate-900">e</strong> must be coprime to <span className="font-mono">φ(n)</span>, ensuring that a modular multiplicative inverse <span className="font-mono">d</span> exists.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono space-y-1">
            <div>Selected e = <strong className="text-indigo-700">{mathKey.e.toString()}</strong></div>
            <div>gcd(e, φ(n)) = gcd({mathKey.e.toString()}, {mathKey.phi.toString()}) = 1 (Coprime Confirmed ✓)</div>
          </div>
          <p className="text-slate-500">
            In modern cryptographic implementations, <span className="font-mono">e = 65537 (2¹⁶ + 1)</span> is standard because its binary representation <span className="font-mono">10000000000000001₂</span> contains only two 1-bits, enabling fast modular exponentiation via 17 multiplications while preventing Low Exponent attacks.
          </p>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Step 4: Extended Euclidean Algorithm for d',
      formula: 'd ≡ e⁻¹ (mod φ(n))  ⟹  d · e ≡ 1 (mod φ(n))',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            The private exponent <strong className="font-mono text-slate-900">d</strong> is the modular multiplicative inverse of <span className="font-mono">e modulo φ(n)</span>, calculated using the Extended Euclidean Algorithm:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
            <div>Computed Private Exponent d = <strong className="text-purple-700">{mathKey.d.toString()}</strong></div>
            <div className="text-[11px] text-slate-500 mt-1">Verification: ({mathKey.e.toString()} × {mathKey.d.toString()}) mod {mathKey.phi.toString()} = {((mathKey.e * mathKey.d) % mathKey.phi).toString()} ✓</div>
          </div>

          {/* Extended Euclidean Steps Table */}
          {extResult.steps.length > 0 && (
            <div className="mt-2">
              <span className="font-semibold text-slate-700">Extended Euclidean Tableau:</span>
              <div className="overflow-x-auto border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-1.5">Step</th>
                      <th className="p-1.5">rᵢ₋₁</th>
                      <th className="p-1.5">rᵢ</th>
                      <th className="p-1.5">q = ⌊rᵢ₋₁ / rᵢ⌋</th>
                      <th className="p-1.5">Remainder rᵢ₊₁</th>
                      <th className="p-1.5">tᵢ₊₁ = tᵢ₋₁ - q · tᵢ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extResult.steps.slice(0, 10).map((s) => (
                      <tr key={s.step} className="hover:bg-slate-50">
                        <td className="p-1.5">{s.step}</td>
                        <td className="p-1.5">{s.rPrev.toString()}</td>
                        <td className="p-1.5">{s.rCurr.toString()}</td>
                        <td className="p-1.5">{s.q.toString()}</td>
                        <td className="p-1.5 font-bold">{s.rNext.toString()}</td>
                        <td className="p-1.5 text-purple-700">{s.tNext.toString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 5,
      title: 'Step 5: Euler\'s Totient Theorem Mathematical Proof',
      formula: 'M^(e · d) ≡ M^(1 + k · φ(n)) ≡ M (mod n)',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Why does RSA decryption always return the exact original message?</p>
          <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 space-y-2 leading-relaxed">
            <p>
              1. By definition of modular inverse, <span className="font-mono font-bold">e · d ≡ 1 (mod φ(n))</span>, which means there exists an integer <span className="font-mono">k</span> such that <span className="font-mono">e · d = 1 + k · φ(n)</span>.
            </p>
            <p>
              2. According to <strong>Euler's Totient Theorem</strong>, if <span className="font-mono">gcd(M, n) = 1</span>, then <span className="font-mono font-bold">M^(φ(n)) ≡ 1 (mod n)</span>.
            </p>
            <p>
              3. When decrypting: <br />
              <span className="font-mono font-bold">Cᵈ ≡ (Mᵉ)ᵈ ≡ M^(e · d) ≡ M^(1 + k · φ(n)) ≡ M · (M^(φ(n)))ᵏ ≡ M · (1)ᵏ ≡ M (mod n)</span>.
            </p>
            <p className="text-[11px] text-indigo-900">
              Even if <span className="font-mono">gcd(M, n) ≠ 1</span>, by the Chinese Remainder Theorem and Fermat's Little Theorem modulo <span className="font-mono">p</span> and <span className="font-mono">q</span>, the equivalence still holds for all <span className="font-mono">M &lt; n</span>.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Mathematical Foundation & Step-by-Step Proofs</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete arithmetic walkthrough from Euler's Totient to the Extended Euclidean Algorithm
        </p>
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
              activeStep === s.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">Step {s.id}</div>
            <div className={`text-[11px] truncate mt-0.5 ${activeStep === s.id ? 'text-indigo-300' : 'text-slate-500'}`}>
              {s.formula}
            </div>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">{steps[activeStep - 1].title}</h3>
          <span className="font-mono text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md font-bold text-indigo-700">
            {steps[activeStep - 1].formula}
          </span>
        </div>
        {steps[activeStep - 1].content}
      </div>
    </div>
  );
};
