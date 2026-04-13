'use client';

import { useState, useEffect } from 'react';
import type { SelectedMod, SelectedResourcePack, SelectedShaderPack, SelectedExtraFile } from '@/types/wizard';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

interface Props {
  mcVersion: string;
  loader: string;
  loaderVersion: string;
  mods: SelectedMod[];
  resourcePacks: SelectedResourcePack[];
  shaderPacks: SelectedShaderPack[];
  extraFiles: SelectedExtraFile[];
  onBack: () => void;
}

type ModuleType = 'FabricMod' | 'ForgeMod' | 'File' | 'Library' | 'VersionManifest';

interface ModuleEntry {
  id: string;
  name?: string;
  type: ModuleType;
  artifact: {
    size: number;
    MD5: string | null;
    url: string;
  };
  required?: {
    value: boolean;
    def?: boolean;
  };
  subModules?: ModuleEntry[];
}

interface DistributionJson {
  version: string;
  rss: string;
  servers: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    version: string;
    address: string;
    minecraftVersion: string;
    mainServer: boolean;
    autoconnect: boolean;
    modules: ModuleEntry[];
  }>;
}

// Maven 좌표 → jar URL 변환 (Fabric maven repo 기준)
function mavenToUrl(base: string, name: string): string {
  // name format: group:artifact:version
  const parts = name.split(':');
  if (parts.length < 3) return '';
  const [group, artifact, version] = parts;
  const groupPath = group.replace(/\./g, '/');
  return `${base}${groupPath}/${artifact}/${version}/${artifact}-${version}.jar`;
}

function getModuleType(loader: string): ModuleType {
  if (loader === 'fabric') return 'FabricMod';
  return 'ForgeMod';
}

function getLoaderModuleId(loader: string, loaderVersion: string, mcVersion: string): string {
  if (loader === 'fabric') return `net.fabricmc:fabric-loader:${loaderVersion}`;
  if (loader === 'forge') return `net.minecraftforge:forge:${mcVersion}-${loaderVersion}`;
  if (loader === 'neoforge') return `net.neoforged:neoforge:${loaderVersion}`;
  return `${loader}:${loaderVersion}`;
}

function getLoaderArtifactUrl(loader: string, loaderVersion: string, mcVersion: string): string {
  if (loader === 'fabric') {
    return `https://maven.fabricmc.net/net/fabricmc/fabric-loader/${loaderVersion}/fabric-loader-${loaderVersion}.jar`;
  }
  if (loader === 'forge') {
    return `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${mcVersion}-${loaderVersion}/forge-${mcVersion}-${loaderVersion}.jar`;
  }
  if (loader === 'neoforge') {
    return `https://maven.neoforged.net/releases/net/neoforged/neoforge/${loaderVersion}/neoforge-${loaderVersion}.jar`;
  }
  return '';
}

function modOptionToRequired(option: string): { value: boolean; def?: boolean } | undefined {
  if (option === 'required') return undefined;
  if (option === 'optional-on') return { value: false };
  if (option === 'optional-off') return { value: false, def: false };
  return undefined;
}

interface FabricLibrary {
  name: string;
  url: string;
  md5?: string;
  size?: number;
}

async function fetchFabricSubModules(mcVersion: string, loaderVersion: string): Promise<ModuleEntry[]> {
  const res = await fetch(
    `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/profile/json`
  );
  const data = await res.json();
  const libs: FabricLibrary[] = (data.libraries ?? []).filter(
    (lib: FabricLibrary) => lib.name !== `net.fabricmc:fabric-loader:${loaderVersion}`
  );

  return libs.map((lib): ModuleEntry => {
    const url = lib.url
      ? mavenToUrl(lib.url.endsWith('/') ? lib.url : lib.url + '/', lib.name)
      : mavenToUrl('https://maven.fabricmc.net/', lib.name);

    return {
      id: lib.name,
      name: `Fabric (${lib.name.split(':')[1] ?? lib.name})`,
      type: 'Library',
      artifact: {
        size: lib.size ?? 0,
        MD5: lib.md5 ?? null,
        url,
      },
    };
  });
}

