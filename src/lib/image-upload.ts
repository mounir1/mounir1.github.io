import { getFirebaseStorage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Firebase Storage.
 * firebase/storage is lazy-loaded on first call — it never lands in the
 * synchronous entry bundle.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<UploadResult> {
  const storage = await getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete an image from Firebase Storage.
 */
export async function deleteImage(path: string): Promise<void> {
  const storage = await getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const { ref, deleteObject } = await import('firebase/storage');
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw new Error('Failed to delete image. Please try again.');
  }
}

/**
 * Upload an image with automatic path generation.
 */
export async function uploadImageAutoPath(
  file: File,
  folder: string,
  fileName?: string
): Promise<UploadResult> {
  const storage = await getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop() || 'jpg';
  const finalFileName = fileName || `${timestamp}-${randomString}.${extension}`;

  const path = `${folder}/${finalFileName}`;
  return uploadImage(file, path);
}

/**
 * Validate image file before upload.
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}
