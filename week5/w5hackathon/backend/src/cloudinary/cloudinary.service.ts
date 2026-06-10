import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'car-auction' },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f)));
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
