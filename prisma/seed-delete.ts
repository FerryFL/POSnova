import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const seed = async () => {
    // Clear UserRole
    await prisma.userRole.deleteMany()

    // Clear Profile
    await prisma.profile.deleteMany()
}

void seed()