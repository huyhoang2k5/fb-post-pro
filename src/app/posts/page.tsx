"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Layers,
  Clock,
  Send,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/common/Badge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";
import { JobLogDrawer } from "@/components/posts/JobLogDrawer";
import { ManualActionModal } from "@/components/facebook/ManualActionModal";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [manualJob, setManualJob] = useState<any | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      if (json.data) {
        setPosts(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này cùng toàn bộ jobs liên quan?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
        if (selectedPost?.id === id) {
          setDetailModalOpen(false);
          setSelectedPost(null);
        }
      }
    } catch (err) {
      console.error("Lỗi xóa bài:", err);
    }
  };

  const handleOpenPostDetails = (post: any) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            <span>Quản lý danh sách Bài đăng</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi tiến độ phân phối bài viết đa kênh, chi tiết từng destination và nhật ký đăng.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPosts}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
          <Link
            href="/create-post"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết mới</span>
          </Link>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải danh sách bài viết...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-primary-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Chưa có bài đăng nào
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bắt đầu tạo bài viết đầu tiên để xuất bản đồng loạt lên các Facebook Pages và Groups của bạn.
            </p>
          </div>
          <Link
            href="/create-post"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const stats = post.stats;
            const images = post.postMedias?.map((pm: any) => pm.media.fileUrl) || [];

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      {post.campaign && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
                          {post.campaign.name}
                        </span>
                      )}
                      {post.product && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          Sản phẩm: {post.product.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        • {formatDateTime(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenPostDetails(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết {stats.totalJobs} jobs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails + Progress Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Images Thumbnails */}
                  <div className="flex items-center gap-2 shrink-0">
                    {images.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {images.slice(0, 4).map((url: string, i: number) => (
                          <div
                            key={i}
                            className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100"
                          >
                            <img src={url} alt={`Ảnh ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {images.length > 4 && (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600">
                            +{images.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Bài viết dạng văn bản / Link</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar across jobs */}
                  <div className="flex-1 max-w-md">
                    <ProgressBar
                      total={stats.totalJobs}
                      published={stats.published}
                      manualRequired={stats.manualRequired}
                      failed={stats.failed}
                      pending={stats.pending}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail & Jobs Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedPost ? `Tiến trình bài: ${selectedPost.title}` : "Chi tiết bài đăng"}
        maxWidth="2xl"
      >
        {selectedPost && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Trạng thái tổng:</span>
                <StatusBadge status={selectedPost.status} />
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {selectedPost.content}
              </p>
            </div>

            {/* List of Destination Jobs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Danh sách Jobs ({selectedPost.jobs?.length} nơi đăng)</span>
                <span className="text-[11px] font-normal lowercase">Click xem log hoặc trợ lý</span>
              </h4>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                {selectedPost.jobs?.map((job: any) => (
                  <div
                    key={job.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                        {job.destination?.avatarUrl ? (
                          <img
                            src={job.destination.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                            {job.destination?.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block">
                          {job.destination?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {job.destination?.type} • ID: {job.destination?.platformId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={job.status} />

                      {job.status === "MANUAL_ACTION_REQUIRED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetailModalOpen(false);
                            setManualJob({ ...job, post: selectedPost });
                          }}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                        >
                          Trợ lý Group
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobId(job.id);
                        }}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-medium transition"
                      >
                        Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Inspector Drawers */}
      <JobLogDrawer
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
        jobId={selectedJobId}
        onOpenManualModal={(job) => setManualJob(job)}
      />

      <ManualActionModal
        isOpen={!!manualJob}
        onClose={() => setManualJob(null)}
        job={manualJob}
        onMarkAsDone={() => fetchPosts()}
      />
    </div>
  );
}
