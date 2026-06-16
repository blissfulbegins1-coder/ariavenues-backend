import { v2 as cloudinary } from "cloudinary";

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer, originalname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "auditoriums",
          public_id: originalname.split(".")[0] + "-" + Date.now(),
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
    const uploadPromises = files.map((file) =>
      this.uploadBuffer(file.buffer, file.originalname),
    );
    return Promise.all(uploadPromises);
  }
}
