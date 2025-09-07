export type ProfileWithUMKM = {
    id: string
    email: string | null
    name: string | null
    umkm: {
        id: string
        nama: string
    }
}

export type UserRoleWithRole = {
    id: string
    user_id: string
    profile_id: string
    role: {
        id: string
        name: string
    }
}
