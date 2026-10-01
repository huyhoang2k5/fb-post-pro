"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  Clock,
  AlertTriangle,
  Layers,
  TrendingUp,
  Plus,
  RefreshCw,
  Share2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Package,
  Megaphone,
} from "lucide-react";
import { StatusBadge } from "@/components/common/Badge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { JobLogDrawer } from "@/components/posts/JobLogDrawer";
import { ManualActionModal } from "@/components/facebook/ManualActionModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [manualJob, setManualJob] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.stats) {
        setStats(json.stats);
      }
    } catch (err) {
      console.error("Lỗi lấy stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Tự động cập nhật mỗi 10 giây
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-primary-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Meta Official Graph API v20.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản trị Đăng bài Đa kênh Facebook
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Đăng đồng loạt tới nhiều Facebook Page & Group, quản lý chiến dịch sản phẩm, theo dõi trạng thái từng job và lưu trữ lịch sử minh bạch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/create-post"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary-700 font-bold text-sm shadow-lg shadow-black/10 hover:bg-blue-50 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết mới</span>
          </Link>
          <Link
            href="/connections"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Kết nối Meta OAuth</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng bài đăng</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {stats?.totalPosts ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {stats?.publishedPosts ?? 0} hoàn thành
            </span>
          </div>
        </div>

        {/* Total Jobs Dispatched */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tiến trình (Jobs)</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {stats?.totalJobs ?? 0}
            </span>
            <span className="text-xs font-semibold text-primary-600">
              {stats?.jobStatuses?.PUBLISHED ?? 0} đã đăng
            </span>
          </div>
        </div>

        {/* Manual Required / Need Attention */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cần hỗ trợ thủ công</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {stats?.jobStatuses?.MANUAL_ACTION_REQUIRED ?? 0}
            </span>
            <span className="text-xs text-slate-400">Group API hạn chế</span>
          </div>
        </div>

        {/* Connected Destinations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Nơi đăng kết nối</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {stats?.destinations?.total ?? 0}
            </span>
            <span className="text-xs text-slate-500">
              {stats?.destinations?.totalPages ?? 0} Trang · {stats?.destinations?.totalGroups ?? 0} Nhóm
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Jobs with logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Tiến trình đăng bài gần đây
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi chi tiết kết quả từng bài đăng vào từng Page và Group
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Bài viết</th>
                  <th className="py-2.5 px-3">Nơi đăng</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentJobs?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có tiến trình đăng bài nào. Hãy bấm "Tạo bài viết mới"!
                    </td>
                  </tr>
                ) : (
                  stats?.recentJobs?.map((job: any) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100 max-w-[160px] truncate">
                        {job.post?.title}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {job.destination?.name}
                          </span>
                          <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {job.destination?.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(job.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                        {job.status === "MANUAL_ACTION_REQUIRED" && (
                          <button
                            type="button"
                            onClick={() => setManualJob(job)}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold rounded-lg hover:bg-purple-200 transition text-[11px]"
                          >
                            Trợ lý thủ công
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 transition text-[11px]"
                        >
                          Xem log
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Quick Status & Queue Info */}
        <div className="space-y-6">
          {/* Job Status Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Phân bố trạng thái Jobs
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Đã đăng thành công</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats?.jobStatuses?.PUBLISHED ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Cần thao tác thủ công</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats?.jobStatuses?.MANUAL_ACTION_REQUIRED ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Đang xử lý</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats?.jobStatuses?.PROCESSING ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Chờ xử lý / Đặt lịch</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats?.jobStatuses?.PENDING ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Thất bại</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats?.jobStatuses?.FAILED ?? 0}
                </span>
              </div>
            </div>

            {/* Overall Rate */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Tỷ lệ hoàn thành</span>
                <span className="text-primary-600">{stats?.successRate ?? 100}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats?.successRate ?? 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Background Queue Health Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                Hệ thống Background Worker
              </h4>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Hoạt động</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Động cơ xử lý:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.queueStatus?.queueEngine || "BullMQ + Redis"}
              </strong>
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              Hệ thống tự động kích hoạt tiến trình tuần tự, điều phối khoảng cách delay 2.5s để tuân thủ giới hạn tần suất đăng của Meta.
            </div>
          </div>
        </div>
      </div>

      {/* Drawers / Modals */}
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
        onMarkAsDone={() => fetchStats()}
      />
    </div>
  );
}
