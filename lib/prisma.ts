import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['warn', 'error'],
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prismaBase = globalForPrisma.prisma ?? prismaClientSingleton()

export const prisma = prismaBase

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase
