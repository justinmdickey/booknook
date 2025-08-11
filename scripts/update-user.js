const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUser() {
  const username = process.env.DEFAULT_USERNAME || 'dickey';
  const password = process.env.DEFAULT_PASSWORD || 'dickey2025';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Update the existing user
    const user = await prisma.user.update({
      where: { username: 'dickey' },
      data: {
        passwordHash: hashedPassword
      }
    });
    
    console.log('User updated:', user.username);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUser();