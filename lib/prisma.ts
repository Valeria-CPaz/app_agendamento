// Evita instanciar o PrismaClient várias vezes em dev (HMR do Next).
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"], // útil em dev para ver o que está rolando
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
