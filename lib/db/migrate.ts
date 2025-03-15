import { env } from "@/lib/env.mjs";

import { prisma } from "@/lib/db";

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  await prisma.$executeRawUnsafe(`
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'resources') 
        BEGIN
          CREATE TABLE resources (
            id VARCHAR(21) PRIMARY KEY DEFAULT dbo.nanoid(),
            content NVARCHAR(4000) NOT NULL,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
          )
        END
      `);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
