import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const roles = [
    { id: "RL001", name: "Kasir" },
    { id: "RL002", name: "Pemilik" },
    { id: "RL003", name: "Admin" },
]

const umkms = [
    {
        id: "UMKM001-ADMIN",
        nama: "UMKM Admin",
        alamat: "Admin",
        noTelp: "08981234567",
    },
]

const seed = async () => {
    // Inject Roles
    await prisma.role.deleteMany()
    await prisma.role.createMany({
        data: roles,
    })

    // Inject UMKM
    await prisma.uMKM.deleteMany()
    await prisma.uMKM.createMany({ data: umkms })
}

void seed()