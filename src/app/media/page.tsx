"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Upload,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  PenSquare,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function MediaPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  const fetchMedias = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const json = await res.json();
      if (json.data) setMedias(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchMedias();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setAddingUrl(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: urlInput.trim() }),
      });
      if (res.ok) {
        setUrlInput("");
        fetchMedias();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingUrl(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <span>Thư viện Media & Hình ảnh</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kho lưu trữ hình ảnh sản phẩm, banner quảng cáo sẵn sàng để đính kèm vào bài đăng Facebook.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchMedias}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Đang tải ảnh..." : "Tải ảnh từ máy"}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Add via URL Form */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          Thêm ảnh bằng URL:
        </span>
        <form onSubmit={handleAddUrl} className="flex-1 flex items-center gap-2 w-full">
          <input
            type="url"
            placeholder="Dán link ảnh công khai (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
          />
          <button
            type="submit"
            disabled={addingUrl || !urlInput.trim()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shrink-0"
          >
            {addingUrl ? "Đang thêm..." : "Thêm vào thư viện"}
          </button>
        </form>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải thư viện ảnh...</span>
        </div>
      ) : medias.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Chưa có hình ảnh nào trong thư viện
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tải ảnh từ máy tính hoặc dán link ảnh để lưu trữ trong thư viện sử dụng nhiều lần.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {medias.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={m.fileUrl}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(m.fileUrl, m.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition opacity-0 group-hover:opacity-100"
                  title="Sao chép URL"
                >
                  {copiedId === m.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-3 space-y-1">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
                  {m.name || "Ảnh bài viết"}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
