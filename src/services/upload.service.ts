import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { s3 } from "../config/s3";

export const uploadAndCompressImage = async (file: Express.Multer.File) => {
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new AppError(
      "AWS_BUCKET_NAME is missing from your server environment variables.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  // Extract properties natively supported by the Multer incoming object
  let compressedBuffer = file.buffer;
  const finalMimeType = file.mimetype;
  const originalName = file.originalname.replace(/\s+/g, "_"); // Sanitize spacing blocks

  // Run Lossless Compression using Sharp based on structural type evaluation
  if (file.mimetype === "image/png") {
    compressedBuffer = await sharp(file.buffer)
      .png({ compressionLevel: 9, palette: true, effort: 6 })
      .toBuffer();
  } else if (file.mimetype === "image/webp") {
    compressedBuffer = await sharp(file.buffer)
      .webp({ lossless: true })
      .toBuffer();
  }

  const key = `uploads/lms/${Date.now()}-${originalName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: compressedBuffer,
    ContentType: finalMimeType,
    ACL: "public-read", // Guarantees instant browser URL read capabilities
  });

  await s3.send(command);

  return {
    publicUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};