"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookTemplate,
  Plus,
  RefreshCw,
  Copy,
  Edit,
  Trash2,
  Check,
  PenSquare,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("PROMOTION");
  const [tags, setTags] = useState("");
  const [defaultContact, setDefaultContact] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const json = await res.json();
      if (json.data) setTemplates(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setTitle("");
    setContent("");
    setCategory("PROMOTION");
    setTags("");
    setDefaultContact("");
    setModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTemplate(t);
    setTitle(t.title);
    setContent(t.content);
    setCategory(t.category || "PROMOTION");
    setTags(t.tags || "");
    setDefaultContact(t.defaultContact || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mẫu bài viết này?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const payload = { title, content, category, tags, defaultContact };

    try {
      if (editingTemplate) {
        await fetch(`/api/templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchTemplates();
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
            <BookTemplate className="w-6 h-6 text-primary-600" />
            <span>Thư viện Mẫu bài viết Sale / Marketing</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu các cấu trúc bài viết bán hàng chuyển đổi cao, hỗ trợ biến số tự động {"{tên_sản_phẩm}"}, {"{giá}"}, {"{link}"}, {"{liên_hệ}"}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTemplates}
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
            <span>Tạo mẫu mới</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải danh sách mẫu bài...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BookTemplate className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Chưa có mẫu bài viết nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tạo mẫu bài bán hàng chuẩn để các bạn Sale có thể chèn nhanh chỉ bằng 1 cú click chuột.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            Tạo mẫu bài ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-primary-700 dark:text-primary-300 border border-blue-200 dark:border-blue-900">
                    {tmpl.category || "PROMOTION"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyContent(tmpl.content, tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Sao chép nội dung"
                    >
                      {copiedId === tmpl.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {tmpl.title}
                </h4>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-6 leading-relaxed border border-slate-100 dark:border-slate-800">
                  {tmpl.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {tmpl.tags || "Flash sale, Giảm giá"}
                </span>

                <Link
                  href="/create-post"
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Sử dụng mẫu</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD Template */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? "Cập nhật mẫu bài viết" : "Tạo mẫu bài viết mới"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tên mẫu bài viết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Mẫu Flash Sale Khẩn Cấp 24h"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Thể loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              >
                <option value="PROMOTION">Khuyến mãi / Giảm giá</option>
                <option value="FLASH_SALE">Flash Sale 24h</option>
                <option value="INTRODUCTION">Giới thiệu sản phẩm mới</option>
                <option value="REVIEW">Đánh giá / Feedback</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Thẻ tags
              </label>
              <input
                type="text"
                placeholder="sale, hot, freeship"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Nội dung mẫu (Hỗ trợ biến số) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-primary-600 font-mono">
                {"{tên_sản_phẩm}"}, {"{giá}"}, {"{link}"}, {"{liên_hệ}"}
              </span>
            </div>
            <textarea
              rows={7}
              required
              placeholder="⚡️ SĂN DEAL CỰC HOT: {tên_sản_phẩm}&#10;🔥 Giá chỉ còn: {giá}&#10;&#10;👉 Đặt hàng ngay tại: {link}&#10;📞 Hotline tư vấn: {liên_hệ}"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none font-mono text-xs leading-relaxed"
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
              {saving ? "Đang lưu..." : "Lưu mẫu bài"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
