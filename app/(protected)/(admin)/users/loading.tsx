export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-64 rounded-md bg-muted" />
        <div className="h-4 w-40 rounded-md bg-muted" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-md bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
