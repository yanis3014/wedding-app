import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const role = session?.user?.user_metadata?.role
  const userId = session?.user?.id

  const path = request.nextUrl.pathname

  // Helper function to redirect
  const redirect = (to: string) => {
    return NextResponse.redirect(new URL(to, request.url))
  }

  // Helper to check prestataire validation status
  const getPrestataireValidation = async () => {
    if (!userId || role !== 'prestataire') return null
    
    try {
      const { data } = await supabase
        .from('prestataires')
        .select('statut_validation')
        .eq('id', userId)
        .single()
      
      return data?.statut_validation
    } catch {
      return null
    }
  }

  // AUTH PAGES (/connexion, /inscription)
  if (path === '/connexion' || path === '/inscription') {
    if (session) {
      if (role === 'client') {
        return redirect('/')
      } else if (role === 'prestataire') {
        return redirect('/pro/dashboard')
      }
    }
    return NextResponse.next()
  }

  // CLIENT PROTECTED ROUTES (/mes-demandes, /agenda, /avis, /profil)
  const clientRoutes = ['/mes-demandes', '/agenda', '/avis', '/profil']
  if (clientRoutes.some(route => path.startsWith(route))) {
    if (!session) {
      return redirect('/connexion')
    }
    
    if (role === 'prestataire') {
      return redirect('/pro/dashboard')
    }
    
    return NextResponse.next()
  }

  // PRESTATAIRE PROTECTED ROUTES (/pro/dashboard, /pro/profil, /pro/avis)
  const prestataireRoutes = ['/pro/dashboard', '/pro/profil', '/pro/avis']
  if (prestataireRoutes.some(route => path.startsWith(route))) {
    if (!session) {
      return redirect('/connexion')
    }
    
    if (role === 'client') {
      return redirect('/')
    }
    
    if (role === 'prestataire') {
      // For /pro/profil and /pro/avis, check validation status
      if (path === '/pro/profil' || path === '/pro/avis') {
        const validationStatus = await getPrestataireValidation()
        
        if (validationStatus !== 'valide') {
          return redirect('/pro/dashboard')
        }
      }
    }
    
    return NextResponse.next()
  }

  // All other routes (public pages like /, /prestataire/[id], etc.)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
