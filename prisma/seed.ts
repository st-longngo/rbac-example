import { PrismaClient, Action, Resource } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ─── 1. Create all permissions ───────────────────────────────
  const permissionMatrix: { action: Action; resource: Resource }[] = [
    // USERS
    { action: 'MANAGE', resource: 'USERS' },
    { action: 'READ', resource: 'USERS' },
    // ROLES
    { action: 'MANAGE', resource: 'ROLES' },
    // REPORTS
    { action: 'MANAGE', resource: 'REPORTS' },
    { action: 'CREATE', resource: 'REPORTS' },
    { action: 'READ', resource: 'REPORTS' },
    { action: 'UPDATE', resource: 'REPORTS' },
    // ORDERS
    { action: 'MANAGE', resource: 'ORDERS' },
    { action: 'CREATE', resource: 'ORDERS' },
    { action: 'READ', resource: 'ORDERS' },
    { action: 'UPDATE', resource: 'ORDERS' },
    // SETTINGS
    { action: 'MANAGE', resource: 'SETTINGS' },
    // DASHBOARD
    { action: 'READ', resource: 'DASHBOARD' },
  ]

  for (const p of permissionMatrix) {
    await prisma.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource } },
      update: {},
      create: p,
    })
  }
  console.log(`  ✓ Created ${permissionMatrix.length} permissions`)

  // ─── 2. Create roles ────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full system access' },
  })
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: { name: 'manager', description: 'Manage reports and orders' },
  })
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Basic access' },
  })
  const guestRole = await prisma.role.upsert({
    where: { name: 'guest' },
    update: {},
    create: { name: 'guest', description: 'Read-only limited access' },
  })
  console.log('  ✓ Created roles: admin, manager, user, guest')

  // ─── 3. Assign permissions to roles ─────────────────────────
  // Admin gets ALL permissions
  const allPermissions = await prisma.permission.findMany()
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    })
  }

  // Manager gets: reports (CREATE/READ/UPDATE), orders (CREATE/READ/UPDATE), users (READ), dashboard (READ)
  const managerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'REPORTS', action: { in: ['CREATE', 'READ', 'UPDATE'] } },
        { resource: 'ORDERS', action: { in: ['CREATE', 'READ', 'UPDATE'] } },
        { resource: 'USERS', action: 'READ' },
        { resource: 'DASHBOARD', action: 'READ' },
      ],
    },
  })
  for (const p of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: p.id },
    })
  }

  // User gets: reports (READ), orders (READ, CREATE), dashboard (READ)
  const userPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'REPORTS', action: 'READ' },
        { resource: 'ORDERS', action: { in: ['READ', 'CREATE'] } },
        { resource: 'DASHBOARD', action: 'READ' },
      ],
    },
  })
  for (const p of userPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: p.id },
    })
  }

  // Guest gets: reports (READ), dashboard (READ)
  const guestPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'REPORTS', action: 'READ' },
        { resource: 'DASHBOARD', action: 'READ' },
      ],
    },
  })
  for (const p of guestPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: guestRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: guestRole.id, permissionId: p.id },
    })
  }
  console.log('  ✓ Assigned permissions to roles')

  // ─── 4. Create default admin user ───────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@123456', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      hashedPassword,
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id, assignedBy: adminUser.id },
  })

  // Create a manager user
  const managerHashedPassword = await bcrypt.hash('Manager@123456', 12)
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Test Manager',
      hashedPassword: managerHashedPassword,
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: managerUser.id, roleId: managerRole.id } },
    update: {},
    create: { userId: managerUser.id, roleId: managerRole.id, assignedBy: adminUser.id },
  })

  // Create a regular user
  const userHashedPassword = await bcrypt.hash('User@123456', 12)
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      hashedPassword: userHashedPassword,
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: regularUser.id, roleId: userRole.id } },
    update: {},
    create: { userId: regularUser.id, roleId: userRole.id, assignedBy: adminUser.id },
  })

  console.log('  ✓ Created test users:')
  console.log('      admin@example.com    / Admin@123456   [admin]')
  console.log('      manager@example.com  / Manager@123456 [manager]')
  console.log('      user@example.com     / User@123456    [user]')
  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
