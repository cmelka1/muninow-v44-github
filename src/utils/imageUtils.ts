/**
 * Utility functions for image optimization and handling
 */

/**
 * Compresses an image and returns a data URL
 * @param file The image file to compress
 * @param maxWidth The maximum width of the compressed image
 * @param quality The quality of the compressed image (0-1)
 * @returns A promise that resolves to the compressed image data URL
 */
export const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (readerEvent) => {
      const image = new Image();
      
      image.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;
        
        // Scale down image while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(image, 0, 0, width, height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        resolve(dataUrl);
      };
      
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Set image source to reader result
      image.src = readerEvent.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is an image
 * @param file The file to validate
 * @returns True if the file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Checks if a file exceeds a size limit
 * @param file The file to check
 * @param maxSizeBytes The maximum size in bytes
 * @returns True if the file exceeds the size limit
 */
export const exceedsMaxSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size > maxSizeBytes;
};