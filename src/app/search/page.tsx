'use client';

import { useState } from 'react';
import StepMcVersion from '@/components/wizard/StepMcVersion';

export type WizardState = {
  mcVersion: string | null;
  loader: string | null;
  loaderVersion: string | null;
};

const STEPS = ['MC 버전'];

export default function SearchPage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    mcVersion: null,
    loader: null,
    loaderVersion: null,
  });

  function next() {
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-[#e2e8f0]">
      {/* Nav */}
      <nav className="border-b border-[#1e2d45] sticky top-0 z-50 backdrop-blur-md bg-[#080c14]/80">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="font-mono text-sm font-bold text-[#00d4aa] hover:opacity-80 transition-opacity">
            ← distro-builder
          </a>
          <span className="text-[#1e2d45]">/</span>
          <span className="font-mono text-sm text-[#94a3b8]">new</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                  i < step
                    ? 'bg-[#00d4aa] border-[#00d4aa] text-[#080c14]'
                    : i === step
                    ? 'border-[#00d4aa] text-[#00d4aa]'
                    : 'border-[#1e2d45] text-[#475569]'
                }`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-[#e2e8f0]' : 'text-[#475569]'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${i < step ? 'bg-[#00d4aa]' : 'bg-[#1e2d45]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* 스텝 컨텐츠 */}
        {step === 0 && (
          <StepMcVersion
            selected={state.mcVersion}
            onSelect={v => setState(s => ({ ...s, mcVersion: v }))}
            onNext={next}
          />
        )}
      </main>
    </div>
  );
}
