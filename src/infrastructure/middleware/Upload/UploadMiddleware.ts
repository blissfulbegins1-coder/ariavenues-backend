import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024, // 200 KB per file
  },
});

export const uploadMiddleware = upload.any();