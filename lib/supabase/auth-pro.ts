import { redirect } from 'next/navigation'
import { createClient } from './server'

export async function requireProAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/pro/connexion')
  }
  
  // Get prestataire data with validation status
  const { data: prestataireData } = await supabase
    .from('prestataires')
    .select('statut_validation, nom_entreprise')
    .eq('id', user.id)
    .single()
  
  return { user, prestataireData }
}

export async function requireValidatedPro() {
  const { user, prestataireData } = await requireProAuth()
  
  if (!prestataireData) {
    redirect('/pro/connexion')
  }
  
  if (prestataireData.statut_validation !== 'valide') {
    return { user, prestataireData, isValid: false }
  }
  
  return { user, prestataireData, isValid: true }
}
