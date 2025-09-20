import { PrismaClient } from "@prisma/client";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

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

const users = [
    {
        email: "admin@posnova.com",
        password: "admin123456",
        name: "Admin POSnova",
        umkmId: "UMKM001-ADMIN",
        role: ["RL003"]
    },
]

const seedRole = async () => {
    await prisma.role.deleteMany()
    await prisma.role.createMany({
        data: roles,
    })
}

const seedUmkm = async () => {
    await prisma.uMKM.deleteMany()
    await prisma.uMKM.createMany({ data: umkms })
}

const seedUser = async () => {
    await prisma.userRole.deleteMany()
    await prisma.profile.deleteMany()

    const ctx = createTRPCContext({});
    const caller = appRouter.createCaller(ctx);

    for (const userData of users) {
        await caller.user.signUp({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            umkmId: userData.umkmId,
            role: userData.role
        });
    }
}

const main = async () => {
    // Comment kalo gk mau jalanin seed
    await seedRole()
    await seedUmkm()
    await seedUser()
}

void main()