interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-secondary">{description}</p>}
    </div>
  );
}
