@AGENTS.md

---

# Claude-Specific Notes

## Before writing any code

1. Read `AGENTS.md` fully — it contains critical Next.js 16 breaking changes
2. Read the relevant doc in `docs/` for the area you're working on
3. If touching auth flow → read `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
4. If touching routing/proxy → read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

## Preferred patterns

- Implement changes directly rather than suggesting them
- Run `pnpm prisma generate` in terminal after editing `prisma/schema.prisma`
- Run `pnpm prisma migrate dev` after schema changes
- Validate TypeScript after edits with `pnpm tsc --noEmit`

## Do NOT

- Create `middleware.ts` — this project uses `proxy.ts`
- Export a function named `middleware` anywhere — use `proxy`
- Use `redirect('/login')` for unauthenticated users — use `unauthorized()`
- Use `redirect('/forbidden')` for unauthorized users — use `forbidden()`
- Check permissions in Client Components — all permission logic is server-side
- Make DB calls in `proxy.ts` — optimistic checks only
