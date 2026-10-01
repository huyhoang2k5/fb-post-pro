import { NextResponse } from "next/server";
import { uploadMediaFile } from "@/lib/storage";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      // Kiểm tra file đơn
      const singleFile = formData.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
      }
    }

    const uploadedResults = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue; // Chỉ xử lý hình ảnh
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await uploadMediaFile(buffer, file.name, file.type);

      // Lưu vào bảng Media trong database
      const media = await prisma.media.create({
        data: {
          userId: user.id,
          name: file.name,
          fileUrl: uploadRes.fileUrl,
          fileType: uploadRes.fileType,
          fileSize: uploadRes.fileSize,
          publicId: uploadRes.publicId,
        },
      });

      uploadedResults.push(media);
    }

    return NextResponse.json({
      success: true,
      data: uploadedResults,
      count: uploadedResults.length,
    });
  } catch (err: any) {
    console.error("Lỗi upload file media:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi tải ảnh lên hệ thống" },
      { status: 500 }
    );
  }
}
