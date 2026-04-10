import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';
import TechBadge from '@/components/TechBadge';

const features = [
  {
    tag: 'MODRINTH API',
    title: '실시간 모드 검색 및 메타데이터 조회',
    description:
      'Modrinth API와 직접 연동해 모드 이름, 버전, 의존성을 자동으로 가져옵니다. 수동 입력 없이 검색 한 번으로 끝.',
  },
  {
    tag: 'HASH & JSON',
    title: 'distribution.json 자동 생성 · MD5 검증',
    description: 'distribution.json을 즉시 생성하고, 각 파일의 MD5 해시를 자동 계산해 무결성을 보장합니다.',
  },
  {
    tag: 'MULTI LOADER',
    title: 'Fabric · Forge · NeoForge 전부 지원',
    description: '로더 종류에 상관없이 동일한 UI로 작업하세요. 로더 전환 시 스펙 차이를 자동으로 처리합니다.',
  },
];

const techStack = [
  { name: 'Next.js', type: 'frontend' as const },
  { name: 'React', type: 'frontend' as const },
  { name: 'TypeScript', type: 'frontend' as const },
  { name: 'Tailwind CSS', type: 'frontend' as const },
  { name: 'NestJS', type: 'backend' as const },
  { name: 'PostgreSQL', type: 'infra' as const },
];

export default function Home() {
  return (
    <div className='min-h-screen dot-grid bg-[#080c14]'>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className='border-b border-[#1e2d45] sticky top-0 z-50 backdrop-blur-md bg-[#080c14]/80'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <span className='font-mono text-sm font-bold text-[#00d4aa]'>distro-builder</span>
        </div>
      </nav>

      <main className='max-w-6xl mx-auto px-6'>
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className='pt-28 pb-24'>
          <div className='grid lg:grid-cols-[1fr_auto] gap-12 items-center'>
            {/* Left */}
            <div>
              {/* Status badge */}
              <div className='inline-flex items-center gap-2 font-mono text-xs text-[#94a3b8] bg-[#0d1424] border border-[#1e2d45] px-3 py-1.5 rounded-full mb-8 animate-fade-up'>
                <span className='w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse' />
                v0.1.0 — early preview
              </div>

              <h1 className='text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-fade-up-delay-1'>
                <span className='gradient-text'>Distro</span>
                <span className='text-[#e2e8f0]'> Builder</span>
              </h1>

              <p className='text-[#94a3b8] text-lg leading-relaxed max-w-lg mb-10 animate-fade-up-delay-2'>
                <code className='font-mono text-sm text-[#00d4aa] bg-[#00d4aa]/10 px-1.5 py-0.5 rounded'>
                  distribution.json
                </code>{' '}
                을 웹에서 손쉽게 만드는 도구.
                <br />
                Modrinth 연동, 해시 자동계산, 멀티 로더 지원.
              </p>

              <div className='flex flex-wrap gap-3 animate-fade-up-delay-3'>
                <Link
                  href='/search'
                  className='btn-scan font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors'
                >
                  시작하기 →
                </Link>
                <a
                  href='https://github.com/go-tiger/gt-distro-builder-fe'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn-scan font-mono text-sm font-medium border border-[#1e2d45] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#2d4a6b] px-6 py-2.5 rounded-lg transition-colors'
                >
                  view source ↗
                </a>
              </div>
            </div>

            {/* Right — Terminal card */}
            <div className='hidden lg:block w-80 animate-slide-left'>
              <div className='noise bg-[#0d1424] border border-[#1e2d45] rounded-2xl overflow-hidden glow-teal'>
                {/* Terminal title bar */}
                <div className='flex items-center gap-2 px-4 py-3 border-b border-[#1e2d45] bg-[#080c14]/60'>
                  <span className='w-2.5 h-2.5 rounded-full bg-[#ff5f57]' />
                  <span className='w-2.5 h-2.5 rounded-full bg-[#febc2e]' />
                  <span className='w-2.5 h-2.5 rounded-full bg-[#28c840]' />
                  <span className='font-mono text-xs text-[#475569] ml-2'>distribution.json</span>
                </div>
                {/* Code preview */}
                <pre className='font-mono text-xs leading-6 p-4 text-[#94a3b8] overflow-x-auto'>
                  {`{
  `}
                  <span className='text-[#0ea5e9]'>"id"</span>
                  {`: `}
                  <span className='text-[#00d4aa]'>"1.20.1"</span>
                  {`,
  `}
                  <span className='text-[#0ea5e9]'>"loader"</span>
                  {`: `}
                  <span className='text-[#00d4aa]'>"fabric"</span>
                  {`,
  `}
                  <span className='text-[#0ea5e9]'>"mods"</span>
                  {`: [
    {
      `}
                  <span className='text-[#0ea5e9]'>"id"</span>
                  {`: `}
                  <span className='text-[#00d4aa]'>"sodium"</span>
                  {`,
      `}
                  <span className='text-[#0ea5e9]'>"md5"</span>
                  {`: `}
                  <span className='text-[#f59e0b]'>"a3f9..."</span>
                  {`
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className='border-t border-[#1e2d45]' />

        {/* ── Features ────────────────────────────────────────────────── */}
        <section className='py-24'>
          <div className='flex items-baseline gap-4 mb-12'>
            <h2 className='text-2xl font-bold text-[#e2e8f0]'>주요 기능</h2>
            <span className='font-mono text-xs text-[#475569]'>// features</span>
          </div>
          <div className='grid md:grid-cols-3 gap-4'>
            {features.map((f, i) => (
              <FeatureCard key={i} index={i} {...f} />
            ))}
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className='border-t border-[#1e2d45]' />

        {/* ── Tech Stack ──────────────────────────────────────────────── */}
        <section className='py-24'>
          <div className='flex items-baseline gap-4 mb-10'>
            <h2 className='text-2xl font-bold text-[#e2e8f0]'>기술 스택</h2>
            <span className='font-mono text-xs text-[#475569]'>// tech-stack</span>
          </div>

          <div className='grid sm:grid-cols-3 gap-6'>
            {/* Frontend */}
            <div>
              <p className='font-mono text-xs text-[#475569] mb-3 uppercase tracking-widest'>Frontend</p>
              <div className='flex flex-wrap gap-2'>
                {techStack
                  .filter(t => t.type === 'frontend')
                  .map(t => (
                    <TechBadge key={t.name} {...t} />
                  ))}
              </div>
            </div>
            {/* Backend */}
            <div>
              <p className='font-mono text-xs text-[#475569] mb-3 uppercase tracking-widest'>Backend</p>
              <div className='flex flex-wrap gap-2'>
                {techStack
                  .filter(t => t.type === 'backend')
                  .map(t => (
                    <TechBadge key={t.name} {...t} />
                  ))}
              </div>
            </div>
            {/* Infra */}
            <div>
              <p className='font-mono text-xs text-[#475569] mb-3 uppercase tracking-widest'>Infra</p>
              <div className='flex flex-wrap gap-2'>
                {techStack
                  .filter(t => t.type === 'infra')
                  .map(t => (
                    <TechBadge key={t.name} {...t} />
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className='border-t border-[#1e2d45] mt-auto'>
        <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <span className='font-mono text-xs text-[#475569]'>© 2026 go-tiger. All rights reserved.</span>
          <a
            href='https://github.com/go-tiger/gt-distro-builder-fe'
            target='_blank'
            rel='noopener noreferrer'
            className='font-mono text-xs text-[#475569] hover:text-[#00d4aa] transition-colors'
          >
            github ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