function buildDistributionJson(
  mcVersion: string,
  loader: string,
  loaderVersion: string,
  mods: SelectedMod[],
  resourcePacks: SelectedResourcePack[],
  shaderPacks: SelectedShaderPack[],
  extraFiles: SelectedExtraFile[],
  loaderSubModules: ModuleEntry[],
  backendModules: ModuleEntry[] | null,
): DistributionJson {
  const modType = getModuleType(loader);

  const loaderModule: ModuleEntry = {
    id: getLoaderModuleId(loader, loaderVersion, mcVersion),
    type: modType,
    artifact: {
      size: 0,
      MD5: null,
      url: getLoaderArtifactUrl(loader, loaderVersion, mcVersion),
    },
    ...(loaderSubModules.length > 0 ? { subModules: loaderSubModules } : {}),
  };

  // 백엔드에서 MD5/size가 채워진 모듈을 받았으면 그것을 사용, 없으면 프론트에서 구성
  const modModules: ModuleEntry[] = backendModules
    ? backendModules.map(m => ({
        ...m,
        required: mods.find(mod => m.id.startsWith(mod.project_id))
          ? modOptionToRequired(mods.find(mod => m.id.startsWith(mod.project_id))!.option)
          : undefined,
      }))
    : mods.map(mod => ({
        id: `${mod.project_id}:${mod.version_id}`,
        name: mod.title,
        type: modType,
        artifact: {
          size: mod.artifact_size,
          MD5: null,
          url: mod.artifact_url,
        },
        required: modOptionToRequired(mod.option),
      }));

  const resourcePackModules: ModuleEntry[] = resourcePacks.map((pack, i) => {
    const id = pack.type === 'modrinth' && pack.project_id
      ? `${pack.project_id}:${pack.version_id}`
      : `resourcepack-${i}`;
    return {
      id,
      name: pack.title ?? id,
      type: 'File',
      artifact: {
        size: pack.artifact_size ?? 0,
        MD5: pack.tracked ? null : undefined as unknown as null,
        url: pack.artifact_url ?? pack.url ?? '',
      },
    };
  });

  const shaderPackModules: ModuleEntry[] = shaderPacks.map((pack, i) => {
    const id = pack.type === 'modrinth' && pack.project_id
      ? `${pack.project_id}:${pack.version_id}`
      : `shaderpack-${i}`;
    return {
      id,
      name: pack.title ?? id,
      type: 'File',
      artifact: {
        size: pack.artifact_size ?? 0,
        MD5: pack.tracked ? null : undefined as unknown as null,
        url: pack.artifact_url ?? pack.url ?? '',
      },
    };
  });

  const extraFileModules: ModuleEntry[] = extraFiles.map((file, i) => ({
    id: `file-${i}-${file.path.replace(/\//g, '-')}`,
    type: 'File',
    artifact: {
      size: 0,
      MD5: file.tracked ? null : undefined as unknown as null,
      url: file.url,
    },
  }));

  return {
    version: '1.0.0',
    rss: 'https://example.com/rss',
    servers: [
      {
        id: `${mcVersion}-${loader}`,
        name: `${mcVersion} ${loader.charAt(0).toUpperCase() + loader.slice(1)}`,
        description: `Minecraft ${mcVersion} with ${loader}`,
        icon: 'https://example.com/icon.png',
        version: mcVersion,
        address: 'example.com:25565',
        minecraftVersion: mcVersion,
        mainServer: true,
        autoconnect: false,
        modules: [
          loaderModule,
          ...modModules,
          ...resourcePackModules,
          ...shaderPackModules,
          ...extraFileModules,
        ],
      },
    ],
  };
}

async function fetchBackendModules(
  mcVersion: string,
  loader: string,
  mods: SelectedMod[],
): Promise<ModuleEntry[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/distribution/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serverId: `${mcVersion}-${loader}`,
        serverName: `${mcVersion} ${loader.charAt(0).toUpperCase() + loader.slice(1)}`,
        minecraftVersion: mcVersion,
        loader,
        mods: mods.map(m => ({
          slug: m.slug,
          name: m.title,
          version: m.version_number,
          required: m.option === 'required',
        })),
      }),
    });
    if (!res.ok) return null;
    const data: DistributionJson = await res.json();
    return data.servers?.[0]?.modules ?? null;
  } catch {
    return null;
  }
}

export default function StepJsonPreview({
  mcVersion,
  loader,
  loaderVersion,
  mods,
  resourcePacks,
  shaderPacks,
  extraFiles,
  onBack,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [loaderSubModules, setLoaderSubModules] = useState<ModuleEntry[]>([]);
  const [loadingSubModules, setLoadingSubModules] = useState(false);
  const [backendModules, setBackendModules] = useState<ModuleEntry[] | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (loader !== 'fabric') return;
    setLoadingSubModules(true);
    fetchFabricSubModules(mcVersion, loaderVersion)
      .then(setLoaderSubModules)
      .catch(() => setLoaderSubModules([]))
      .finally(() => setLoadingSubModules(false));
  }, [loader, mcVersion, loaderVersion]);

  useEffect(() => {
    if (mods.length === 0) return;
    setLoadingBackend(true);
    setBackendError(null);
    fetchBackendModules(mcVersion, loader, mods)
      .then(modules => {
        if (modules) {
          setBackendModules(modules);
        } else {
          setBackendError('백엔드 연결 실패 — MD5 없이 생성됩니다.');
        }
      })
      .finally(() => setLoadingBackend(false));
  }, [mcVersion, loader, mods]);

  const json = buildDistributionJson(
    mcVersion, loader, loaderVersion,
    mods, resourcePacks, shaderPacks, extraFiles,
    loaderSubModules,
    backendModules,
  );
  const jsonStr = JSON.stringify(json, null, 2);

  const isLoading = loadingSubModules || loadingBackend;

  function download() {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distribution.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    await navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const modCount = mods.length;
  const requiredCount = mods.filter(m => m.option === 'required').length;
  const optionalCount = modCount - requiredCount;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">JSON 미리보기</h2>
      <p className="text-sm text-[#475569] font-mono mb-6">
        distribution.json 을 확인하고 다운로드하세요
      </p>

      {/* 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'MC 버전', value: mcVersion },
          { label: '로더', value: `${loader} ${loaderVersion}` },
          { label: '모드', value: `${modCount}개 (필수 ${requiredCount} / 선택 ${optionalCount})` },
          {
            label: '추가 파일',
            value: `리소스팩 ${resourcePacks.length} · 쉐이더팩 ${shaderPacks.length} · 기타 ${extraFiles.length}`,
          },
        ].map(item => (
          <div key={item.label} className="bg-[#0d1424] border border-[#1e2d45] rounded-xl p-3">
            <p className="font-mono text-[10px] text-[#475569] mb-1">{item.label}</p>
            <p className="font-mono text-xs text-[#e2e8f0] break-all">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 백엔드 로딩 상태 */}
      {loadingBackend && mods.length > 0 && (
        <div className="flex items-center gap-2 text-[#475569] font-mono text-xs mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          백엔드에서 모드 MD5 계산 중...
        </div>
      )}
      {!loadingBackend && backendModules && (
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl px-4 py-2.5 mb-4">
          <p className="font-mono text-xs text-[#00d4aa]">
            백엔드에서 MD5 해시 {backendModules.length}개 적용됨
          </p>
        </div>
      )}
      {!loadingBackend && backendError && (
        <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/30 rounded-xl px-4 py-2.5 mb-4">
          <p className="font-mono text-xs text-[#f59e0b]">{backendError}</p>
        </div>
      )}

      {/* 로더 서브모듈 로딩 상태 */}
      {loader === 'fabric' && loadingSubModules && (
        <div className="flex items-center gap-2 text-[#475569] font-mono text-xs mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          Fabric 라이브러리 메타데이터 불러오는 중...
        </div>
      )}
      {loader === 'fabric' && !loadingSubModules && loaderSubModules.length > 0 && (
        <div className="bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl px-4 py-2.5 mb-4">
          <p className="font-mono text-xs text-[#0ea5e9]">
            Fabric 서브모듈 {loaderSubModules.length}개 자동 포함됨
          </p>
        </div>
      )}

      {/* 경고 */}
      <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/30 rounded-xl p-4 mb-6">
        <p className="font-mono text-xs text-[#f59e0b] mb-1">주의사항</p>
        <ul className="font-mono text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
          <li>로더 모듈의 size·MD5는 실제 값으로 교체하세요.</li>
          <li>서버 id, name, address, icon 등 메타데이터는 직접 수정하세요.</li>
          {(loader === 'forge' || loader === 'neoforge') && (
            <li>{loader === 'forge' ? 'Forge' : 'NeoForge'} 서브모듈은 자동 생성되지 않습니다. 직접 추가하세요.</li>
          )}
        </ul>
      </div>

      {/* JSON 미리보기 */}
      <div className="bg-[#0d1424] border border-[#1e2d45] rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2d45] bg-[#080c14]/60">
          <span className="font-mono text-xs text-[#475569]">distribution.json</span>
          <button
            onClick={copy}
            className="font-mono text-xs text-[#475569] hover:text-[#94a3b8] transition-colors px-2 py-1"
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
        <pre className="font-mono text-xs text-[#94a3b8] p-4 overflow-auto max-h-96 leading-5">
          {jsonStr}
        </pre>
      </div>

      {/* 네비게이션 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={download}
          disabled={isLoading}
          className="font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '생성 중...' : '다운로드 →'}
        </button>
      </div>
    </div>
  );
}
