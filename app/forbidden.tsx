import Link from 'next/link'

export default function Forbidden() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">403</h1>
        <h2 className="text-2xl font-semibold">Không có quyền truy cập</h2>
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập vào tài nguyên này.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Về Dashboard
      </Link>
    </main>
  )
}
