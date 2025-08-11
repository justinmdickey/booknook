const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Test user exists
    const user = await prisma.user.findUnique({
      where: { username: 'dickey' }
    });
    console.log('User found:', user ? `${user.username} (ID: ${user.id})` : 'NOT FOUND');
    
    if (!user) {
      console.log('Creating user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('dickey2025', 10);
      const newUser = await prisma.user.create({
        data: {
          username: 'dickey',
          passwordHash: hashedPassword
        }
      });
      console.log('User created:', newUser.username);
    }
    
    // Test books
    const books = await prisma.book.findMany({
      where: { userId: user?.id }
    });
    console.log(`Books found: ${books.length}`);
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection: OK');
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();