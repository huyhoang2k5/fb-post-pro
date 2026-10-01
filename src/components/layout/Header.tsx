"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Plus, Share2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [fbStatus, setFbStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFbStatus = async () => {
    try {
      const res = await fetch("/api/facebook/status");
      const data = await res.json();
      setFbStatus(data);
    } catch (err) {
      console.error("Lỗi lấy trạng thái FB:", err);
    }
  };

  useEffect(() => {
    fetchFbStatus();
  }, []);

  const handleTriggerQueue = async () => {
    setLoading(true);
    try {
      await fetch("/api/worker/trigger", { method: "POST" });
      await fetchFbStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Hệ thống Quản lý Đăng bài Facebook Sale/Marketing
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Trigger worker / scan status */}
        <button
          type="button"
          onClick={handleTriggerQueue}
          disabled={loading}
          title="Quét và kiểm tra hàng đợi đăng bài"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
        </button>

        {/* Facebook Connection Status Pill */}
        {fbStatus?.connected ? (
          <Link
            href="/connections"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-300 truncate max-w-[120px] sm:max-w-[180px]">
              {fbStatus.connection.fbName}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hidden md:inline">
              ({fbStatus.stats.totalPages} Pages, {fbStatus.stats.totalGroups} Groups)
            </span>
          </Link>
        ) : (
          <Link
            href="/connections"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition text-xs font-semibold"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Kết nối Facebook</span>
          </Link>
        )}

        {/* Quick Post Button */}
        <Link
          href="/create-post"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-primary-500/20 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo bài đăng</span>
        </Link>
      </div>
    </header>
  );
}
