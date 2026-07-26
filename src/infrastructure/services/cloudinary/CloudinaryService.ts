import { v2 as cloudinary } from "cloudinary";
import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from "@/config/env";

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: CLOUD_API_KEY,
      api_secret: CLOUD_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer, originalname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const sanitizedName = originalname.replace(/[^a-zA-Z0-9]/g, "_");
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "auditoriums",
          public_id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${sanitizedName}`,
          resource_type: "image",
          format: "webp",
          transformation: [
            { width: 1200, height: 800, crop: "limit", quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (result) {
            return resolve(result.secure_url);
          }
          return reject(new Error("Cloudinary upload returned no result"));
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map((file) =>
      this.uploadBuffer(file.buffer, file.originalname || "image"),
    );
    return Promise.all(uploadPromises);
  }
}
