"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import {
  Copy,
  Download,
  ExternalLink,
  Check,
  AlertTriangle,
  FileCheck2,
  Image as ImageIcon,
} from "lucide-react";
import { buildPostCaption } from "@/lib/facebook";

interface ManualActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  onMarkAsDone?: (jobId: string) => void;
}

export function ManualActionModal({
  isOpen,
  onClose,
  job,
  onMarkAsDone,
}: ManualActionModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  const post = job.post;
  const destination = job.destination;
  const imageUrls = post?.postMedias?.map((pm: any) => pm.media.fileUrl) || [];

  const fullCaption = buildPostCaption(
    post?.content || "",
    post?.contactInfo,
    post?.linkUrl
  );

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(fullCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Lỗi copy clipboard:", err);
    }
  };

  const handleDownloadImages = () => {
    imageUrls.forEach((url: string, index: number) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `fb-post-image-${index + 1}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleOpenGroup = () => {
    const groupUrl = destination.linkUrl || `https://facebook.com/groups/${destination.platformId}`;
    window.open(groupUrl, "_blank", "noopener,noreferrer");
  };

  const handleConfirmDone = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs/manual-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) {
        if (onMarkAsDone) onMarkAsDone(job.id);
        onClose();
      }
    } catch (err) {
      console.error("Lỗi đánh dấu hoàn thành:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hỗ trợ đăng bài Group Facebook" maxWidth="xl">
      <div className="space-y-5">
        {/* Banner thông báo theo đúng yêu cầu */}
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
              Group này không hỗ trợ đăng tự động bằng API hiện tại.
            </h4>
            <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
              Theo chính sách chính thức của Meta (Graph API v19.0+), tính năng đăng tự động vào Group đã bị hạn chế để bảo vệ người dùng.
              Hệ thống cung cấp trợ lý 3 bước dưới đây để bạn đăng nhanh vào <strong>{destination.name}</strong> trong vài giây:
            </p>
          </div>
        </div>

        {/* Nội dung bài viết preview */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nội dung đã chuẩn bị sẵn
          </label>
          <div className="max-h-48 overflow-y-auto p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
            {fullCaption}
          </div>
        </div>

        {/* Hình ảnh đính kèm */}
        {imageUrls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hình ảnh đính kèm ({imageUrls.length})
              </label>
              <button
                type="button"
                onClick={handleDownloadImages}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tất cả ảnh</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {imageUrls.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={url}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={url}
                    download={`fb-img-${idx + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white"
                    title="Tải ảnh này"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Nút chức năng chính theo đúng đề bài */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyContent}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm border ${
              copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Content</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadImages}
            disabled={imageUrls.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Images</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGroup}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Group</span>
          </button>
        </div>

        {/* Đánh dấu hoàn thành */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Sau khi đăng xong trên Facebook, bấm nút bên phải để lưu trạng thái:
          </span>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmDone}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{isSubmitting ? "Đang lưu..." : "Đã đăng thủ công"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
