'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createUserAction } from '@/actions/admin'
import type { AdminFormState } from '@/lib/definitions'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/auth/FormField'
import { Plus } from 'lucide-react'

interface RoleOption {
  id: string
  name: string
}

interface CreateUserFormProps {
  roles: RoleOption[]
  onSuccess: () => void
}

/** Inner form component — given its own key so useActionState resets on re-mount. */
function CreateUserForm({ roles, onSuccess }: CreateUserFormProps) {
  const t = useTranslations('users.create')
  const [state, action, isPending] = useActionState<AdminFormState, FormData>(
    createUserAction,
    undefined,
  )

  useEffect(() => {
    if (state?.message) onSuccess()
  }, [state?.message, onSuccess])

  return (
    <form action={action} className="space-y-4">
      {state?.errors?.general && (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.general[0]}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="name"
        label={t('nameLabel')}
        placeholder={t('namePlaceholder')}
        error={state?.errors?.name?.[0]}
      />

      <FormField
        id="email"
        label={t('emailLabel')}
        type="email"
        placeholder={t('emailPlaceholder')}
        required
        error={state?.errors?.email?.[0]}
      />

      <FormField
        id="password"
        label={t('passwordLabel')}
        type="password"
        required
        error={state?.errors?.password?.[0]}
      />

      {/* Role multi-select */}
      <div className="space-y-2">
        <p className="text-sm font-medium leading-none">{t('rolesLabel')}</p>
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noRolesAvailable')}</p>
        ) : (
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
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{role.name}</span>
              </label>
            ))}
          </div>
        )}
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

interface CreateUserDialogProps {
  roles: RoleOption[]
}

/**
 * Dialog for creating a new user.
 * Re-keys the inner form on close to reset form state and validation errors.
 */
export function CreateUserDialog({ roles }: CreateUserDialogProps) {
  const t = useTranslations('users')
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) setFormKey((k) => k + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('actions.create')}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
          <DialogDescription>{t('create.description')}</DialogDescription>
        </DialogHeader>
        <CreateUserForm
          key={formKey}
          roles={roles}
          onSuccess={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
