'use client';

import { useEffect, useState } from 'react';

interface Props {
  loader: string;
  mcVersion: string;
  selected: string | null;
  onSelect: (version: string) => void;
  onNext: () => void;
  onBack: () => void;
}

async function fetchFabricVersions(mcVersion: string): Promise<string[]> {
  // MC 버전별 로더 목록 — stable 여부 무관하게 전체 반환
  const res = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`);
  const data = await res.json();
  return data.map((v: { loader: { version: string } }) => v.loader.version);
}

async function fetchForgeVersions(mcVersion: string): Promise<string[]> {
  // Backend proxy endpoint to avoid CORS issues
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${backendUrl}/api/loaders/forge/${mcVersion}`);
  const data = await res.json();
  return data;
}

async function fetchNeoForgeVersions(mcVersion: string): Promise<string[]> {
  const res = await fetch('https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml');
  const text = await res.text();
  const matches = text.match(/<version>(.*?)<\/version>/g) ?? [];
  const versions = matches.map(m => m.replace(/<\/?version>/g, '')).filter(v => !v.includes('beta'));

  // MC 버전 → NeoForge 접두어 매핑
  // 1.20.2 → "20.2.", 1.21.1 → "21.1."
  // 26.1 (새 넘버링) → "26.1."
  const parts = mcVersion.split('.');
  const prefix = parts[0] === '1'
    ? parts.slice(1).join('.') + '.'  // 1.x 넘버링
    : parts.slice(0, 2).join('.') + '.'; // 26.x 새 넘버링
  return versions.filter(v => v.startsWith(prefix)).reverse();
}

export default function StepLoaderVersion({ loader, mcVersion, selected, onSelect, onNext, onBack }: Props) {
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setVersions([]);

    const fetch = async () => {
      try {
        let result: string[] = [];
        if (loader === 'fabric') result = await fetchFabricVersions(mcVersion);
        else if (loader === 'forge') result = await fetchForgeVersions(mcVersion);
        else if (loader === 'neoforge') result = await fetchNeoForgeVersions(mcVersion);
        setVersions(result);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [loader, mcVersion]);

  return (
    <div>
      <h2 className='text-2xl font-bold text-[#e2e8f0] mb-2'>로더 버전 선택</h2>
      <p className='text-sm text-[#475569] font-mono mb-8'>
        {loader} — MC {mcVersion} 에서 사용할 로더 버전을 선택하세요
      </p>

      {loading && (
        <div className='flex items-center gap-2 text-[#475569] font-mono text-sm py-8'>
          <span className='w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse' />
          버전 목록 불러오는 중...
        </div>
      )}

      {error && <p className='text-sm text-red-400 font-mono py-4'>버전 목록을 불러오지 못했습니다.</p>}

      {!loading && !error && versions.length === 0 && (
        <p className='text-sm text-[#475569] font-mono py-4'>선택한 MC 버전에서 지원하는 {loader} 버전이 없습니다.</p>
      )}

      {!loading && !error && versions.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8 max-h-80 overflow-y-auto pr-1'>
          {versions.map(v => (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={`font-mono text-sm px-3 py-2 rounded-lg border transition-colors text-left ${
                selected === v
                  ? 'bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]'
                  : 'bg-[#0d1424] border-[#1e2d45] text-[#94a3b8] hover:border-[#2d4a6b] hover:text-[#e2e8f0]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <div className='flex justify-between'>
        <button onClick={onBack} className='font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors'>
          ← 이전
        </button>
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
