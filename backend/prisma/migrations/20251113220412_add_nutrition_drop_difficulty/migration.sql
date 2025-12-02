/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Recipe` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "goustoId" TEXT,
    "servings" INTEGER,
    "cookMinutes" INTEGER,
    "calories" INTEGER,
    "protein" REAL,
    "carbohydrate" REAL,
    "fat" REAL,
    "fibre" REAL,
    "salt" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("calories", "cookMinutes", "createdAt", "goustoId", "id", "notes", "ownerId", "servings", "sourceUrl", "title", "updatedAt") SELECT "calories", "cookMinutes", "createdAt", "goustoId", "id", "notes", "ownerId", "servings", "sourceUrl", "title", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_goustoId_key" ON "Recipe"("goustoId");
CREATE INDEX "Recipe_title_idx" ON "Recipe"("title");
CREATE INDEX "Recipe_cookMinutes_idx" ON "Recipe"("cookMinutes");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
