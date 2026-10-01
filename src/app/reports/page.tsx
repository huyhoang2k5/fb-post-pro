"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flag,
  Users,
  Layers,
  FileText,
  PieChart,
} from "lucide-react";

export default function ReportsPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.stats) setStats(json.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalJobs = stats?.totalJobs || 0;
  const published = stats?.jobStatuses?.PUBLISHED || 0;
  const manual = stats?.jobStatuses?.MANUAL_ACTION_REQUIRED || 0;
  const failed = stats?.jobStatuses?.FAILED || 0;
  const pending = (stats?.jobStatuses?.PENDING || 0) + (stats?.jobStatuses?.PROCESSING || 0);

  const pubPct = totalJobs > 0 ? Math.round((published / totalJobs) * 100) : 0;
  const manualPct = totalJobs > 0 ? Math.round((manual / totalJobs) * 100) : 0;
  const failPct = totalJobs > 0 ? Math.round((failed / totalJobs) * 100) : 0;
  const pendPct = Math.max(0, 100 - pubPct - manualPct - failPct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            <span>Báo cáo & Phân tích Hiệu suất</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng quan tỷ lệ đăng bài thành công, phân bố đích đến (Page/Group) và năng suất phân phối nội dung.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary-600" : ""}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tỷ lệ Đăng thành công tự động
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">
              {stats?.successRate ?? 100}%
            </span>
            <span className="text-xs text-slate-400">
              {published} / {totalJobs} jobs
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Các bài viết được Meta Graph API xác nhận thành công và có Post ID công khai.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Phân bố Đích đến hoạt động
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-primary-600">
              {stats?.destinations?.total ?? 0}
            </span>
            <span className="text-xs text-slate-400">
              {stats?.destinations?.totalPages ?? 0} Page · {stats?.destinations?.totalGroups ?? 0} Group
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Tổng số Trang và Nhóm được đồng bộ từ tài khoản Facebook người dùng.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng số bài viết đã tạo
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats?.totalPosts ?? 0}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {stats?.publishedPosts ?? 0} hoàn thành toàn bộ
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Mỗi bài đăng có thể sinh ra hàng chục tiến trình phân phối tương ứng.
          </p>
        </div>
      </div>

      {/* Visual Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary-600" />
              <span>Phân bố trạng thái Jobs</span>
            </h3>
            <span className="text-xs text-slate-400">Tổng: {totalJobs} jobs</span>
          </div>

          {/* Segmented Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${pubPct}%` }} className="bg-emerald-500" title={`Đã đăng: ${pubPct}%`} />
            <div style={{ width: `${manualPct}%` }} className="bg-purple-500" title={`Thủ công: ${manualPct}%`} />
            <div style={{ width: `${failPct}%` }} className="bg-rose-500" title={`Thất bại: ${failPct}%`} />
            <div style={{ width: `${pendPct}%` }} className="bg-amber-400" title={`Đang chờ: ${pendPct}%`} />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Đã đăng (PUBLISHED)</span>
              </span>
              <div className="flex items-baseline justify-between font-bold">
                <span className="text-lg text-emerald-700 dark:text-emerald-300">{published}</span>
                <span className="text-xs text-slate-400">{pubPct}%</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Trợ lý Group (MANUAL)</span>
              </span>
              <div className="flex items-baseline justify-between font-bold">
                <span className="text-lg text-purple-700 dark:text-purple-300">{manual}</span>
                <span className="text-xs text-slate-400">{manualPct}%</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Thất bại (FAILED)</span>
              </span>
              <div className="flex items-baseline justify-between font-bold">
                <span className="text-lg text-rose-700 dark:text-rose-300">{failed}</span>
                <span className="text-xs text-slate-400">{failPct}%</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Đang chờ / Đặt lịch</span>
              </span>
              <div className="flex items-baseline justify-between font-bold">
                <span className="text-lg text-amber-700 dark:text-amber-300">{pending}</span>
                <span className="text-xs text-slate-400">{pendPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page vs Group Insights */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-600" />
              <span>Cơ chế tuân thủ Meta Graph API</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
                  <Flag className="w-4 h-4 text-blue-600" />
                  <span>Facebook Pages ({stats?.destinations?.totalPages ?? 0} trang)</span>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                  Đăng tự động 100% qua endpoint <code className="font-mono">/{'{page-id}'}/photos</code> và <code className="font-mono">/{'{page-id}'}/feed</code> với Page Access Token độc lập.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Facebook Groups ({stats?.destinations?.totalGroups ?? 0} nhóm)</span>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-[11px] leading-relaxed">
                  Meta Graph API v19.0+ đã deprecated quyền đăng trực tiếp vào Group cho bên thứ ba. Hệ thống xử lý chuyển sang trạng thái <strong>MANUAL_ACTION_REQUIRED</strong> kèm trợ lý sao chép và mở nhóm tức thời.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
            💡 <strong>Mẹo Sale/Marketing:</strong> Giữ khoảng cách tối thiểu 2-5 giây giữa các lần đăng để bảo vệ Page khỏi bị thuật toán chống spam của Meta tạm khóa.
          </div>
        </div>
      </div>
    </div>
  );
}
