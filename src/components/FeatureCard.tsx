interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  index: number;
}

export default function FeatureCard({ title, description, tag, index }: FeatureCardProps) {
  const delayClass = `animate-fade-up-delay-${index + 3}`;
  return (
    <div
      className={`card-lift noise bg-[#0d1424] border border-[#1e2d45] rounded-2xl p-6 flex flex-col gap-4 ${delayClass}`}
    >
      <div className='flex items-start justify-between'>
        <span className='font-mono text-xs text-[#00d4aa] bg-[#00d4aa]/10 px-2.5 py-1 rounded-md border border-[#00d4aa]/20'>
          {tag}
        </span>
        <span className='font-mono text-[#475569] text-xs'>0{index + 1}</span>
      </div>
      <h3 className='text-lg font-semibold text-[#e2e8f0] leading-snug'>{title}</h3>
      <p className='text-[#94a3b8] text-sm leading-relaxed flex-1'>{description}</p>
    </div>
  );
}
