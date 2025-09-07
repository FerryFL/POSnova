import { persist } from 'zustand/middleware'
import { create } from "zustand";
import type { Profile, UserRole } from '~/utils/api';

interface UserState {
    profile: Profile | null
    roles: UserRole[]

    setProfile: (profile: Profile | null) => void
    setRoles: (roles: UserRole[]) => void
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
                return roles ? roles.some(r => r.roleId === roleId) : false
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

