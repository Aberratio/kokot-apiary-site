import 'server-only'
import { put } from '@vercel/blob'
import type { AdminErrorKey } from '@/i18n/admin'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
/** Stays under Vercel's 4.5 MB request cap with room for the rest of the form. */
export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024

/** Why a file cannot be a product photo, or null when it can. */
export function checkImage(file: { type: string; size: number }): AdminErrorKey | null {
  if (!EXTENSIONS[file.type]) return 'imageType'
  if (file.size > MAX_IMAGE_BYTES) return 'imageSize'
  return null
}

/** Uploads a product photo to Vercel Blob. */
export async function uploadProductImage(
  file: File,
): Promise<{ url: string } | { error: AdminErrorKey }> {
  const problem = checkImage(file)
  if (problem) return { error: problem }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { error: 'storageMissing' }
  try {
    const blob = await put(`products/photo.${EXTENSIONS[file.type]}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })
    return { url: blob.url }
  } catch (error) {
    console.error('Product photo upload failed', error)
    return { error: 'uploadFailed' }
  }
}
