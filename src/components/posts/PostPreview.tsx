"use client";

import React from "react";
import { ThumbsUp, MessageCircle, Share2, Globe, MoreHorizontal } from "lucide-react";
import { buildPostCaption } from "@/lib/facebook";

interface PostPreviewProps {
  pageName?: string;
  avatarUrl?: string;
  title: string;
  content: string;
  imageUrls: string[];
  linkUrl?: string;
  contactInfo?: string;
}

export function PostPreview({
  pageName = "Trang Bán Hàng & Marketing",
  avatarUrl,
  title,
  content,
  imageUrls = [],
  linkUrl,
  contactInfo,
}: PostPreviewProps) {
  const fullCaption = buildPostCaption(content || "Nội dung bài viết sẽ hiển thị tại đây...", contactInfo, linkUrl);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={pageName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm">
                {pageName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:underline cursor-pointer">
              {pageName}
            </h5>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Vừa xong</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Title & Body */}
      <div className="px-3.5 pb-3 space-y-1">
        {title && (
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {title}
          </h4>
        )}
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {fullCaption}
        </p>
      </div>

      {/* Image Gallery */}
      {imageUrls.length > 0 && (
        <div className="w-full bg-black/5 dark:bg-black/20 border-y border-slate-100 dark:border-slate-800 overflow-hidden">
          {imageUrls.length === 1 && (
            <img
              src={imageUrls[0]}
              alt="Ảnh bài đăng"
              className="w-full max-h-96 object-cover"
            />
          )}

          {imageUrls.length === 2 && (
            <div className="grid grid-cols-2 gap-0.5">
              <img
                src={imageUrls[0]}
                alt="Ảnh 1"
                className="w-full h-64 object-cover"
              />
              <img
                src={imageUrls[1]}
                alt="Ảnh 2"
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {imageUrls.length === 3 && (
            <div className="grid grid-cols-2 gap-0.5">
              <img
                src={imageUrls[0]}
                alt="Ảnh 1"
                className="w-full h-64 object-cover row-span-2"
              />
              <div className="flex flex-col gap-0.5">
                <img
                  src={imageUrls[1]}
                  alt="Ảnh 2"
                  className="w-full h-32 object-cover"
                />
                <img
                  src={imageUrls[2]}
                  alt="Ảnh 3"
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
          )}

          {imageUrls.length >= 4 && (
            <div className="grid grid-cols-2 gap-0.5">
              {imageUrls.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Ảnh ${i + 1}`}
                  className="w-full h-32 object-cover"
                />
              ))}
              <div className="relative h-32">
                <img
                  src={imageUrls[3]}
                  alt="Ảnh 4"
                  className="w-full h-full object-cover"
                />
                {imageUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                    +{imageUrls.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Link Card nếu có */}
      {linkUrl && imageUrls.length === 0 && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="block border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 hover:bg-slate-100 transition"
        >
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            {new URL(linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`).hostname}
          </span>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {linkUrl}
          </span>
        </a>
      )}

      {/* Facebook Actions */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-slate-600 dark:text-slate-400 text-xs font-medium">
        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <ThumbsUp className="w-4 h-4" />
          <span>Thích</span>
        </button>
        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <MessageCircle className="w-4 h-4" />
          <span>Bình luận</span>
        </button>
        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
}
