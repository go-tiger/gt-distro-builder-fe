'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectedShaderPack } from '@/types/wizard';

interface PackResult {
  project_id: string;
  title: string;
  description: string;
  author: string;
  downloads: number;
  icon_url: string | null;
}

interface PackVersion {
  id: string;
  name: string;
  version_number: string;
  featured: boolean;
  files: Array<{ url: string; size: number; primary: boolean }>;
}

interface Props {
  mcVersion: string;
  onBack: () => void;
  onNext: (packs: SelectedShaderPack[]) => void;
}

const LIMIT = 20;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
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

export default function StepShaderPackSearch({ mcVersion, onBack, onNext }: Props) {
  const [tab, setTab] = useState<'modrinth' | 'manual'>('modrinth');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PackResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const loadingMoreRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [packVersions, setPackVersions] = useState<Record<string, PackVersion[]>>({});
  const [loadingVersions, setLoadingVersions] = useState<string | null>(null);

  const [selectedPacks, setSelectedPacks] = useState<SelectedShaderPack[]>([]);

  const [manualUrl, setManualUrl] = useState('');
  const [manualTracked, setManualTracked] = useState(true);

  const buildParams = useCallback(
    (q: string, off: number) => {
      const facets = JSON.stringify([[`versions:${mcVersion}`], ['project_type:shader']]);
      return new URLSearchParams({ query: q, facets, limit: String(LIMIT), offset: String(off) });
    },
    [mcVersion],
  );

  const search = useCallback(
    async (q: string) => {
      setLoading(true);
      setOffset(0);
      setExpandedPack(null);
      try {
        const res = await fetch(`https://api.modrinth.com/v2/search?${buildParams(q, 0)}`);
        const data = await res.json();
        setResults(data.hits ?? []);
        setTotal(data.total_hits ?? 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loading) return;
    const nextOffset = offset + LIMIT;
    if (nextOffset >= total) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch(`https://api.modrinth.com/v2/search?${buildParams(query, nextOffset)}`);
      const data = await res.json();
      setResults(prev => {
        const existingIds = new Set(prev.map(p => p.project_id));
        const newHits = (data.hits ?? []).filter((p: PackResult) => !existingIds.has(p.project_id));
        return [...prev, ...newHits];
      });
      setOffset(nextOffset);
    } catch {
      // ignore
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, offset, total, query, buildParams]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    search('');
  }, [search]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) loadMore();
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  async function handlePackClick(pack: PackResult) {
    if (expandedPack === pack.project_id) {
      setExpandedPack(null);
      return;
    }
    setExpandedPack(pack.project_id);
    if (packVersions[pack.project_id]) return;

    setLoadingVersions(pack.project_id);
    try {
      const params = new URLSearchParams({
        game_versions: JSON.stringify([mcVersion]),
      });
      const res = await fetch(`https://api.modrinth.com/v2/project/${pack.project_id}/version?${params}`);
      const data: PackVersion[] = await res.json();
      setPackVersions(prev => ({ ...prev, [pack.project_id]: data }));
    } catch {
      setPackVersions(prev => ({ ...prev, [pack.project_id]: [] }));
    } finally {
      setLoadingVersions(null);
    }
  }

  function selectVersion(pack: PackResult, version: PackVersion) {
    const primaryFile = version.files.find(f => f.primary) ?? version.files[0];
    setSelectedPacks(prev => {
      const filtered = prev.filter(p => p.project_id !== pack.project_id);
      return [
        ...filtered,
        {
          type: 'modrinth',
          project_id: pack.project_id,
          title: pack.title,
          author: pack.author,
          icon_url: pack.icon_url,
          version_id: version.id,
          version_number: version.version_number,
          artifact_url: primaryFile?.url ?? '',
          artifact_size: primaryFile?.size ?? 0,
          tracked: true,
        },
      ];
    });
    setExpandedPack(null);
  }

  function updateTracked(project_id: string, tracked: boolean) {
    setSelectedPacks(prev => prev.map(p => (p.project_id === project_id ? { ...p, tracked } : p)));
  }

  function removePack(project_id: string) {
    setSelectedPacks(prev => prev.filter(p => p.project_id !== project_id));
  }

  function isSelected(id: string) {
    return selectedPacks.some(p => p.project_id === id);
  }

  function getSelectedVersion(id: string) {
    return selectedPacks.find(p => p.project_id === id)?.version_number ?? null;
  }

  function addManual() {
    const url = manualUrl.trim();
    if (!url) return;
    setSelectedPacks(prev => [...prev, { type: 'manual', url, tracked: manualTracked }]);
    setManualUrl('');
    setManualTracked(true);
  }

  function removeManual(url: string | undefined) {
    setSelectedPacks(prev => prev.filter(p => !(p.type === 'manual' && p.url === url)));
  }

  function updateManualTracked(url: string | undefined, tracked: boolean) {
    setSelectedPacks(prev => prev.map(p => (p.type === 'manual' && p.url === url ? { ...p, tracked } : p)));
  }

  const modrinthSelected = selectedPacks.filter(p => p.type === 'modrinth');
  const manualSelected = selectedPacks.filter(p => p.type === 'manual');

  return (
    <div>
      <h2 className='text-2xl font-bold text-[#e2e8f0] mb-2'>쉐이더팩</h2>
      <p className='text-sm text-[#475569] font-mono mb-6'>MC {mcVersion} 호환 쉐이더팩을 추가하세요</p>

      {/* 탭 */}
      <div className='flex gap-1 mb-6 bg-[#0d1424] border border-[#1e2d45] rounded-lg p-1'>
        {(['modrinth', 'manual'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 font-mono text-xs py-2 rounded-md transition-colors ${
              tab === t
                ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa]'
                : 'text-[#475569] hover:text-[#94a3b8]'
            }`}
          >
            {t === 'modrinth' ? 'Modrinth 검색' : '수동 URL 추가'}
          </button>
        ))}
      </div>

      {/* Modrinth 검색 탭 */}
      {tab === 'modrinth' && (
        <>
          <input
            type='text'
            placeholder='쉐이더팩 이름 검색...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            className='w-full bg-[#0d1424] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono mb-4'
          />

          {!loading && total > 0 && (
            <p className='font-mono text-xs text-[#475569] mb-3'>
              {results.length} / {total.toLocaleString()}개
            </p>
          )}

          {loading && (
            <div className='flex items-center gap-2 text-[#475569] font-mono text-sm py-6'>
              <span className='w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse' />
              검색 중...
            </div>
          )}

          {!loading && (
            <div ref={scrollRef} className='grid gap-2 mb-6 max-h-96 overflow-y-auto pr-1'>
              {results.map(pack => {
                const selected = isSelected(pack.project_id);
                const selectedVersion = getSelectedVersion(pack.project_id);
                const isExpanded = expandedPack === pack.project_id;
                const versions = packVersions[pack.project_id];

                return (
                  <div
                    key={pack.project_id}
                    className={`rounded-xl border transition-colors ${
                      selected
                        ? 'bg-[#00d4aa]/10 border-[#00d4aa]'
                        : isExpanded
                          ? 'bg-[#0d1424] border-[#2d4a6b]'
                          : 'bg-[#0d1424] border-[#1e2d45]'
                    }`}
                  >
                    <button
                      onClick={() => handlePackClick(pack)}
                      className='w-full text-left p-3 flex gap-3 items-start'
                    >
                      <div className='w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#080c14] border border-[#1e2d45]'>
                        {pack.icon_url ? (
                          <img src={pack.icon_url} alt={pack.title} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-[#475569] text-xs font-mono'>
                            ?
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2 mb-0.5'>
                          <span
                            className={`font-semibold text-sm truncate ${selected ? 'text-[#00d4aa]' : 'text-[#e2e8f0]'}`}
                          >
                            {pack.title}
                          </span>
                          <div className='flex items-center gap-2 flex-shrink-0'>
                            <span className='font-mono text-xs text-[#475569]'>↓ {formatNumber(pack.downloads)}</span>
                            {selected ? (
                              <span className='font-mono text-xs text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/30 px-2 py-0.5 rounded'>
                                ✓ {selectedVersion}
                              </span>
                            ) : (
                              <span
                                className={`font-mono text-xs px-2 py-0.5 rounded border transition-colors ${
                                  isExpanded
                                    ? 'text-[#e2e8f0] bg-[#1e2d45] border-[#2d4a6b]'
                                    : 'text-[#475569] bg-[#080c14] border-[#1e2d45]'
                                }`}
                              >
                                {isExpanded ? '▲ 닫기' : '버전 선택'}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className='text-xs text-[#475569] truncate'>by {pack.author}</p>
                        <p className='text-xs text-[#94a3b8] line-clamp-1 mt-0.5'>{pack.description}</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className='border-t border-[#1e2d45] px-3 py-2'>
                        {loadingVersions === pack.project_id && (
                          <div className='flex items-center gap-2 text-[#475569] font-mono text-xs py-2'>
                            <span className='w-1 h-1 rounded-full bg-[#00d4aa] animate-pulse' />
                            버전 불러오는 중...
                          </div>
                        )}
                        {versions && versions.length === 0 && (
                          <p className='font-mono text-xs text-[#475569] py-2'>사용 가능한 버전이 없습니다.</p>
                        )}
                        {versions && versions.length > 0 && (
                          <div className='flex flex-wrap gap-1.5 py-1'>
                            {versions.map(v => (
                              <button
                                key={v.id}
                                onClick={() => selectVersion(pack, v)}
                                className={`font-mono text-xs px-2.5 py-1 rounded border transition-colors ${
                                  v.featured
                                    ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20'
                                    : 'text-[#94a3b8] bg-[#080c14] border-[#1e2d45] hover:border-[#2d4a6b] hover:text-[#e2e8f0]'
                                }`}
                              >
                                {v.version_number}
                                {v.featured && <span className='ml-1 text-[#0ea5e9]/60'>★</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {loadingMore && (
                <div className='flex items-center justify-center gap-2 text-[#475569] font-mono text-xs py-3'>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse' />
                  불러오는 중...
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className='text-center py-12 text-[#475569] font-mono text-sm'>검색 결과가 없습니다.</div>
              )}
            </div>
          )}

          {/* 선택된 Modrinth 쉐이더팩 */}
          {modrinthSelected.length > 0 && (
            <div className='bg-[#0d1424] border border-[#1e2d45] rounded-xl p-4 mb-6'>
              <p className='font-mono text-xs text-[#475569] mb-3'>선택된 쉐이더팩 ({modrinthSelected.length})</p>
              <div className='grid gap-3'>
                {modrinthSelected.map(pack => (
                  <div key={pack.project_id} className='flex items-start gap-3'>
                    <div className='w-7 h-7 rounded-md overflow-hidden flex-shrink-0 bg-[#080c14] border border-[#1e2d45] mt-0.5'>
                      {pack.icon_url ? (
                        <img src={pack.icon_url} alt={pack.title} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-[#475569] text-[10px] font-mono'>
                          ?
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-xs text-[#e2e8f0] truncate'>{pack.title}</p>
                      <p className='font-mono text-[10px] text-[#475569] mb-1.5'>{pack.version_number}</p>
                      <div className='flex items-center gap-2'>
                        <TrackedToggle value={pack.tracked} onChange={v => updateTracked(pack.project_id!, v)} />
                        <span className='font-mono text-[10px] text-[#475569]'>
                          {pack.tracked
                            ? '파일 변경 감지 · 재다운로드 (무결성 검사)'
                            : '파일 건드리지 않음 (유저 수정 허용)'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removePack(pack.project_id!)}
                      className='text-[#475569] hover:text-[#ef4444] transition-colors font-mono text-sm flex-shrink-0'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 수동 입력 탭 */}
      {tab === 'manual' && (
        <div className='mb-6'>
          <div className='grid gap-3 mb-4'>
            <div>
              <label className='font-mono text-xs text-[#475569] mb-1.5 block'>다운로드 URL</label>
              <input
                type='url'
                placeholder='https://...'
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                className='w-full bg-[#0d1424] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono'
              />
            </div>
            <div>
              <label className='font-mono text-xs text-[#475569] mb-1.5 block'>파일 추적</label>
              <div className='flex gap-2'>
                {([true, false] as const).map(v => (
                  <button
                    key={String(v)}
                    onClick={() => setManualTracked(v)}
                    className={`font-mono text-xs px-4 py-2 rounded-lg border transition-colors ${
                      manualTracked === v
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
          <button
            onClick={addManual}
            disabled={!manualUrl.trim()}
            className='w-full font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
          >
            + 추가
          </button>

          {manualSelected.length > 0 && (
            <div className='mt-4 grid gap-2'>
              {manualSelected.map((pack, i) => (
                <div key={i} className='bg-[#0d1424] border border-[#1e2d45] rounded-xl p-3 flex items-center gap-3'>
                  <div className='flex-1 min-w-0'>
                    <p className='font-mono text-xs text-[#e2e8f0] truncate'>{pack.url}</p>
                  </div>
                  <TrackedToggle value={pack.tracked} onChange={v => updateManualTracked(pack.url, v)} />
                  <button
                    onClick={() => removeManual(pack.url)}
                    className='text-[#475569] hover:text-[#ef4444] transition-colors font-mono text-sm flex-shrink-0'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 네비게이션 */}
      <div className='flex justify-between'>
        <button onClick={onBack} className='font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors'>
          ← 이전
        </button>
        <button
          onClick={() => onNext(selectedPacks)}
          className='font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors'
        >
          {selectedPacks.length > 0 ? `다음 → (${selectedPacks.length})` : '건너뛰기 →'}
        </button>
      </div>
    </div>
  );
}
