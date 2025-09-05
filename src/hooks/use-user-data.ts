import type { User } from "@supabase/supabase-js"
import { useUserStore } from "~/store/user"
import type { ProfileWithUMKM, UserRoleWithRole } from "~/types/mapping"
import { createClient } from "~/utils/supabase/component"

export const useUserData = () => {
    const {
        setProfile,
        setRoles,
        clearUser,
    } = useUserStore()

    const supabase = createClient()

    const fetchUserData = async (authUser: User) => {
        try {
            console.log('Manually fetching user data for:', authUser.id)

            //Query buat profile
            const profileWithUMKMQuery = supabase
                .from('profile')
                .select(`id, email, name, umkm (id, nama)`)
                .eq('id', authUser.id)
                .single()

            const { data: profileData, error: profileError } = await profileWithUMKMQuery

            if (profileError) {
                console.error('Error fetching profile', profileError)
                return
            }

            // Query buat user roles
            const userroleWithRoleQuery = supabase
                .from('user_role')
                .select(`id, user_id, profile_id, role (id, name)`)
                .eq('user_id', authUser.id)

            const { data: rolesData, error: rolesError } = await userroleWithRoleQuery

            if (rolesError) {
                console.error('Error fetching roles', rolesError)
                return
            }

            // Biarin error type, fungsionalitas aman
            const profileMapping: ProfileWithUMKM = profileData
            const rolesMapping: UserRoleWithRole[] = rolesData

            // Set ke zustand
            setProfile(profileMapping)
            setRoles(rolesMapping)

            return { profile: profileData, roles: rolesData }
        } catch (error) {
            console.error('Error in fetchUserData', error)
            return null
        }
    }

    const loadAfterLogin = async () => {
        try {
            console.log('Loading user after login...')
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error) {
                console.error('Error getting user:', error)
                return false
            }

            if (user) {
                const result = await fetchUserData(user)
                return result !== null
            } else {
                console.log('No authenticated user found')
                return false
            }
        } catch (error) {
            console.error('Error loading user after login:', error)
            return false
        }
    }

    const checkAuthStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            return !!user
        } catch {
            return false
        }
    }

    const clearUserData = () => {
        console.log("clear data")
        clearUser()
    }

    return {
        fetchUserData,
        loadAfterLogin,
        checkAuthStatus,
        clearUserData,
    }
}