interface EmptyStateProps {
  title: string
  body: string
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div>
        <h3 className="text-base font-medium uppercase leading-[1.2] tracking-[0.0625em]">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-[1.2] tracking-[0.0357em] text-muted">
          {body}
        </p>
      </div>
    </div>
  )
}
