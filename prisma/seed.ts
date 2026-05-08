import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquant — copier .env.example vers .env.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  try {
    const userCount = await prisma.user.count();
    console.log(`[seed] Utilisateurs existants : ${userCount}`);
    console.log(
      "[seed] Sign-up est ouvert — créer un compte via /sign-up puis promouvoir admin :"
    );
    console.log(
      `[seed]   npx prisma studio   (puis passer "role" à "admin" sur l'utilisateur cible)`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
