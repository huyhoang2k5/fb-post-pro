import fs from "fs";
import path from "path";
import axios from "axios";

export interface UploadResult {
  fileUrl: string;
  publicId?: string;
  fileSize?: number;
  fileType: string;
  name: string;
}

/**
 * Xử lý lưu trữ file media (Cloudinary hoặc Local /public/uploads)
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Nếu người dùng đã cấu hình Cloudinary: Upload lên Cloudinary
  if (cloudName && apiKey && apiSecret) {
    try {
      const base64Data = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      const timestamp = Math.round(new Date().getTime() / 1000);

      // Simple direct upload to Cloudinary API
      const formData = new URLSearchParams();
      formData.append("file", base64Data);
      formData.append("upload_preset", "ml_default"); // Hoặc dùng signature nếu cần

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      return {
        fileUrl: uploadRes.data.secure_url,
        publicId: uploadRes.data.public_id,
        fileSize: uploadRes.data.bytes,
        fileType: mimeType,
        name: fileName,
      };
    } catch (err: any) {
      console.warn("Lỗi upload Cloudinary, fallback sang lưu local:", err.message);
    }
  }

  // Fallback: Lưu vào thư mục /public/uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeExt = path.extname(fileName) || (mimeType.includes("png") ? ".png" : ".jpg");
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${safeExt}`;
  const filePath = path.join(uploadDir, uniqueName);

  fs.writeFileSync(filePath, fileBuffer);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const fileUrl = `${baseUrl}/uploads/${uniqueName}`;

  return {
    fileUrl,
    fileSize: fileBuffer.length,
    fileType: mimeType,
    name: fileName,
  };
}
