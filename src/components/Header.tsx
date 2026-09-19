import React from 'react';
import { Shield, Key, Activity, GitCompare, Cpu, BookOpen, Download, Presentation } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  securityRating: string;
  securityScore: number;
  keyBitLength: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  securityRating,
  securityScore,
  keyBitLength,
}) => {
  const getRatingColor = (score: number) => {
    if (score < 40) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (score < 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const navItems = [
    { id: 'workbench', label: 'RSA Workbench', icon: Key },
    { id: 'metrics', label: 'Cryptometer Gauges', icon: Activity },
    { id: 'comparison', label: 'Algorithm Matrix', icon: GitCompare },
    { id: 'hybrid', label: 'Hybrid AES+RSA', icon: Cpu },
    { id: 'math', label: 'Math & Proofs', icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Cryptometer <span className="text-indigo-600 font-semibold text-sm px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">RSA Engine</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Public Key <span className="font-mono font-medium text-slate-700">(e, n)</span> & Private Key <span className="font-mono font-medium text-slate-700">(d, n)</span> Cryptosystem & Real-Time Metrics
              </p>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-500">Active Key:</span>
              <span className="font-mono font-bold text-slate-800">{keyBitLength}-bit</span>
            </div>

            <div className={`flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 ${getRatingColor(securityScore)}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>Strength: {securityRating}</span>
              <span className="font-mono text-slate-500">({securityScore}/100)</span>
            </div>

            <a
              href="/RSA_Cryptometer_Presentation.pptx"
              download="RSA_Cryptometer_Presentation.pptx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              title="Download Microsoft PowerPoint Presentation (.pptx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .PPTX</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 border-t border-slate-100 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
