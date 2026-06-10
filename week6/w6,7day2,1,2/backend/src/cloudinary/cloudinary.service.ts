import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<Pick<UploadApiResponse, 'public_id' | 'secure_url'>> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        },
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  }
}
