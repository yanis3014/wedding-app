import { redirect } from 'next/navigation'
import { createClient } from './server'

export async function requireProAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/connexion')
  }
  
  // Get prestataire data with all necessary columns
  const { data: prestataireData, error } = await supabase
    .from('prestataires')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error loading prestataire data in requireProAuth:', error)
  }
  
  return { user, prestataireData }
}

export async function requireValidatedPro() {
  const { user, prestataireData } = await requireProAuth()
  
  if (!prestataireData) {
    redirect('/connexion')
  }
  
  if (prestataireData.statut_validation !== 'valide') {
    return { user, prestataireData, isValid: false }
  }
  
  return { user, prestataireData, isValid: true }
}
