'use client';

import { useEffect, useState } from 'react';

interface Props {
  selected: string | null;
  onSelect: (version: string) => void;
  onNext: () => void;
}

interface McVersion {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
}

export default function StepMcVersion({ selected, onSelect, onNext }: Props) {
  const [versions, setVersions] = useState<McVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
      .then(r => r.json())
      .then(data => {
        const MIN_VERSION = '1.12.2';
        const releases: McVersion[] = (data.versions as McVersion[])
          .filter(v => v.type === 'release')
          .filter(v => {
            const [major, minor, patch = 0] = v.id.split('.').map(Number);
            const [minMajor, minMinor, minPatch = 0] = MIN_VERSION.split('.').map(Number);
            if (major !== minMajor) return major > minMajor;
            if (minor !== minMinor) return minor > minMinor;
            return patch >= minPatch;
          });
        setVersions(releases);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className='text-2xl font-bold text-[#e2e8f0] mb-2'>Minecraft 버전 선택</h2>
      <p className='text-sm text-[#475569] font-mono mb-8'>사용할 Minecraft 버전을 선택하세요</p>

      {loading && (
        <div className='flex items-center gap-2 text-[#475569] font-mono text-sm py-8'>
          <span className='w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse' />
          버전 목록 불러오는 중...
        </div>
      )}

      {error && <p className='text-sm text-red-400 font-mono'>버전 목록을 불러오지 못했습니다.</p>}

      {!loading && !error && (
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-8 max-h-80 overflow-y-auto pr-1'>
          {versions.map(v => (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`font-mono text-sm px-3 py-2 rounded-lg border transition-colors text-left ${
                selected === v.id
                  ? 'bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]'
                  : 'bg-[#0d1424] border-[#1e2d45] text-[#94a3b8] hover:border-[#2d4a6b] hover:text-[#e2e8f0]'
              }`}
            >
              {v.id}
            </button>
          ))}
        </div>
      )}

      <div className='flex justify-end'>
        <button
          onClick={onNext}
          disabled={!selected}
          className='font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
