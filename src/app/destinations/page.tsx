"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Flag,
  Users,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PAGE" | "GROUP">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/destinations");
      const json = await res.json();
      if (json.data) {
        setDestinations(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách đích đến:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/facebook/sync", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        await fetchDestinations();
      } else {
        setMessage(json.error || "Lỗi đồng bộ");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const filtered = destinations.filter((dest) => {
    const matchType = typeFilter === "ALL" || dest.type === typeFilter;
    const matchSearch =
      !searchTerm.trim() ||
      dest.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" />
            <span>Quản lý Pages & Groups Facebook</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Danh sách các Trang và Nhóm mà tài khoản Facebook của bạn có quyền quản trị hoặc thành viên.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary-600" : ""}`} />
            <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ từ Facebook"}</span>
          </button>

          <Link
            href="/create-post"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài đăng</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "ALL"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({destinations.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("PAGE")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "PAGE"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-blue-500" />
            <span>Trang ({destinations.filter((d) => d.type === "PAGE").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("GROUP")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              typeFilter === "GROUP"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>Nhóm ({destinations.filter((d) => d.type === "GROUP").length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên Trang hoặc Nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải danh sách Trang và Nhóm...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy đích đến nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy đảm bảo bạn đã kết nối tài khoản Facebook và bấm nút "Đồng bộ từ Facebook" ở góc phải.
          </p>
          <button
            type="button"
            onClick={handleSync}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            Đồng bộ ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-100 dark:border-slate-800">
                      {dest.avatarUrl ? (
                        <img src={dest.avatarUrl} alt={dest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
                          {dest.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {dest.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {dest.category || dest.type}
                      </span>
                    </div>
                  </div>

                  {dest.type === "PAGE" ? (
                    <span className="shrink-0 p-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <Flag className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 p-1.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                      <Users className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Quy mô:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                      {dest.memberCount ? dest.memberCount.toLocaleString() : "N/A"} {dest.type === "PAGE" ? "theo dõi" : "thành viên"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform ID:</span>
                    <code className="font-mono text-[10px] text-slate-600">{dest.platformId}</code>
                  </div>
                </div>

                {/* Capability Badge */}
                <div className="pt-2">
                  {dest.type === "PAGE" ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Hỗ trợ đăng tự động qua Meta Graph API</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 text-[11px] font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Hỗ trợ qua trợ lý 3 bước (Meta v19.0+ Policy)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={dest.linkUrl || `https://facebook.com/${dest.platformId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                >
                  <span>Mở Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  href="/create-post"
                  className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                >
                  Tạo bài viết &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
