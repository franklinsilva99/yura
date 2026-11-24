import imageCompression from 'browser-image-compression'
import { supabase } from './supabase'

export type UploadFolder = 'plant' | 'posts' | 'avatar'

export async function uploadImage(file: File, userId: string, folder: UploadFolder) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1280,
    fileType: 'image/webp',
    useWebWorker: true,
  })
  const path = `${userId}/${folder}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage
    .from('yura')
    .upload(path, compressed, { contentType: 'image/webp' })
  if (error) throw new Error('No pudimos subir la foto. Intenta de nuevo.')
  return supabase.storage.from('yura').getPublicUrl(path).data.publicUrl
}
