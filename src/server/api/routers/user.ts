import { supabaseAccess } from "~/utils/supabase/supabase-access";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
    lihatProfile: publicProcedure.input(
        z.object({
            userId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx;

        const profile = await db.profile.findUnique({
            where: { id: input.userId },
            select: {
                id: true,
                email: true,
                name: true,
                UMKM: {
                    select: {
                        id: true,
                        nama: true,
                    },
                },
            },
        });

        if (!profile) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Profile tidak ditemukan",
            })
        }

        return profile;
    }),
    lihatUserRole: publicProcedure.input(
        z.object({
            userId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx;

        const roles = await db.userRole.findMany({
            where: { userId: input.userId },
            select: {
                id: true,
                userId: true,
                profileId: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                roleId: true
            },
        });

        if (!roles) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User Role tidak ditemukan",
            })
        }

        return roles;
    }),
    signUp: publicProcedure.input(
        z.object({
            name: z.string(),
            umkmId: z.string(),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.array(z.string()).optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx
        const { email, password } = input
        const { data, error } = await supabaseAccess.auth.signUp({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        if (!data.user) {
            return {
                success: false,
                message: "User tidak berhasil dibuat",
            };
        }

        try {
            const profile = await db.profile.create({
                data: {
                    id: data.user.id,
                    name: input.name,
                    email: input.email,
                    UMKMId: input.umkmId,
                }
            })

            if (data.user && input.role && input.role.length > 0) {
                await db.userRole.createMany({
                    data: input.role.map((roleId) => ({
                        roleId,
                        userId: data.user!.id,
                        profileId: profile.id,
                    })),
                })
            }
        } catch (e) {
            const error = e instanceof Error ? e.message : "Unknown Error"

            console.error("Error dalam pembuatan profile: ", error)

            await supabaseAccess.auth.admin.deleteUser(data.user.id)

            return {
                success: false,
                message: error
            }
        }

        return { success: true, user: data.user };
    })
})