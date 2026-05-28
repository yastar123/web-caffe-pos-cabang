import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/upload/image", requireAuth, async (req, res): Promise<void> => {
  const { url, folder } = req.body;
  if (!url) { res.status(400).json({ error: "url required" }); return; }

  const result = await cloudinary.uploader.upload(url, {
    folder: folder ?? "pos-kafe",
  });

  res.json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
});

export default router;
