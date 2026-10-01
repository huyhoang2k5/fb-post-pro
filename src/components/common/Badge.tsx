import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, AlertCircle } from "lucide-react";

export type StatusType =
  | "PENDING"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED"
  | "MANUAL_ACTION_REQUIRED"
  | "CANCELLED"
  | "DRAFT"
  | "SCHEDULED"
  | "COMPLETED"
  | "PARTIALLY_FAILED"
  | "ACTIVE";

interface BadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: BadgeProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "PUBLISHED":
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{normalized === "PUBLISHED" ? "Đã đăng" : "Hoàn thành"}</span>
        </span>
      );

    case "PROCESSING":
    case "PUBLISHING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
            className
          )}
        >
          {showIcon && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <span>Đang xử lý</span>
        </span>
      );

    case "PENDING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            className
          )}
        >
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          <span>Chờ xử lý</span>
        </span>
      );

    case "SCHEDULED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
            className
          )}
        >
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          <span>Đã lên lịch</span>
        </span>
      );

    case "MANUAL_ACTION_REQUIRED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
            className
          )}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />}
          <span>Cần thao tác thủ công</span>
        </span>
      );

    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
            className
          )}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          <span>Thất bại</span>
        </span>
      );

    case "PARTIALLY_FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
            className
          )}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          <span>Lỗi một phần</span>
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
            className
          )}
        >
          <span>Đã hủy</span>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200",
            className
          )}
        >
          <span>{status}</span>
        </span>
      );
  }
}
