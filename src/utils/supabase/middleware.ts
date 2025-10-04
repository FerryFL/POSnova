import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAccess } from './supabase-access'

export const updateSession = async (request: NextRequest) => {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookies) {
                    cookies.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathName = request.nextUrl.pathname
    const isLogin = pathName.startsWith("/login")
    const isRegist = pathName.startsWith("/register")
    // || pathName.startsWith("/register")

    // console.log("=========================TEST========================")

    const cashierRoute =
        pathName.startsWith("/dashboard-cashier") ||
        pathName.startsWith("/payment")

    const ownerRoute =
        pathName.startsWith("/category") ||
        pathName.startsWith("/variant") ||
        pathName.startsWith("/transaction") ||
        pathName === "/dashboard" ||
        pathName.startsWith("/product")

    const adminRoute =
        pathName.startsWith("/umkm") ||
        pathName.startsWith("/admin")

    // Cek kalau gk ada user, gk boleh ke page selain login/register
    if (!user && !isLogin) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Cek kalau ada user, gk boleh ke login
    if (user && isLogin) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (user) {
        const { data: profile } = await supabaseAccess
            .from('Profile')
            .select('UserRole(roleId)')
            .eq('id', user.id)
            .single()

        // console.log("Profile: ", profile)
        // console.log("Errror: ", error)

        const hasCashier = profile?.UserRole.some((r) => r.roleId === "RL001")
        const hasOwner = profile?.UserRole.some((r) => r.roleId === "RL002")
        const hasAdmin = profile?.UserRole.some((r) => r.roleId === "RL003")

        if (isRegist && !hasAdmin) {
            return NextResponse.redirect(new URL("/", request.url))
        }

        // Ke route kasir, tapi gk punya kasir 
        if (cashierRoute && !hasCashier) {
            // console.log("No Cashier", pathName)
            return NextResponse.redirect(new URL("/", request.url))
        }

        // Ke route owner, tapi gk punya owner 
        if (ownerRoute && !hasOwner) {
            // console.log("No Owner", pathName)
            return NextResponse.redirect(new URL("/", request.url))
        }

        // Ke route admin, tapi gk punya admin
        if (adminRoute && !hasAdmin) {
            // console.log("No Admin", pathName)
            return NextResponse.redirect(new URL("/", request.url))
        }

    }

    return response
}