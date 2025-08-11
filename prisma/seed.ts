import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const defaultUsername = process.env.DEFAULT_USERNAME || 'admin'
  const defaultPassword = process.env.DEFAULT_PASSWORD || 'changeme'
  
  const existingUser = await prisma.user.findUnique({
    where: { username: defaultUsername }
  })
  
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10)
    await prisma.user.create({
      data: {
        username: defaultUsername,
        passwordHash
      }
    })
    console.log(`Default user created: ${defaultUsername}`)
  } else {
    console.log(`User ${defaultUsername} already exists`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })