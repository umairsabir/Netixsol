import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config';
import streamifier from 'streamifier';

// Cloudinary is configured via environment variables automatically
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: (config as any).cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: (config as any).cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
  api_secret: (config as any).cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 */
export const uploadImage = (buffer: Buffer, folder = 'ott/posters'): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 800, height: 1200, crop: 'fill', quality: 'auto' }],
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Upload a video buffer to Cloudinary.
 * Returns the secure_url for direct MP4 delivery and optionally HLS format.
 */
export const uploadVideo = (buffer: Buffer, folder = 'ott/videos'): Promise<{ secure_url: string; public_id: string; hlsUrl: string | null; duration: number | null }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'video',
        chunk_size: 6_000_000, // 6MB chunks for large files
        eager: CLOUDINARY_CONFIG.video_eager,
        eager_async: true,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error('No result from Cloudinary'));

        // HLS URL if eager transformation was requested
        const hlsUrl = result.eager?.[0]?.secure_url || null;

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          hlsUrl,
          duration: result.duration ? Math.round(result.duration) : null,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const CLOUDINARY_CONFIG = {
  video_folder: 'ott/videos',
  image_folder: 'ott/posters',
  video_eager: 'sp_hd/m3u8',
};

/**
 * Generate a signature for a signed upload to Cloudinary
 */
export const generateSignature = (params: any): { signature: string; timestamp: number } => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    cloudinary.config().api_secret!
  );
  return { signature, timestamp };
};

/**
 * Delete any Cloudinary asset by public_id
 */
export const deleteAsset = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
