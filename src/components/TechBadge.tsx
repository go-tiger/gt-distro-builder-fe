interface TechBadgeProps {
  name: string;
  type?: 'frontend' | 'backend' | 'infra';
}

const typeColor: Record<string, string> = {
  frontend: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/20',
  backend:  'text-[#00d4aa] bg-[#00d4aa]/10 border-[#00d4aa]/20',
  infra:    'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
};

export default function TechBadge({ name, type = 'frontend' }: TechBadgeProps) {
  return (
    <span className={`font-mono text-xs px-3 py-1.5 rounded-md border font-medium ${typeColor[type]}`}>
      {name}
    </span>
  );
}
