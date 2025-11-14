/**
 * Resize and optimize images for icons
 * Automatically handles aspect ratio and creates square thumbnails
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export const resizeImage = (
  file: File,
  options: ResizeOptions = {}
): Promise<string> => {
  const {
    maxWidth = 128,
    maxHeight = 128,
    quality = 0.9,
    format = 'png'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions (square, centered crop)
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Set canvas size
        canvas.width = Math.min(maxWidth, size);
        canvas.height = Math.min(maxHeight, size);

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image (cropped and resized)
        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,  // Source rectangle
          0, 0, canvas.width, canvas.height  // Destination rectangle
        );

        // Convert to data URL
        const mimeType = format === 'png' ? 'image/png' : 
                        format === 'webp' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 5MB'
    };
  }

  return { valid: true };
};

/**
 * Create a thumbnail preview
 */
export const createThumbnail = async (
  file: File,
  size: number = 64
): Promise<string> => {
  return resizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8
  });
};
