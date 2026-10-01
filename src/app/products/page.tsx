"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Phone,
  PenSquare,
  Image as ImageIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [mediaUrls, setMediaUrls] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.data) setProducts(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setPrice("");
    setOriginalPrice("");
    setDescription("");
    setLinkUrl("");
    setContactInfo("");
    setMediaUrls("");
    setStatus("ACTIVE");
    setModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku || "");
    setPrice(p.price.toString());
    setOriginalPrice(p.originalPrice ? p.originalPrice.toString() : "");
    setDescription(p.description || "");
    setLinkUrl(p.linkUrl || "");
    setContactInfo(p.contactInfo || "");
    let urls = "";
    if (p.mediaUrls) {
      try {
        const parsed = JSON.parse(p.mediaUrls);
        urls = Array.isArray(parsed) ? parsed.join("\n") : p.mediaUrls;
      } catch {
        urls = p.mediaUrls;
      }
    }
    setMediaUrls(urls);
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const parsedMediaUrls = mediaUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const payload = {
      name,
      sku,
      price,
      originalPrice,
      description,
      linkUrl,
      contactInfo,
      mediaUrls: parsedMediaUrls,
      status,
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-600" />
            <span>Quản lý Danh mục Sản phẩm</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu trữ thông tin sản phẩm, giá bán, link mua hàng và kho ảnh để tự động tạo bài đăng sale.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải danh sách sản phẩm...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thêm sản phẩm của bạn để nhân viên sale có thể tự động tạo bài viết nhanh chóng.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            Thêm sản phẩm ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            let images: string[] = [];
            if (p.mediaUrls) {
              try {
                images = JSON.parse(p.mediaUrls);
              } catch {
                images = [p.mediaUrls];
              }
            }

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {images.length > 0 && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {p.sku || "NO-SKU"}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                      {p.name}
                    </h4>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-primary-600">
                        {formatCurrency(p.price)}
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(p.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/create-post?productId=${p.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold transition"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Tạo bài viết</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal CRUD */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tên sản phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Giày Sneaker Thể Thao Nam Siêu Nhẹ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mã SKU
              </label>
              <input
                type="text"
                placeholder="SP-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Giá bán (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="350000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Giá gốc (VNĐ)
              </label>
              <input
                type="number"
                placeholder="500000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mô tả ngắn sản phẩm
            </label>
            <textarea
              rows={3}
              placeholder="Chất liệu vải dệt kim thoáng khí, đế cao su êm ái chống trơn trượt..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Link mua hàng / Landing page
              </label>
              <input
                type="url"
                placeholder="https://shop.vn/san-pham"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hotline / Zalo tư vấn
              </label>
              <input
                type="text"
                placeholder="0987.654.321 (Zalo)"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Danh sách link hình ảnh (Mỗi dòng 1 link)
            </label>
            <textarea
              rows={3}
              placeholder="https://images.unsplash.com/photo-1542291026-7eec264c27ff&#10;https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111"
              value={mediaUrls}
              onChange={(e) => setMediaUrls(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow"
            >
              {saving ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
