'use client';

interface Props {
  selected: string | null;
  mcVersion: string;
  onSelect: (loader: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function isNeoForgeSupported(mcVersion: string): boolean {
  const [, minor, patch = 0] = mcVersion.split('.').map(Number);
  return minor > 20 || (minor === 20 && patch >= 2);
}

const LOADERS = [
  {
    id: 'fabric',
    name: 'Fabric',
    description: '가볍고 빠른 모드 로더. 최신 버전 지원이 빠르며 성능 최적화 모드가 많습니다.',
    tag: '경량 · 빠른 업데이트',
    color: '#DBB695',
    colorBg: 'rgba(219,182,149,0.1)',
    colorBorder: 'rgba(219,182,149,0.4)',
  },
  {
    id: 'forge',
    name: 'Forge',
    description: '가장 오래되고 모드 수가 많은 로더. 1.12.2 ~ 최신 버전까지 방대한 모드 생태계를 보유합니다.',
    tag: '모드 수 최다 · 안정적',
    color: '#5B6EE1',
    colorBg: 'rgba(91,110,225,0.1)',
    colorBorder: 'rgba(91,110,225,0.4)',
  },
  {
    id: 'neoforge',
    name: 'NeoForge',
    description: 'Forge에서 포크된 차세대 로더. 1.20.2 이후 버전을 대상으로 하며 Forge 모드와 호환됩니다.',
    tag: '차세대 Forge · 1.20.2+',
    color: '#F16717',
    colorBg: 'rgba(241,103,23,0.1)',
    colorBorder: 'rgba(241,103,23,0.4)',
  },
];

export default function StepLoader({ selected, mcVersion, onSelect, onNext, onBack }: Props) {
  return (
    <div>
      <h2 className='text-2xl font-bold text-[#e2e8f0] mb-2'>로더 선택</h2>
      <p className='text-sm text-[#475569] font-mono mb-8'>사용할 모드 로더를 선택하세요</p>

      <div className='grid gap-3 mb-8'>
        {LOADERS.map(loader => {
          const disabled = loader.id === 'neoforge' && !isNeoForgeSupported(mcVersion);
          return (
            <button
              key={loader.id}
              onClick={() => !disabled && onSelect(loader.id)}
              disabled={disabled}
              style={selected === loader.id ? { background: loader.colorBg, borderColor: loader.color } : {}}
              className={`text-left p-4 rounded-xl border transition-colors ${
                disabled
                  ? 'bg-[#0d1424] border-[#1e2d45] cursor-not-allowed'
                  : selected === loader.id
                    ? ''
                    : 'bg-[#0d1424] border-[#1e2d45] hover:border-[#2d4a6b]'
              }`}
            >
              <div className='flex items-center justify-between mb-1'>
                <span
                  className='font-bold'
                  style={{ color: disabled ? '#475569' : selected === loader.id ? loader.color : '#e2e8f0' }}
                >
                  {loader.name}
                </span>
                <div className='flex items-center gap-2'>
                  {disabled && (
                    <span className='font-mono text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2 py-0.5 rounded'>
                      MC 1.20.2+ 필요
                    </span>
                  )}
                  <span className='font-mono text-xs text-[#475569] bg-[#080c14] border border-[#1e2d45] px-2 py-0.5 rounded'>
                    {loader.tag}
                  </span>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${disabled ? 'text-[#475569]' : 'text-[#94a3b8]'}`}>
                {loader.description}
              </p>
            </button>
          );
        })}
      </div>

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
