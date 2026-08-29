interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-secondary">{subtitle}</p>}
    </div>
  );
}
