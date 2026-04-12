'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectedMod } from '@/types/wizard';

interface ModResult {
  project_id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  downloads: number;
  icon_url: string | null;
  categories: string[];
}

interface ModVersion {
  id: string;
  name: string;
  version_number: string;
  featured: boolean;
  files: Array<{ url: string; size: number; primary: boolean }>;
}

interface Props {
  mcVersion: string;
  loader: string;
  onBack: () => void;
  onNext: (mods: SelectedMod[]) => void;
}

const LIMIT = 20;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export default function StepModSearch({ mcVersion, loader, onBack, onNext }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ModResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const loadingMoreRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 버전 선택 관련
  const [expandedMod, setExpandedMod] = useState<string | null>(null);
  const [modVersions, setModVersions] = useState<Record<string, ModVersion[]>>({});
  const [loadingVersions, setLoadingVersions] = useState<string | null>(null);
  const [selectedMods, setSelectedMods] = useState<SelectedMod[]>([]);

  const buildParams = useCallback((q: string, off: number) => {
    const facets = JSON.stringify([
      [`categories:${loader}`],
      [`versions:${mcVersion}`],
      ['project_type:mod'],
    ]);
    return new URLSearchParams({ query: q, facets, limit: String(LIMIT), offset: String(off) });
  }, [mcVersion, loader]);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setOffset(0);
    setExpandedMod(null);
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
  }, [buildParams]);

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
        const existingIds = new Set(prev.map(m => m.project_id));
        const newHits = (data.hits ?? []).filter((m: ModResult) => !existingIds.has(m.project_id));
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

  useEffect(() => { search(''); }, [search]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) loadMore();
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // 모드 카드 클릭 → 버전 목록 로드 및 펼치기
  async function handleModClick(mod: ModResult) {
    if (expandedMod === mod.project_id) {
      setExpandedMod(null);
      return;
    }
    setExpandedMod(mod.project_id);
    if (modVersions[mod.project_id]) return; // 이미 로드됨

    setLoadingVersions(mod.project_id);
    try {
      const params = new URLSearchParams({
        loaders: JSON.stringify([loader]),
        game_versions: JSON.stringify([mcVersion]),
      });
      const res = await fetch(`https://api.modrinth.com/v2/project/${mod.project_id}/version?${params}`);
      const data: ModVersion[] = await res.json();
      setModVersions(prev => ({ ...prev, [mod.project_id]: data }));
    } catch {
      setModVersions(prev => ({ ...prev, [mod.project_id]: [] }));
    } finally {
      setLoadingVersions(null);
    }
  }

  function selectVersion(mod: ModResult, version: ModVersion) {
    const primaryFile = version.files.find(f => f.primary) ?? version.files[0];
    setSelectedMods(prev => {
      const filtered = prev.filter(m => m.project_id !== mod.project_id);
      return [...filtered, {
        project_id: mod.project_id,
        title: mod.title,
        author: mod.author,
        icon_url: mod.icon_url,
        version_id: version.id,
        version_number: version.version_number,
        artifact_url: primaryFile?.url ?? '',
        artifact_size: primaryFile?.size ?? 0,
        option: 'required' as const,
      }];
    });
    setExpandedMod(null);
  }

  function removeMod(project_id: string) {
    setSelectedMods(prev => prev.filter(m => m.project_id !== project_id));
  }

  function isSelected(id: string) {
    return selectedMods.some(m => m.project_id === id);
  }

  function getSelectedVersion(id: string) {
    return selectedMods.find(m => m.project_id === id)?.version_number ?? null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">모드 검색</h2>
      <p className="text-sm text-[#475569] font-mono mb-6">
        {loader} — MC {mcVersion} 호환 모드를 검색하고 버전을 선택하세요
      </p>

      {/* 검색창 */}
      <input
        type="text"
        placeholder="모드 이름 검색..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full bg-[#0d1424] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono mb-4"
      />

      {!loading && total > 0 && (
        <p className="font-mono text-xs text-[#475569] mb-3">
          {results.length} / {total.toLocaleString()}개
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#475569] font-mono text-sm py-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          검색 중...
        </div>
      )}

      {/* 검색 결과 */}
      {!loading && (
        <div ref={scrollRef} className="grid gap-2 mb-6 max-h-96 overflow-y-auto pr-1">
          {results.map(mod => {
            const selected = isSelected(mod.project_id);
            const selectedVersion = getSelectedVersion(mod.project_id);
            const isExpanded = expandedMod === mod.project_id;
            const versions = modVersions[mod.project_id];

            return (
              <div key={mod.project_id} className={`rounded-xl border transition-colors ${
                selected
                  ? 'bg-[#00d4aa]/10 border-[#00d4aa]'
                  : isExpanded
                  ? 'bg-[#0d1424] border-[#2d4a6b]'
                  : 'bg-[#0d1424] border-[#1e2d45]'
              }`}>
                {/* 모드 카드 */}
                <button
                  onClick={() => handleModClick(mod)}
                  className="w-full text-left p-3 flex gap-3 items-start"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#080c14] border border-[#1e2d45]">
                    {mod.icon_url ? (
                      <img src={mod.icon_url} alt={mod.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#475569] text-xs font-mono">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`font-semibold text-sm truncate ${selected ? 'text-[#00d4aa]' : 'text-[#e2e8f0]'}`}>
                        {mod.title}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono text-xs text-[#475569]">↓ {formatNumber(mod.downloads)}</span>
                        {selected ? (
                          <span className="font-mono text-xs text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/30 px-2 py-0.5 rounded">
                            ✓ {selectedVersion}
                          </span>
                        ) : (
                          <span className={`font-mono text-xs px-2 py-0.5 rounded border transition-colors ${
                            isExpanded
                              ? 'text-[#e2e8f0] bg-[#1e2d45] border-[#2d4a6b]'
                              : 'text-[#475569] bg-[#080c14] border-[#1e2d45]'
                          }`}>
                            {isExpanded ? '▲ 닫기' : '버전 선택'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#475569] truncate">by {mod.author}</p>
                    <p className="text-xs text-[#94a3b8] line-clamp-1 mt-0.5">{mod.description}</p>
                  </div>
                </button>

                {/* 버전 목록 (펼쳐졌을 때) */}
                {isExpanded && (
                  <div className="border-t border-[#1e2d45] px-3 py-2">
                    {loadingVersions === mod.project_id && (
                      <div className="flex items-center gap-2 text-[#475569] font-mono text-xs py-2">
                        <span className="w-1 h-1 rounded-full bg-[#00d4aa] animate-pulse" />
                        버전 불러오는 중...
                      </div>
                    )}
                    {versions && versions.length === 0 && (
                      <p className="font-mono text-xs text-[#475569] py-2">사용 가능한 버전이 없습니다.</p>
                    )}
                    {versions && versions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {versions.map(v => (
                          <button
                            key={v.id}
                            onClick={() => selectVersion(mod, v)}
                            className={`font-mono text-xs px-2.5 py-1 rounded border transition-colors ${
                              v.featured
                                ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20'
                                : 'text-[#94a3b8] bg-[#080c14] border-[#1e2d45] hover:border-[#2d4a6b] hover:text-[#e2e8f0]'
                            }`}
                          >
                            {v.version_number}
                            {v.featured && <span className="ml-1 text-[#0ea5e9]/60">★</span>}
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
            <div className="flex items-center justify-center gap-2 text-[#475569] font-mono text-xs py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
              불러오는 중...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-12 text-[#475569] font-mono text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 선택된 모드 목록 */}
      {selectedMods.length > 0 && (
        <div className="bg-[#0d1424] border border-[#1e2d45] rounded-xl p-4 mb-6">
          <p className="font-mono text-xs text-[#475569] mb-3">선택된 모드 ({selectedMods.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedMods.map(mod => (
              <span
                key={mod.project_id}
                className="flex items-center gap-1.5 font-mono text-xs text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/30 px-2.5 py-1 rounded-full"
              >
                {mod.title}
                <span className="text-[#00d4aa]/50">@{mod.version_number}</span>
                <button
                  onClick={() => removeMod(mod.project_id)}
                  className="text-[#00d4aa]/60 hover:text-[#00d4aa] transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors"
        >
          ← 이전
        </button>
        <button
          disabled={selectedMods.length === 0}
          onClick={() => onNext(selectedMods)}
          className="font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          다음 → ({selectedMods.length})
        </button>
      </div>
    </div>
  );
}
