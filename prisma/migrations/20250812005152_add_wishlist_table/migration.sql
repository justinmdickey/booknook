-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "publicationYear" INTEGER,
    "genre" TEXT,
    "description" TEXT,
    "coverUrl" TEXT,
    "pageCount" INTEGER,
    "tags" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModified" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WishlistItem_title_idx" ON "WishlistItem"("title");

-- CreateIndex
CREATE INDEX "WishlistItem_author_idx" ON "WishlistItem"("author");

-- CreateIndex
CREATE INDEX "WishlistItem_priority_idx" ON "WishlistItem"("priority");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");
