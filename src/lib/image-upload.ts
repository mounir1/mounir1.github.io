import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path where to upload the file
 * @returns Promise resolving to the download URL and storage path
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<UploadResult> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
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
 * Delete an image from Firebase Storage
 * @param path The storage path of the file to delete
 */
export async function deleteImage(path: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw new Error('Failed to delete image. Please try again.');
  }
}

/**
 * Upload an image with automatic path generation
 * @param file The file to upload
 * @param folder The folder name in storage (e.g., 'projects', 'skills')
 * @param fileName Optional custom file name
 * @returns Promise resolving to the download URL and storage path
 */
export async function uploadImageAutoPath(
  file: File,
  folder: string,
  fileName?: string
): Promise<UploadResult> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  // Generate a unique file name if not provided
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop() || 'jpg';
  const finalFileName = fileName || `${timestamp}-${randomString}.${extension}`;

  const path = `${folder}/${finalFileName}`;
  return uploadImage(file, path);
}

/**
 * Validate image file before upload
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB (default: 5MB)
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}
