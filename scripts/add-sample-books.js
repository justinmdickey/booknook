const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleBooks() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'dickey' }
    });
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    const sampleBooks = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        genre: "Fiction",
        status: "read",
        rating: 5,
        userId: user.id
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780061120084",
        genre: "Fiction",
        status: "read",
        rating: 5,
        userId: user.id
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "9780451524935",
        genre: "Fiction",
        status: "reading",
        rating: 4,
        userId: user.id
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "9780141439518",
        genre: "Romance",
        status: "unread",
        userId: user.id
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "9780316769174",
        genre: "Fiction",
        status: "unread",
        userId: user.id
      }
    ];
    
    for (const book of sampleBooks) {
      await prisma.book.create({ data: book });
    }
    
    console.log(`Added ${sampleBooks.length} sample books`);
    
    const totalBooks = await prisma.book.count({
      where: { userId: user.id }
    });
    console.log(`Total books for user: ${totalBooks}`);
    
  } catch (error) {
    console.error('Error adding books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleBooks();