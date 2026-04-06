---
applyTo: "**/*.css,**/*.tsx,**/*.jsx"
description: "Styling conventions — Tailwind CSS v4, shadcn/ui, responsive patterns"
---

# Styling Conventions

## Tailwind CSS v4

- Tailwind v4 is the primary styling approach — no CSS Modules, no styled-components
- Use `@import "tailwindcss"` in `globals.css` — Tailwind v4 uses CSS import syntax
- Use utility classes directly in JSX — avoid `@apply` unless extracting a design token
- Use `cn()` helper from `lib/utils.ts` for conditional class merging:
  ```tsx
  import { cn } from '@/lib/utils'
  <div className={cn('p-4', isActive && 'bg-primary')} />
  ```

## Design Tokens (shadcn/ui CSS Variables)

- Use semantic color variables, not raw Tailwind colors:
  - `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`
  - `bg-primary`, `text-primary-foreground`
  - `bg-destructive`, `text-destructive`
  - `border-border`, `ring-ring`
- Never hardcode hex/rgb values — always use CSS variable tokens

## Responsive Design

- Mobile-first: write base styles first, add breakpoint prefixes for larger screens
- Breakpoints: `sm:` → `md:` → `lg:` → `xl:`
- Common pattern: `className="w-full md:w-1/2 lg:w-1/3"`

## Component Styling

- shadcn/ui components accept `className` prop — extend, don't modify source files
- Use `variant` prop for component states: `<Button variant="destructive">`
- Use `<Card>`, `<Table>`, `<Dialog>` from shadcn/ui — don't build custom equivalents

## Layout Patterns

- Auth pages: centered card with `min-h-screen items-center justify-center`
- Protected pages: sidebar + header from `(protected)/layout.tsx`
- Use `space-y-*` and `gap-*` for spacing — avoid manual margin
