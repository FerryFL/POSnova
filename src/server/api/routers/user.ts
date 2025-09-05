import { supabaseAccess } from "~/utils/supabase/supabase-access";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
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