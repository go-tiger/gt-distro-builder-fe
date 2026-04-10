'use client';

import type { SelectedMod, ModOption } from '@/types/wizard';

interface Props {
  mods: SelectedMod[];
  onUpdate: (mods: SelectedMod[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: { value: ModOption; label: string; desc: string; color: string }[] = [
  {
    value: 'required',
    label: 'Required',
    desc: '필수 — 유저가 끌 수 없음',
    color: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40',
  },
  {
    value: 'optional-on',
    label: 'Optional (ON)',
    desc: '선택 — 기본 활성화',
    color: 'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/40',
  },
  {
    value: 'optional-off',
    label: 'Optional (OFF)',
    desc: '선택 — 기본 비활성화',
    color: 'text-[#94a3b8] bg-[#94a3b8]/10 border-[#94a3b8]/40',
  },
];

export default function StepModOptions({ mods, onUpdate, onNext, onBack }: Props) {
  function setOption(project_id: string, option: ModOption) {
    onUpdate(mods.map(m => m.project_id === project_id ? { ...m, option } : m));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">모드 옵션 설정</h2>
      <p className="text-sm text-[#475569] font-mono mb-6">
        각 모드의 필수 여부를 설정하세요
      </p>

      {/* 옵션 안내 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {OPTIONS.map(opt => (
          <span key={opt.value} className={`font-mono text-xs px-3 py-1.5 rounded-lg border ${opt.color}`}>
            {opt.label} — {opt.desc.split(' — ')[1]}
          </span>
        ))}
      </div>

      <div className="grid gap-3 mb-8">
        {mods.map(mod => (
          <div key={mod.project_id} className="bg-[#0d1424] border border-[#1e2d45] rounded-xl p-4">
            {/* 모드 정보 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#080c14] border border-[#1e2d45]">
                {mod.icon_url ? (
                  <img src={mod.icon_url} alt={mod.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#475569] text-xs font-mono">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#e2e8f0] truncate">{mod.title}</p>
                <p className="font-mono text-xs text-[#475569]">{mod.version_number}</p>
              </div>
            </div>

            {/* 옵션 선택 */}
            <div className="flex gap-2 flex-wrap">
              {OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setOption(mod.project_id, opt.value)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    mod.option === opt.value
                      ? opt.color
                      : 'text-[#475569] bg-[#080c14] border-[#1e2d45] hover:border-[#2d4a6b] hover:text-[#94a3b8]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={onNext}
          className="font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
