import { supabaseAccess } from "~/utils/supabase/supabase-access";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const userRouter = createTRPCRouter({
    lihatProfile: publicProcedure.input(
        z.object({
            userId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx

        const whereClause: Prisma.ProfileWhereInput = {}
        if (input.userId) {
            whereClause.id = input.userId
        }

        const profile = await db.profile.findFirst({
            select: {
                id: true,
                name: true,
                email: true,
                UserRole: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            where: whereClause
        })

        return profile
    }),
    signUp: publicProcedure.input(
        z.object({
            email: z.string().email(),
            password: z.string().min(6)
        })
    ).mutation(async ({ input }) => {
        const { email, password } = input
        const { data, error } = await supabaseAccess.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
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

        return { user: data.user };
    })
})