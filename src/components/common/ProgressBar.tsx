import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  total: number;
  published: number;
  manualRequired?: number;
  failed?: number;
  pending?: number;
  className?: string;
  showLabels?: boolean;
}

export function ProgressBar({
  total,
  published,
  manualRequired = 0,
  failed = 0,
  pending = 0,
  className,
  showLabels = true,
}: ProgressBarProps) {
  if (total === 0) return null;

  const publishedPercent = Math.round((published / total) * 100);
  const manualPercent = Math.round((manualRequired / total) * 100);
  const failedPercent = Math.round((failed / total) * 100);
  const pendingPercent = Math.max(0, 100 - publishedPercent - manualPercent - failedPercent);

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
        {publishedPercent > 0 && (
          <div
            style={{ width: `${publishedPercent}%` }}
            className="bg-emerald-500 transition-all duration-500 ease-out"
            title={`Đã đăng: ${published}`}
          />
        )}
        {manualPercent > 0 && (
          <div
            style={{ width: `${manualPercent}%` }}
            className="bg-purple-500 transition-all duration-500 ease-out"
            title={`Cần thao tác thủ công: ${manualRequired}`}
          />
        )}
        {failedPercent > 0 && (
          <div
            style={{ width: `${failedPercent}%` }}
            className="bg-rose-500 transition-all duration-500 ease-out"
            title={`Thất bại: ${failed}`}
          />
        )}
        {pendingPercent > 0 && (
          <div
            style={{ width: `${pendingPercent}%` }}
            className="bg-amber-400/60 dark:bg-amber-500/40 transition-all duration-500 ease-out"
            title={`Đang chờ: ${pending}`}
          />
        )}
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{published} xong</span>
            </span>
            {manualRequired > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{manualRequired} thủ công</span>
              </span>
            )}
            {failed > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{failed} lỗi</span>
              </span>
            )}
            {pending > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{pending} chờ</span>
              </span>
            )}
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {Math.round(((published + manualRequired) / total) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
