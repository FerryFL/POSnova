import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    const isPublic = pathName.startsWith("/login") || pathName.startsWith("/register")

    if (!user && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    if (user && isLogin) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return response
}