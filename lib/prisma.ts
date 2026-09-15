import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// In dev, if the cached client was instantiated before MentorshipPackage was added, bust the stale cache
if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).mentorshipPackage) {
  try {
    globalForPrisma.prisma.$disconnect();
  } catch {}
  delete globalForPrisma.prisma;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Returns the mentorshipPackage delegate, recovering from stale dev-server Prisma singletons.
 */
export function getMentorshipPackageModel() {
  if ((prisma as any).mentorshipPackage) {
    return (prisma as any).mentorshipPackage;
  }

  // If undefined on cached client, create a fresh client instance
  try {
    const freshClient = new PrismaClient();
    if ((freshClient as any).mentorshipPackage) {
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = freshClient;
      }
      return (freshClient as any).mentorshipPackage;
    }
  } catch (err) {
    console.warn("Failed to instantiate fresh PrismaClient for mentorshipPackage:", err);
  }

  return null;
}

