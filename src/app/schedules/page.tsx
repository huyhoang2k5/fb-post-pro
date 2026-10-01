"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  FileText,
  Layers,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/common/Badge";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedules");
      const json = await res.json();
      if (json.data) setSchedules(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            <span>Lịch trình Đăng bài Tự động</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý các bài viết đã lên lịch xuất bản tự động trong tương lai theo múi giờ Việt Nam.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSchedules}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
          <Link
            href="/create-post"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lên lịch bài mới</span>
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải lịch đăng bài...</span>
        </div>
      ) : schedules.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Không có bài viết nào đang chờ lịch
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi tạo bài viết mới, bạn có thể chọn mục "Đặt lịch đăng" để hệ thống tự động xuất bản đúng giờ.
          </p>
          <Link
            href="/create-post"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Đặt lịch ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((sc) => {
            const isPast = new Date(sc.scheduledTime).getTime() < Date.now();
            return (
              <div
                key={sc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0 border border-indigo-100 dark:border-indigo-900">
                    <Clock className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {formatDateTime(sc.scheduledTime)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({formatRelativeTime(sc.scheduledTime)})
                      </span>
                      <StatusBadge status={isPast && sc.status === "PENDING" ? "PROCESSING" : sc.status} />
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {sc.post?.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sc.post?.jobs?.length || 0} nơi đăng (Pages & Groups)</span>
                      </span>
                      {sc.post?.campaign && (
                        <span>• Chiến dịch: {sc.post.campaign.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/posts`}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    <span>Xem bài</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
