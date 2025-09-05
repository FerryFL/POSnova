import { persist } from 'zustand/middleware'
import { create } from "zustand";
import type { ProfileWithUMKM, UserRoleWithRole } from "~/types/mapping";

interface UserState {
    profile: ProfileWithUMKM | null
    roles: UserRoleWithRole[]

    setProfile: (profile: ProfileWithUMKM) => void
    setRoles: (roles: UserRoleWithRole[]) => void
    clearUser: () => void

    isAuthenticated: () => boolean
    hasRole: (roleId: string) => boolean
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            roles: [],

            setProfile: (profile) => set({ profile }),
            setRoles: (roles) => set({ roles }),
            clearUser: () => set({
                profile: null,
                roles: [],
            }),

            isAuthenticated: () => {
                const { profile } = get()
                return !!profile
            },

            hasRole: (roleId: string) => {
                const { roles } = get()
                return roles.some(r => r.role?.id === roleId)
            }
        }),
        {
            name: 'user-store',
            partialize: (state) => ({
                profile: state.profile,
                roles: state.roles,
            })
        }
    )
)

