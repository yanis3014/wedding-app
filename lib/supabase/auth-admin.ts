import { redirect } from 'next/navigation'
import { createClient } from './server'

export async function requireAdminAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/connexion')
  }
  
  const role = user.user_metadata?.role
  
  if (role !== 'admin') {
    redirect('/')
  }
  
  return user
}
