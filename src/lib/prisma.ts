import { PrismaClient } from "@prisma/client";

// 为了防止开发环境下 HMR (热更新) 导致创建多个实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 开启日志，这样你在控制台能看到 SQL 语句，方便调试
    log: ["query"], 
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;