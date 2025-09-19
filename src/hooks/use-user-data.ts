import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useUserStore } from "~/store/user"
import { api } from "~/utils/api"
import { supabase } from "~/utils/supabase/component"

export const useUserData = () => {
    const {
        setProfile,
        setRoles,
        clearUser,
    } = useUserStore()

    const utils = api.useUtils()

    const fetchUserData = async (authUser: User) => {
        try {
            const [profile, userRole] = await Promise.all([
                utils.user.lihatProfile.fetch({ userId: authUser.id }),
                utils.user.lihatUserRole.fetch({ userId: authUser.id })
            ])

            // Set ke zustand
            setProfile(profile ?? null)
            setRoles(userRole ?? [])

            return { profile, roles: userRole }
        } catch (e) {
            const error = e instanceof Error ? e.message : "Error fetching data, silahkan coba lagi!"

            console.error('Error in fetchUserData', error)
            toast.error(error)

            return null
        }
    }

    const loadAfterLogin = async () => {
        try {
            // console.log('Loading user after login...')
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) {
                console.error('Error getting user:', error)
                toast.error("Error load user, silahkan refresh/coba lagi!")
                return false
            }

            if (user) {
                const result = await fetchUserData(user)
                return result !== null
            } else {
                // console.log('No authenticated user found')
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
        // console.log("clear data")
        clearUser()
    }

    return {
        fetchUserData,
        loadAfterLogin,
        checkAuthStatus,
        clearUserData,
    }
}