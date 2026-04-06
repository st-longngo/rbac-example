import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  error?: string
}

/**
 * Reusable form field: label + input + optional inline error message.
 * `name` is set to `id` automatically — keep field `id` and schema key in sync.
 */
export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required,
  error,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
