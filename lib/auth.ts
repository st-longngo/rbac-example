import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { LoginFormSchema } from '@/lib/definitions'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'database', // Store session in DB — supports revocation
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginFormSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || !user.hashedPassword) return null

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword,
        )
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id

        // Embed roles + permissions into session object
        const userWithRoles = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        })

        session.user.roles =
          userWithRoles?.userRoles.map((ur) => ur.role.name) ?? []
        session.user.permissions =
          userWithRoles?.userRoles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => ({
              action: rp.permission.action,
              resource: rp.permission.resource,
            })),
          ) ?? []
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
