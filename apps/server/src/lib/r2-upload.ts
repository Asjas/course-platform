import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "~/config.js";
import { ONE_HOUR } from "~/lib/constants.js";

const s3Client = new S3Client({
  region: "auto",
  endpoint: config.R2_ENDPOINT,
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

interface GeneratePresignedUrlInput {
  key: string;
  contentType?: string;
}

export async function generatePresignedUploadUrl({
  key,
  contentType,
}: GeneratePresignedUrlInput): Promise<{
  presignedUrl: string;
  publicUrl: string;
}> {
  const command = new PutObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: ONE_HOUR,
  });

  const publicUrl = `${config.R2_PUBLIC_URL}/${key}`;

  return { presignedUrl, publicUrl };
}
