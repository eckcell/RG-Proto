import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/logos");

/**
 * Optimizes and saves an uploaded logo.
 * Resizes to max 400px width/height while maintaining aspect ratio.
 */
export async function optimizeAndSaveLogo(
  file: File,
  insurerId: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `logo_${insurerId}_${Date.now()}.webp`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Ensure directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  await sharp(buffer)
    .resize(400, 400, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/uploads/logos/${fileName}`;
}
