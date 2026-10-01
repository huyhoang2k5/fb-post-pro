"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  RefreshCw,
  Search,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/common/Badge";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { JobLogDrawer } from "@/components/posts/JobLogDrawer";
import { ManualActionModal } from "@/components/facebook/ManualActionModal";

export default function HistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [manualJob, setManualJob] = useState<any | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/jobs", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (typeFilter !== "ALL") url.searchParams.set("type", typeFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.data) {
        setJobs(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, typeFilter]);

  const filteredJobs = jobs.filter((job) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const destName = job.destination?.name?.toLowerCase() || "";
    const postTitle = job.post?.title?.toLowerCase() || "";
    return destName.includes(term) || postTitle.includes(term);
  });

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error("Lỗi retry:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-primary-600" />
            <span>Lịch sử & Tiến trình đăng bài</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhật ký từng lần đăng bài, trạng thái phân phối chi tiết và các hành động hỗ trợ thủ công.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary-600" : ""}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "PUBLISHED", label: "Đã đăng" },
            { id: "MANUAL_ACTION_REQUIRED", label: "Cần thủ công" },
            { id: "FAILED", label: "Thất bại" },
            { id: "PROCESSING", label: "Đang xử lý" },
            { id: "PENDING", label: "Đang chờ" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo bài viết, Page, Group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nơi đăng (Destination)</th>
                <th className="py-3 px-4">Bài viết (Post)</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Chi tiết / Thông báo</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-600" />
                    <span>Đang tải nhật ký lịch sử...</span>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi tiến trình nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Destination */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {job.destination?.avatarUrl ? (
                            <img src={job.destination.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                              {job.destination?.name[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block max-w-[160px]">
                            {job.destination?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {job.destination?.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Post Title */}
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                      {job.post?.title}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Message / Error */}
                    <td className="py-3 px-4 max-w-[220px]">
                      {job.status === "PUBLISHED" ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-mono text-[11px]">
                          <span>ID: {job.fbPostId?.substring(0, 16)}...</span>
                        </div>
                      ) : job.errorMessage ? (
                        <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate block" title={job.errorMessage}>
                          {job.errorMessage}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDateTime(job.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      {job.status === "MANUAL_ACTION_REQUIRED" && (
                        <button
                          type="button"
                          onClick={() => setManualJob(job)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-[11px] shadow-sm"
                        >
                          Trợ lý Group
                        </button>
                      )}

                      {job.status === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => handleRetryJob(job.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition text-[11px] border border-rose-200"
                        >
                          Thử lại
                        </button>
                      )}

                      {job.fbPostId && (
                        <a
                          href={`https://facebook.com/${job.fbPostId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition text-[11px] inline-flex items-center gap-0.5"
                          title="Mở bài trên Facebook"
                        >
                          <span>Xem bài</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition text-[11px]"
                      >
                        Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawers */}
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
        onMarkAsDone={() => fetchJobs()}
      />
    </div>
  );
}
