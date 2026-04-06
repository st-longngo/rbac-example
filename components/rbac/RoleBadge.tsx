import { Badge } from '@/components/ui/badge'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const roleVariants: Record<string, BadgeVariant> = {
  admin: 'destructive',
  manager: 'default',
  user: 'secondary',
  guest: 'outline',
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant={roleVariants[role] ?? 'secondary'}>{role}</Badge>
}
