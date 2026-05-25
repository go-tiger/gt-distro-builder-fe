'use client';

import { useState } from 'react';
import type { SelectedExtraFile } from '@/types/wizard';

interface Props {
  onBack: () => void;
  onNext: (files: SelectedExtraFile[]) => void;
}

interface FileInput {
  id: string;
  path: string;
  url: string;
  tracked: boolean;
}

function TrackedToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      title={
        value
          ? 'Tracked — 파일 변경 감지 · 재다운로드 (무결성 검사)'
          : 'Untracked — 파일 건드리지 않음 (유저 수정 허용)'
      }
      className={`flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded border transition-colors flex-shrink-0 ${
        value
          ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/40'
          : 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-[#0ea5e9]' : 'bg-[#f59e0b]'}`} />
      {value ? 'Tracked' : 'Untracked'}
    </button>
  );
}

export default function StepExtraFiles({ onBack, onNext }: Props) {
  const [inputs, setInputs] = useState<FileInput[]>([{ id: '0', path: '', url: '', tracked: true }]);

  function addInput() {
    const newId = String(Math.max(...inputs.map(i => parseInt(i.id, 10)), 0) + 1);
    setInputs(prev => [...prev, { id: newId, path: '', url: '', tracked: true }]);
  }

  function removeInput(id: string) {
    setInputs(prev => prev.filter(i => i.id !== id));
  }

  function updateInput(id: string, field: keyof FileInput, value: string | boolean) {
    setInputs(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  }

  const validInputs = inputs.filter(i => i.path.trim() && i.url.trim());

  return (
    <div>
      <h2 className='text-2xl font-bold text-[#e2e8f0] mb-2'>기타 파일</h2>
      <p className='text-sm text-[#475569] font-mono mb-6'>config 등 추가 파일을 URL로 직접 등록하세요</p>

      {/* 입력 폼들 */}
      <div className='grid gap-4 mb-6'>
        {inputs.map((input) => (
          <div key={input.id} className='bg-[#0d1424] border border-[#1e2d45] rounded-xl p-4'>
            <div className='grid gap-3 mb-4'>
              {/* 경로 */}
              <div>
                <label className='font-mono text-xs text-[#475569] mb-1.5 block'>
                  경로 <span className='text-[#475569]/60'>(instanceDirectory 기준 상대경로)</span>
                </label>
                <input
                  type='text'
                  placeholder='config/example.cfg'
                  value={input.path}
                  onChange={e => updateInput(input.id, 'path', e.target.value)}
                  className='w-full bg-[#080c14] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono'
                />
              </div>

              {/* URL */}
              <div>
                <label className='font-mono text-xs text-[#475569] mb-1.5 block'>다운로드 URL</label>
                <input
                  type='url'
                  placeholder='https://...'
                  value={input.url}
                  onChange={e => updateInput(input.id, 'url', e.target.value)}
                  className='w-full bg-[#080c14] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono'
                />
              </div>

              {/* 파일 추적 */}
              <div>
                <label className='font-mono text-xs text-[#475569] mb-1.5 block'>파일 추적</label>
                <div className='flex gap-2'>
                  {([true, false] as const).map(v => (
                    <button
                      key={String(v)}
                      onClick={() => updateInput(input.id, 'tracked', v)}
                      className={`font-mono text-xs px-4 py-2 rounded-lg border transition-colors ${
                        input.tracked === v
                          ? v
                            ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/40'
                            : 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40'
                          : 'text-[#475569] bg-[#080c14] border-[#1e2d45] hover:border-[#2d4a6b] hover:text-[#94a3b8]'
                      }`}
                    >
                      {v ? 'Tracked' : 'Untracked'}
                    </button>
                  ))}
                </div>
                <p className='font-mono text-[10px] text-[#475569] mt-1.5'>
                  Tracked: 파일 변경 감지 · 재다운로드 (무결성 검사) / Untracked: 파일 건드리지 않음 (유저 수정 허용)
                </p>
              </div>
            </div>

            {inputs.length > 1 && (
              <button
                onClick={() => removeInput(input.id)}
                className='w-full font-mono text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/40 py-2 rounded-lg hover:bg-[#ef4444]/20 transition-colors'
              >
                × 제거
              </button>
            )}
          </div>
        ))}
      </div>

      {/* + 추가 버튼 */}
      <button
        onClick={addInput}
        className='w-full font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors mb-6'
      >
        + 추가
      </button>

      {/* 네비게이션 */}
      <div className='flex justify-between'>
        <button onClick={onBack} className='font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors'>
          ← 이전
        </button>
        <button
          onClick={() => onNext(validInputs)}
          className='font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors'
        >
          {validInputs.length > 0 ? `다음 → (${validInputs.length})` : '건너뛰기 →'}
        </button>
      </div>
    </div>
  );
}
