interface EmptyStateProps {
  title: string
  body: string
  action?: React.ReactNode
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      <div>
        <h3 className="text-base font-medium uppercase leading-[1.2] tracking-[1px]">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-[1.2] tracking-[0.5px] text-muted">
          {body}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
