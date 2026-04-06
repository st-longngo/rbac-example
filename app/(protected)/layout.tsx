import { verifySession } from '@/lib/dal'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { Header } from '@/components/layout/Header'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession() // Throws unauthorized() if not logged in

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav userId={session.userId} roles={session.roles} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
