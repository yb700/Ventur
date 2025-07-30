import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/portal') &&
        request.nextUrl.pathname !== '/'
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // 2. If user IS logged in, check if they need to complete onboarding
    if (user && request.nextUrl.pathname.startsWith('/portal')) {
        console.log('User logged in, checking onboarding status for:', user.id);
        console.log('Current pathname:', request.nextUrl.pathname);

        // Fetch the user's profile to check their onboarding status
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single()

        console.log('Profile query result:', { profile, profileError });

        // If no profile exists (new user), redirect to onboarding
        if (profileError && profileError.code === 'PGRST116') {
            console.log('No profile found - redirecting to onboarding');
            // No profile found - new user needs onboarding
            if (request.nextUrl.pathname !== '/portal/onboarding') {
                const url = request.nextUrl.clone()
                url.pathname = '/portal/onboarding'
                console.log('Redirecting to:', url.pathname);
                return NextResponse.redirect(url)
            }
        } else if (profile) {
            console.log('Profile found, onboarding_complete:', profile.onboarding_complete);
            // Profile exists - check onboarding status
            // if they've completed onboarding
            if (request.nextUrl.pathname === '/portal/onboarding' && profile.onboarding_complete) {
                const url = request.nextUrl.clone()
                url.pathname = '/portal/dashboard'
                console.log('Onboarding complete, redirecting to dashboard');
                return NextResponse.redirect(url)
            }

            // If the profile exists but onboarding is not complete, redirect them.
            if (!profile.onboarding_complete && request.nextUrl.pathname !== '/portal/onboarding') {
                const url = request.nextUrl.clone()
                url.pathname = '/portal/onboarding'
                console.log('Onboarding not complete, redirecting to onboarding');
                return NextResponse.redirect(url)
            }
        }

        console.log('No redirect needed, continuing to:', request.nextUrl.pathname);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}