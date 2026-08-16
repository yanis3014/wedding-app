import { createClient } from './client'

export async function uploadPortfolioPhoto(file: File, userId: string) {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('portfolios')
    .upload(filePath, file)
  
  if (uploadError) {
    throw new Error(`Erreur upload: ${uploadError.message}`)
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolios')
    .getPublicUrl(filePath)
  
  // Get current max order
  const { data: existingPhotos } = await supabase
    .from('portfolio_photos')
    .select('ordre')
    .eq('prestataire_id', userId)
    .order('ordre', { ascending: false })
    .limit(1)
  
  const maxOrder = existingPhotos?.[0]?.ordre || 0
  
  // Insert into portfolio_photos table
  const { data: photoData, error: dbError } = await supabase
    .from('portfolio_photos')
    .insert({
      prestataire_id: userId,
      url: publicUrl,
      ordre: maxOrder + 1,
    })
    .select()
    .single()
  
  if (dbError) {
    // Rollback: delete from storage if DB insert fails
    await supabase.storage.from('portfolios').remove([filePath])
    throw new Error(`Erreur base de données: ${dbError.message}`)
  }
  
  return photoData
}

export async function deletePortfolioPhoto(photoId: string, userId: string) {
  const supabase = createClient()
  
  // Get photo data to extract file path
  const { data: photo, error: fetchError } = await supabase
    .from('portfolio_photos')
    .select('url')
    .eq('id', photoId)
    .eq('prestataire_id', userId)
    .single()
  
  if (fetchError || !photo) {
    throw new Error('Photo non trouvée')
  }
  
  // Extract file path from URL
  const urlParts = photo.url.split('/')
  const filePath = `${userId}/${urlParts[urlParts.length - 1]}`
  
  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('portfolios')
    .remove([filePath])
  
  if (storageError) {
    console.error('Erreur suppression Storage:', storageError)
  }
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('portfolio_photos')
    .delete()
    .eq('id', photoId)
    .eq('prestataire_id', userId)
  
  if (dbError) {
    throw new Error(`Erreur suppression base: ${dbError.message}`)
  }
  
  return true
}

export async function getPortfolioPhotos(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('prestataire_id', userId)
    .order('ordre', { ascending: true })
  
  if (error) {
    throw new Error(`Erreur chargement photos: ${error.message}`)
  }
  
  return data || []
}
