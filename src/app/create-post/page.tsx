"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PenSquare,
  Sparkles,
  Package,
  Megaphone,
  Link as LinkIcon,
  Phone,
  Image as ImageIcon,
  Calendar,
  Send,
  Upload,
  X,
  Plus,
  Layers,
  HelpCircle,
} from "lucide-react";
import { DestinationSelector } from "@/components/facebook/DestinationSelector";
import { PostPreview } from "@/components/posts/PostPreview";
import { Modal } from "@/components/common/Modal";

export default function CreatePostPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  // Data sources
  const [destinations, setDestinations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // UI state
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tải dữ liệu ban đầu
  useEffect(() => {
    async function loadData() {
      try {
        const [destRes, prodRes, campRes, tempRes] = await Promise.all([
          fetch("/api/destinations"),
          fetch("/api/products"),
          fetch("/api/campaigns"),
          fetch("/api/templates"),
        ]);

        const [destData, prodData, campData, tempData] = await Promise.all([
          destRes.json(),
          prodRes.json(),
          campRes.json(),
          tempRes.json(),
        ]);

        if (destData.data) setDestinations(destData.data);
        if (prodData.data) setProducts(prodData.data);
        if (campData.data) setCampaigns(campData.data);
        if (tempData.data) setTemplates(tempData.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu khởi tạo:", err);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadData();
  }, []);

  // Khi chọn sản phẩm: tự động điền gợi ý
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      if (!title) setTitle(`[MỞ BÁN] ${prod.name}`);
      if (prod.linkUrl) setLinkUrl(prod.linkUrl);
      if (prod.contactInfo) setContactInfo(prod.contactInfo);

      // Thêm hình ảnh của sản phẩm nếu có
      if (prod.mediaUrls) {
        try {
          const urls = JSON.parse(prod.mediaUrls);
          if (Array.isArray(urls)) {
            setImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
          }
        } catch {
          // ignore parse error
        }
      }
    }
  };

  // Áp dụng mẫu bài viết (Template)
  const handleApplyTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;

    const prod = products.find((p) => p.id === selectedProductId);

    let parsedContent = tmpl.content;
    if (prod) {
      parsedContent = parsedContent
        .replace(/{tên_sản_phẩm}|{product_name}/gi, prod.name)
        .replace(/{giá}|{price}/gi, new Intl.NumberFormat("vi-VN").format(prod.price) + " đ")
        .replace(/{link}/gi, prod.linkUrl || "")
        .replace(/{liên_hệ}|{contact}/gi, prod.contactInfo || "");
    }

    setContent(parsedContent);
    if (!title && tmpl.title) setTitle(tmpl.title);
    if (tmpl.defaultContact && !contactInfo) setContactInfo(tmpl.defaultContact);
  };

  // Thêm ảnh từ URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  // Upload file ảnh trực tiếp
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.data) {
        const newUrls = data.data.map((m: any) => m.fileUrl);
        setImageUrls((prev) => [...prev, ...newUrls]);
      }
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Xóa 1 ảnh
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== indexToRemove));
  };

  // Gửi tạo bài
  const handleSubmit = async () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Vui lòng nhập nội dung bài viết.");
      return;
    }
    if (selectedDestinationIds.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất 1 Trang hoặc Nhóm để đăng bài.");
      return;
    }
    if (isScheduled && !scheduledAt) {
      setErrorMsg("Vui lòng chọn thời gian đặt lịch.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrls,
          productId: selectedProductId || undefined,
          campaignId: selectedCampaignId || undefined,
          linkUrl,
          contactInfo,
          destinationIds: selectedDestinationIds,
          isScheduled,
          scheduledAt: isScheduled ? scheduledAt : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Lỗi tạo bài đăng");
      }

      setShowConfirmModal(false);
      // Chuyển hướng tới danh sách bài đăng hoặc lịch sử
      router.push("/posts");
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi xử lý yêu cầu");
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PenSquare className="w-6 h-6 text-primary-600" />
            <span>Tạo bài đăng Facebook đa kênh</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Soạn bài viết chuẩn Meta, đính kèm đa ảnh, chọn đồng thời nhiều Trang & Nhóm để đăng ngay hoặc lên lịch.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Form Left - Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Chiến dịch & Sản phẩm & Mẫu bài */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thiết lập chiến dịch & bán hàng
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Campaign Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chiến dịch
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- Không chọn --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sản phẩm bán
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({new Intl.NumberFormat("vi-VN").format(p.price)} đ)
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mẫu bài viết sale
                </label>
                <select
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  defaultValue=""
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500"
                >
                  <option value="" disabled>
                    -- Chọn mẫu chèn --
                  </option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Tiêu đề & Nội dung */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nội dung bài viết
            </h4>

            {/* Tiêu đề */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tiêu đề bài viết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: [FLASH SALE] Siêu phẩm ra mắt - Giảm giá 30% hôm nay"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Nội dung */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {content.length} ký tự
                </span>
              </div>
              <textarea
                rows={6}
                placeholder="Nhập nội dung quảng bá, mô tả sản phẩm, ưu đãi khuyến mãi..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-sm p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
              />
            </div>

            {/* Link & Hotline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Link chi tiết / Mua hàng</span>
                </label>
                <input
                  type="url"
                  placeholder="https://yourstore.vn/san-pham"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thông tin liên hệ (Hotline / Zalo)</span>
                </label>
                <input
                  type="text"
                  placeholder="0987.654.321 (Zalo / Hotline)"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Nhiều hình ảnh */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary-600" />
                <span>Nhiều hình ảnh đính kèm ({imageUrls.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Meta tự động bố cục album đa ảnh
              </span>
            </div>

            {/* Input URL hoặc Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="url"
                  placeholder="Dán link ảnh trực tiếp (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImageUrl())}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Thêm link
              </button>

              <label className="w-full sm:w-auto px-4 py-2.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900 hover:bg-primary-100 text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? "Đang tải..." : "Tải ảnh từ máy"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image List Preview */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-80 group-hover:opacity-100 hover:bg-rose-700 transition"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Chọn nhiều Destination (Page / Group) */}
          <DestinationSelector
            destinations={destinations}
            selectedIds={selectedDestinationIds}
            onChange={setSelectedDestinationIds}
            loading={loadingDestinations}
          />

          {/* Section 5: Đăng ngay hoặc Đặt lịch */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thời gian xuất bản
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setIsScheduled(false)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  !isScheduled
                    ? "border-primary-600 bg-primary-50/40 dark:bg-primary-950/20 text-primary-900 dark:text-primary-100 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isScheduled ? "border-primary-600" : "border-slate-300"}`}>
                  {!isScheduled && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                </div>
                <div>
                  <span className="text-sm block font-bold">Đăng ngay lập tức</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Tạo các jobs và thực thi tự động qua hàng đợi ngay
                  </span>
                </div>
              </label>

              <label
                onClick={() => setIsScheduled(true)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  isScheduled
                    ? "border-primary-600 bg-primary-50/40 dark:bg-primary-950/20 text-primary-900 dark:text-primary-100 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isScheduled ? "border-primary-600" : "border-slate-300"}`}>
                  {isScheduled && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                </div>
                <div>
                  <span className="text-sm block font-bold">Đặt lịch đăng</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Chọn ngày giờ xuất bản tự động trong tương lai
                  </span>
                </div>
              </label>
            </div>

            {isScheduled && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn ngày & giờ đăng (Múi giờ Asia/Ho_Chi_Minh)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/posts")}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/25 flex items-center gap-2 transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>
                {isScheduled
                  ? `Lên lịch đăng (${selectedDestinationIds.length} nơi)`
                  : `Đăng ngay (${selectedDestinationIds.length} nơi)`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Preview: 5 cols */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Xem trước bài viết trên Facebook</span>
            </h4>
            <span className="text-[11px] text-slate-400">Giao diện chuẩn Newsfeed</span>
          </div>

          <div className="flex justify-center">
            <PostPreview
              title={title}
              content={content}
              imageUrls={imageUrls}
              linkUrl={linkUrl}
              contactInfo={contactInfo}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác nhận xuất bản bài đăng"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2 text-xs">
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Hệ thống sẽ tạo <strong>{selectedDestinationIds.length} jobs riêng biệt</strong> để theo dõi tiến trình từng nơi đăng:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
              <li>Tiêu đề: <strong>{title}</strong></li>
              <li>Hình ảnh: <strong>{imageUrls.length} ảnh</strong></li>
              <li>Số lượng nơi đăng: <strong>{selectedDestinationIds.length} Pages / Groups</strong></li>
              <li>
                Thời gian: <strong>{isScheduled ? `Lên lịch lúc ${scheduledAt}` : "Đăng ngay lập tức"}</strong>
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Mỗi job sẽ được lưu nhật ký (audit log) độc lập. Nếu một Group Meta API không hỗ trợ tự động, hệ thống sẽ tự động bật trợ lý 3 bước để bạn đăng thủ công mà không làm gián đoạn các Page khác.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Xem lại
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmPublish}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              {submitting ? "Đang khởi tạo jobs..." : "Xác nhận & Khởi tạo"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
