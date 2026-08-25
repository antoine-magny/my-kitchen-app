import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEV_AUTO_GUEST_ATTEMPTED_COOKIE,
  GUEST_SIGN_IN_PATH,
  getUserPreferSession,
  isAnonymousUser,
  isDevAutoGuestEnabled,
} from '@/lib/auth-guest'
import { Database } from './database.types'

function redirectPreservingSession(url: URL, supabaseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url)
  const setCookies =
    typeof supabaseResponse.headers.getSetCookie === "function"
      ? supabaseResponse.headers.getSetCookie()
      : []
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      redirectResponse.headers.append("Set-Cookie", cookie)
    }
    return redirectResponse
  }
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value)
  })
  return redirectResponse
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // the first auth read. getUserPreferSession appelle getUser() en premier.
  const user = await getUserPreferSession(supabase)

  const pathname = request.nextUrl.pathname
  const isLoginRoute = pathname.startsWith('/login')
  const isAuthCallback = pathname.startsWith('/auth/')
  const isPasswordUpdate = pathname.startsWith('/nouveau-mot-de-passe')

  if (!user && !isLoginRoute && !isAuthCallback && !isPasswordUpdate) {
    const url = request.nextUrl.clone()
    const alreadyTriedAutoGuest =
      request.cookies.get(DEV_AUTO_GUEST_ATTEMPTED_COOKIE)?.value === '1'
    if (isDevAutoGuestEnabled() && !alreadyTriedAutoGuest) {
      const next = `${pathname}${request.nextUrl.search}`
      url.pathname = GUEST_SIGN_IN_PATH
      url.search = `?next=${encodeURIComponent(next)}`
      const response = redirectPreservingSession(url, supabaseResponse)
      response.cookies.set(DEV_AUTO_GUEST_ATTEMPTED_COOKIE, '1', {
        path: '/',
        maxAge: 120,
        sameSite: 'lax',
      })
      return response
    }
    url.pathname = '/login'
    return redirectPreservingSession(url, supabaseResponse)
  }

  if (user && !isAnonymousUser(user) && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return redirectPreservingSession(url, supabaseResponse)
  }

  return supabaseResponse
}
