import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Khởi tạo dữ liệu ban đầu cho FB Post Pro...");

  // 1. Tạo User Admin / Trưởng nhóm Sale
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "marketing@fbpostpro.com" },
    update: {},
    create: {
      email: "marketing@fbpostpro.com",
      name: "Trưởng nhóm Sale & Marketing",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✅ Đã tạo user: ${user.email}`);

  // 2. Tạo Mẫu bài viết Sale chuẩn
  const defaultTemplates = [
    {
      title: "Flash Sale 24h - Khuyến Mãi Sốc",
      category: "FLASH_SALE",
      tags: "flash_sale, giam_gia, freeship",
      defaultContact: "0987.654.321 (Zalo / Hotline)",
      content: `⚡️ [FLASH SALE DUY NHẤT HÔM NAY] 🔥
Siêu phẩm: {tên_sản_phẩm}
Chỉ còn: {giá} (Giá gốc cực tốt)

✨ Điểm nổi bật:
- Chất lượng cam kết chính hãng 100%
- Giao hàng hỏa tốc toàn quốc
- Kiểm tra hàng trước khi thanh toán

👉 Đặt mua ngay tại: {link}
📞 Hotline tư vấn: {liên_hệ}
Số lượng có hạn, nhanh tay kẻo lỡ!`,
    },
    {
      title: "Giới Thiệu Sản Phẩm Mới - Tặng Quà Khai Trương",
      category: "INTRODUCTION",
      tags: "new_arrival, quà_tặng, xu_hướng",
      defaultContact: "0987.654.321 (Zalo)",
      content: `🎉 CHÀO ĐÓN TÂN BINH: {tên_sản_phẩm} 🎉
Thiết kế thời thượng, nâng tầm trải nghiệm mỗi ngày.

💰 Mức giá trải nghiệm cực ưu đãi: {giá}
🎁 TẶNG KÈM QUÀ TRI ÂN cho 50 khách hàng đầu tiên trong tuần!

👉 Xem chi tiết và đặt cọc tại: {link}
☎️ Liên hệ ngay: {liên_hệ}`,
    },
    {
      title: "Xả Kho Cuối Tuần - Đồng Giá Cực Rẻ",
      category: "PROMOTION",
      tags: "xả_kho, cuối_tuần, freeship",
      defaultContact: "0987.654.321",
      content: `💥 SIÊU HỘI XẢ KHO CUỐI TUẦN 💥
Sản phẩm hot: {tên_sản_phẩm}
Giá sốc tận đáy: {giá}

Cam kết:
✅ Hàng chuẩn như hình 100%
✅ Đổi trả miễn phí trong 7 ngày
✅ Bảo hành chu đáo

📩 Inbox ngay hoặc gọi {liên_hệ} để giữ slot ưu đãi!
Xem tại: {link}`,
    },
  ];

  for (const tmpl of defaultTemplates) {
    const exists = await prisma.template.findFirst({
      where: { userId: user.id, title: tmpl.title },
    });
    if (!exists) {
      await prisma.template.create({
        data: {
          userId: user.id,
          title: tmpl.title,
          category: tmpl.category,
          tags: tmpl.tags,
          defaultContact: tmpl.defaultContact,
          content: tmpl.content,
        },
      });
    }
  }

  console.log(`✅ Đã khởi tạo các mẫu bài viết sale chuẩn.`);

  // 3. Tạo Chiến dịch mẫu
  const campaign = await prisma.campaign.upsert({
    where: { id: "camp-default-01" },
    update: {},
    create: {
      id: "camp-default-01",
      userId: user.id,
      name: "Chiến dịch Thu Đông 2026",
      description: "Đẩy mạnh doanh số các kênh Facebook Page và nhóm chuyên ngành thời trang",
      budget: 15000000,
      status: "ACTIVE",
    },
  });

  // 4. Tạo Sản phẩm mẫu
  const product = await prisma.product.upsert({
    where: { id: "prod-default-01" },
    update: {},
    create: {
      id: "prod-default-01",
      userId: user.id,
      name: "Giày Sneaker Thể Thao Nam Siêu Nhẹ 2026",
      sku: "SNK-2026-BLACK",
      price: 389000,
      originalPrice: 550000,
      description: "Đế cao su non êm chân, vải lưới dệt thoáng khí, thích hợp đi làm và thể thao.",
      linkUrl: "https://yourshop.vn/sneaker-2026",
      contactInfo: "0987.654.321 (Zalo)",
      mediaUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      ]),
      status: "ACTIVE",
    },
  });

  console.log("🎉 Hoàn tất Seed dữ liệu ban đầu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
