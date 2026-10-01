"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/Badge";
import { formatDateTime } from "@/lib/utils";
import { Terminal, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";

interface JobLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onOpenManualModal?: (job: any) => void;
}

export function JobLogDrawer({
  isOpen,
  onClose,
  jobId,
  onOpenManualModal,
}: JobLogDrawerProps) {
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails(jobId);
    } else {
      setJob(null);
    }
  }, [isOpen, jobId]);

  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const json = await res.json();
      if (json.data) {
        setJob(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!jobId) return;
    setRetrying(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
      if (res.ok) {
        await fetchJobDetails(jobId);
      }
    } catch (err) {
      console.error("Lỗi retry:", err);
    } finally {
      setRetrying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết tiến trình đăng bài (Job Inspector)" maxWidth="xl">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-sm">Đang tải nhật ký chi tiết...</span>
        </div>
      ) : !job ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Không tìm thấy thông tin job này.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Nơi đăng:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {job.destination?.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">
                  {job.destination?.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bài viết: <strong>{job.post?.title}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
              {job.status === "FAILED" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="px-2.5 py-1 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
                  <span>Thử lại</span>
                </button>
              )}
            </div>
          </div>

          {/* Facebook Post Link nếu đã đăng thành công */}
          {job.fbPostId && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
              <div className="text-xs text-emerald-800 dark:text-emerald-300">
                <span>Facebook Post ID: </span>
                <code className="font-mono font-bold">{job.fbPostId}</code>
              </div>
              <a
                href={`https://facebook.com/${job.fbPostId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Xem trên Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Trợ lý thủ công nếu status là MANUAL_ACTION_REQUIRED */}
          {job.status === "MANUAL_ACTION_REQUIRED" && (
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-900 dark:text-purple-200">
                  {job.errorMessage || "Group này không hỗ trợ đăng tự động bằng API hiện tại."}
                </span>
              </div>
              {onOpenManualModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManualModal(job);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Mở Trợ lý đăng bài
                </button>
              )}
            </div>
          )}

          {/* Logs Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>Nhật ký thực thi (Audit Logs)</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
              {job.logs?.length === 0 ? (
                <div className="text-slate-500 py-4 text-center">Chưa có nhật ký ghi nhận.</div>
              ) : (
                job.logs?.map((log: any) => {
                  const levelColors: Record<string, string> = {
                    INFO: "text-blue-400",
                    WARN: "text-amber-400",
                    ERROR: "text-rose-400",
                    SUCCESS: "text-emerald-400",
                  };
                  return (
                    <div key={log.id} className="pb-2 border-b border-slate-900 last:border-none">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">
                          {formatDateTime(log.createdAt)}
                        </span>
                        <span className={`font-bold text-[11px] ${levelColors[log.level] || "text-slate-300"}`}>
                          [{log.level}]
                        </span>
                        <span className="text-slate-200 text-xs">{log.message}</span>
                      </div>
                      {log.details && (
                        <pre className="mt-1 p-2 bg-slate-900 text-slate-400 rounded text-[10px] overflow-x-auto">
                          {log.details}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
