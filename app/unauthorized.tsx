import Link from 'next/link'

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">401</h1>
        <h2 className="text-2xl font-semibold">Chưa xác thực</h2>
        <p className="text-muted-foreground">
          Bạn cần đăng nhập để truy cập trang này.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Đăng nhập
      </Link>
    </main>
  )
}
