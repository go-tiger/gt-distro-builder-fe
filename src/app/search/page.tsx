'use client';

import { useState } from 'react';
import StepMcVersion from '@/components/wizard/StepMcVersion';
import StepLoader from '@/components/wizard/StepLoader';
import StepLoaderVersion from '@/components/wizard/StepLoaderVersion';
import StepModSearch from '@/components/wizard/StepModSearch';
import StepModOptions from '@/components/wizard/StepModOptions';
import StepResourcePackSearch from '@/components/wizard/StepResourcePackSearch';
import StepShaderPackSearch from '@/components/wizard/StepShaderPackSearch';
import StepExtraFiles from '@/components/wizard/StepExtraFiles';
import StepJsonPreview from '@/components/wizard/StepJsonPreview';
import type { SelectedMod, SelectedResourcePack, SelectedShaderPack, SelectedExtraFile } from '@/types/wizard';

type WizardState = {
  mcVersion: string | null;
  loader: string | null;
  loaderVersion: string | null;
  mods: SelectedMod[];
  resourcePacks: SelectedResourcePack[];
  shaderPacks: SelectedShaderPack[];
  extraFiles: SelectedExtraFile[];
};

const STEPS = ['MC 버전', '로더', '로더 버전', '모드 검색', '모드 옵션', '리소스팩', '쉐이더팩', '기타 파일', 'JSON 생성'];

export default function SearchPage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    mcVersion: null,
    loader: null,
    loaderVersion: null,
    mods: [],
    resourcePacks: [],
    shaderPacks: [],
    extraFiles: [],
  });

  function next() {
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <div className='min-h-screen bg-[#080c14] text-[#e2e8f0]'>
      {/* Nav */}
      <nav className='border-b border-[#1e2d45] sticky top-0 z-50 backdrop-blur-md bg-[#080c14]/80'>
        <div className='max-w-3xl mx-auto px-6 h-14 flex items-center gap-4'>
          <a href='/' className='font-mono text-sm font-bold text-[#00d4aa] hover:opacity-80 transition-opacity'>
            ← distro-builder
          </a>
          <span className='text-[#1e2d45]'>/</span>
          <span className='font-mono text-sm text-[#94a3b8]'>new</span>
        </div>
      </nav>

      <main className='max-w-3xl mx-auto px-6 py-12'>
        {/* 스텝 인디케이터 */}
        <div className='flex items-center gap-2 mb-12'>
          {STEPS.map((label, i) => (
            <div key={i} className='flex items-center gap-2'>
              <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                    i < step
                      ? 'bg-[#00d4aa] border-[#00d4aa] text-[#080c14]'
                      : i === step
                        ? 'border-[#00d4aa] text-[#00d4aa]'
                        : 'border-[#1e2d45] text-[#475569]'
                  }`}
                >
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
        {step === 1 && (
          <StepLoader
            selected={state.loader}
            mcVersion={state.mcVersion!}
            onSelect={v => setState(s => ({ ...s, loader: v }))}
            onNext={next}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepLoaderVersion
            loader={state.loader!}
            mcVersion={state.mcVersion!}
            selected={state.loaderVersion}
            onSelect={v => setState(s => ({ ...s, loaderVersion: v }))}
            onNext={next}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepModSearch
            mcVersion={state.mcVersion!}
            loader={state.loader!}
            onBack={() => setStep(2)}
            onNext={mods => {
              setState(s => ({ ...s, mods }));
              next();
            }}
          />
        )}
        {step === 4 && (
          <StepModOptions
            mods={state.mods}
            onUpdate={mods => setState(s => ({ ...s, mods }))}
            onNext={next}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepResourcePackSearch
            mcVersion={state.mcVersion!}
            onBack={() => setStep(4)}
            onNext={resourcePacks => {
              setState(s => ({ ...s, resourcePacks }));
              next();
            }}
          />
        )}
        {step === 6 && (
          <StepShaderPackSearch
            mcVersion={state.mcVersion!}
            onBack={() => setStep(5)}
            onNext={shaderPacks => {
              setState(s => ({ ...s, shaderPacks }));
              next();
            }}
          />
        )}
        {step === 7 && (
          <StepExtraFiles
            onBack={() => setStep(6)}
            onNext={extraFiles => {
              setState(s => ({ ...s, extraFiles }));
              next();
            }}
          />
        )}
        {step === 8 && (
          <StepJsonPreview
            mcVersion={state.mcVersion!}
            loader={state.loader!}
            loaderVersion={state.loaderVersion!}
            mods={state.mods}
            resourcePacks={state.resourcePacks}
            shaderPacks={state.shaderPacks}
            extraFiles={state.extraFiles}
            onBack={() => setStep(7)}
          />
        )}
      </main>
    </div>
  );
}
