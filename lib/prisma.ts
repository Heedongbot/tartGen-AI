// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: any }

const connectionString = process.env.DATABASE_URL;
const isValidPostgres = connectionString?.startsWith("postgres");

let prismaInstance: any = undefined;

if (isValidPostgres) {
    try {
        prismaInstance = new PrismaClient();
    } catch (e) {
        console.warn("Failed to initialize PrismaClient:", e);
    }
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
