import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImages = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedDocs = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if ([...allowedImages, ...allowedDocs].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedImages = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedImages.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("resume");

export const uploadPdf = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("resume");
