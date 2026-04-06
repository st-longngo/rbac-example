export default function RolesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-56 rounded-md bg-muted" />
        <div className="h-4 w-36 rounded-md bg-muted" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-md bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
