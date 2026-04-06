interface PageHeaderProps {
  title: string
  description?: React.ReactNode
}

/**
 * Shared heading block used at the top of every page.
 * Renders a bold h1 and an optional muted description paragraph.
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
