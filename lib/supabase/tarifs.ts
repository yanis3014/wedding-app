import { createClient } from './client'

export async function createTarif(userId: string, tarif: { nom: string; description: string; prix: number }) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tarifs')
    .insert({
      prestataire_id: userId,
      nom: tarif.nom,
      description: tarif.description,
      prix: tarif.prix,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Erreur création tarif: ${error.message}`)
  }
  
  return data
}

export async function deleteTarif(tarifId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('tarifs')
    .delete()
    .eq('id', tarifId)
    .eq('prestataire_id', userId)
  
  if (error) {
    throw new Error(`Erreur suppression tarif: ${error.message}`)
  }
  
  return true
}

export async function getTarifs(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tarifs')
    .select('*')
    .eq('prestataire_id', userId)
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Erreur chargement tarifs: ${error.message}`)
  }
  
  return data || []
}
