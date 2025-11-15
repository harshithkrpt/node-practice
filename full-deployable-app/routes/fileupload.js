const multer = require("multer");
const {Router} = require("express");
const path = require("path");
const fs = require("fs");
const {requireAuth} = require("../middlewares/auth")

const router = Router();


const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const extName = path.extname(file.originalname);
        const sanitise = `file_upload${Date.now()}-${Math.round(Math.random()*1e9)}${extName}`;
        cb(null, sanitise);
    },
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    }
});

const allowedTypes = new Set([
  "text/csv",
  "application/csv",
  "application/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/parquet",
  "application/x-parquet",
  "application/octet-stream",  // optional: keep only if you expect parquet to come as octet-stream
]);

const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.has(file.mimetype)) cb(null, true);
        else cb(new Error("Only CSV, XLSX, JSON, and Parquet files are allowed"), false);
    },
});

router.post("/upload", requireAuth ,upload.single("fileName"), (req, res) => {
      if (!req.file) return res.status(400).send('No file uploaded.');
      res.json({ message: 'Uploaded', file: req.file });
});


module.exports = router;