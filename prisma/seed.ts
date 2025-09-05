import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const roles = [
    { id: "RL001", name: "Kasir" },
    { id: "RL002", name: "Pemilik" },
    { id: "RL003", name: "Admin" },
]

const seed = async () => {
    await prisma.role.deleteMany()
    await prisma.role.createMany({
        data: roles,
    })
}

void seed()