'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { editUserAction } from '@/actions/admin'
import type { AdminFormState } from '@/lib/definitions'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from '@/components/rbac/RoleBadge'
import { Eye, Pencil } from 'lucide-react'

// ─── Shared types ─────────────────────────────────────────────────────────────

interface RoleOption {
  id: string
  name: string
}

interface UserRoleEntry {
  roleId: string
  role: {
    id: string
    name: string
    rolePermissions: {
      permissionId: string
      permission: { action: string; resource: string }
    }[]
  }
}

export interface UserRow {
  id: string
  name: string | null
  email: string
  createdAt: Date
  userRoles: UserRoleEntry[]
}

// ─── Edit form (inner) ────────────────────────────────────────────────────────

interface EditUserFormProps {
  user: UserRow
  roles: RoleOption[]
  onSuccess: () => void
}

/** Inner edit form — re-keyed on dialog close to reset state. */
function EditUserForm({ user, roles, onSuccess }: EditUserFormProps) {
  const t = useTranslations('users.edit')
  const [state, action, isPending] = useActionState<AdminFormState, FormData>(
    editUserAction,
    undefined,
  )

  const currentRoleIds = new Set(user.userRoles.map((ur) => ur.roleId))

  useEffect(() => {
    if (state?.message) onSuccess()
  }, [state?.message, onSuccess])

  return (
    <form action={action} className="space-y-4">
      {/* Hidden userId */}
      <input type="hidden" name="userId" value={user.id} />

      {state?.errors?.general && (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.general[0]}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium leading-none">
          {t('nameLabel')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name ?? ''}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={user.email}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <p className="text-sm font-medium leading-none">{t('rolesLabel')}</p>
        <div className="flex flex-col gap-2 rounded-md border p-3">
          {roles.map((role) => (
            <label
              key={role.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                name="roleIds"
                value={role.id}
                defaultChecked={currentRoleIds.has(role.id)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm">{role.name}</span>
            </label>
          ))}
        </div>
        {state?.errors?.roleIds && (
          <p className="text-sm text-destructive">{state.errors.roleIds[0]}</p>
        )}
      </div>

      <DialogFooter>
        <DialogClose
          render={
            <Button variant="outline" type="button">
              Cancel
            </Button>
          }
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Detail panel (inner) ─────────────────────────────────────────────────────

interface DetailPanelProps {
  user: UserRow
  canEdit: boolean
  locale: string
  onEditClick: () => void
}

function DetailPanel({ user, canEdit, locale, onEditClick }: DetailPanelProps) {
  const t = useTranslations('users.detail')

  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US'

  // Derive unique permissions from all assigned roles
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map(
          (rp) => `${rp.permission.action}:${rp.permission.resource}`,
        ),
      ),
    ),
  ).sort()

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('nameLabel')}
        </p>
        <p className="mt-1 text-sm font-medium">
          {user.name ?? (
            <span className="italic text-muted-foreground">{t('noName')}</span>
          )}
        </p>
      </div>

      {/* Email */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('emailLabel')}
        </p>
        <p className="mt-1 text-sm">{user.email}</p>
      </div>

      {/* Member since */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('createdAtLabel')}
        </p>
        <p className="mt-1 text-sm">
          {user.createdAt.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Roles */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('rolesLabel')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {user.userRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noRoles')}</p>
          ) : (
            user.userRoles.map((ur) => (
              <RoleBadge key={ur.roleId} role={ur.role.name} />
            ))
          )}
        </div>
      </div>

      {/* Permissions */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('permissionsLabel')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noPermissions')}</p>
          ) : (
            permissions.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="font-mono text-[10px] px-1.5 py-0.5"
              >
                {p}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Edit shortcut for admins */}
      {canEdit && (
        <DialogFooter>
          <Button size="sm" onClick={onEditClick}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t('editButton')}
          </Button>
        </DialogFooter>
      )}
    </div>
  )
}

// ─── UserActions ──────────────────────────────────────────────────────────────

interface UserActionsProps {
  user: UserRow
  roles: RoleOption[]
  canEdit: boolean
  locale: string
}

/**
 * Per-row action buttons that coordinate the Detail and Edit dialogs.
 * Clicking "Edit" from within the Detail dialog smoothly transitions
 * to the Edit form without navigation.
 */
export function UserActions({ user, roles, canEdit, locale }: UserActionsProps) {
  const t = useTranslations('users')
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editKey, setEditKey] = useState(0)

  function openEditFromDetail() {
    setDetailOpen(false)
    setEditOpen(true)
  }

  function handleEditOpenChange(isOpen: boolean) {
    setEditOpen(isOpen)
    if (!isOpen) setEditKey((k) => k + 1)
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* ── Detail dialog ─────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setDetailOpen(true)}
          aria-label={t('actions.viewDetail')}
        >
          <Eye className="mr-1 h-3.5 w-3.5" />
          {t('actions.viewDetail')}
        </Button>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('detail.title')}</DialogTitle>
          </DialogHeader>
          <DetailPanel
            user={user}
            canEdit={canEdit}
            locale={locale}
            onEditClick={openEditFromDetail}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ───────────────────────────── */}
      {canEdit && (
        <>
          <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setEditOpen(true)}
              aria-label={t('actions.edit')}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              {t('actions.edit')}
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('edit.title')}</DialogTitle>
                <DialogDescription>{t('edit.description')}</DialogDescription>
              </DialogHeader>
              <EditUserForm
                key={editKey}
                user={user}
                roles={roles}
                onSuccess={() => handleEditOpenChange(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
