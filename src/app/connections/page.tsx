"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Layers,
  KeyRound,
  FileCode,
  Info,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function ConnectionsPage() {
  const [statusData, setStatusData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/facebook/status");
      const json = await res.json();
      setStatusData(json);
    } catch (err) {
      console.error("Lỗi lấy status FB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Kiểm tra query param nếu vừa redirect từ OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const pages = params.get("pages") || "0";
      const groups = params.get("groups") || "0";
      setNotice(`Kết nối Facebook thành công! Đã đồng bộ ${pages} Pages và ${groups} Groups.`);
    } else if (params.get("error")) {
      setNotice(`Lỗi kết nối Facebook: ${params.get("error")}`);
    }
  }, []);

  const handleConnectFacebook = () => {
    window.location.href = "/api/facebook/auth?redirect=true";
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/facebook/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setNotice(data.message || "Đồng bộ thành công!");
        await fetchStatus();
      } else {
        setNotice(data.error || "Lỗi đồng bộ");
      }
    } catch (err: any) {
      setNotice(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Bạn có chắc chắn muốn ngắt kết nối tài khoản Facebook này?")) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/facebook/disconnect", { method: "POST" });
      if (res.ok) {
        setNotice("Đã ngắt kết nối Facebook.");
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary-600" />
          <span>Kết nối Tài khoản Facebook (Meta OAuth)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Đăng nhập trực tiếp bằng tài khoản Facebook của bạn qua cơ chế Meta OAuth 2.0 chính thức để quản lý các Trang và Nhóm được ủy quyền.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-sm font-semibold flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Main Connection Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
            <span>Đang kiểm tra trạng thái ủy quyền Meta...</span>
          </div>
        ) : statusData?.connected ? (
          <div className="space-y-6">
            {/* Connected Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 border-2 border-primary-500/20 shadow-md">
                  {statusData.connection.avatarUrl ? (
                    <img
                      src={statusData.connection.avatarUrl}
                      alt={statusData.connection.fbName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-600 text-white font-bold flex items-center justify-center text-xl">
                      {statusData.connection.fbName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {statusData.connection.fbName}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã kết nối</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    ID Facebook: <code className="font-mono">{statusData.connection.fbUserId}</code>
                    {statusData.connection.fbEmail && ` · ${statusData.connection.fbEmail}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary-600" : ""}`} />
                  <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ Pages/Groups"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ngắt kết nối</span>
                </button>
              </div>
            </div>

            {/* Token Info & Scopes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Cơ chế bảo mật Token (Meta Long-Lived Token)
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Đã quy đổi sang Long-Lived User Access Token có hiệu lực 60 ngày. Các Page Access Token tương ứng không hết hạn theo tài khoản quản trị.
                </p>
                <div className="flex items-center justify-between pt-1 text-slate-600 dark:text-slate-400">
                  <span>Hạn token:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatDateTime(statusData.connection.tokenExpiresAt)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Quyền hạn Meta đã được cấp (Permissions / Scopes)
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {statusData.connection.scopes?.map((scope: string) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-primary-700 dark:text-primary-300 text-[10px] font-mono border border-blue-200 dark:border-blue-900"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Destination Stats */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Tài khoản đang quản lý {statusData.stats.totalPages} Trang Facebook và {statusData.stats.totalGroups} Nhóm.
                </span>
              </div>
              <a
                href="/destinations"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <span>Xem danh sách</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* Not Connected State */
          <div className="py-8 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mx-auto shadow-inner">
              <Share2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Chưa kết nối tài khoản Facebook
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Đăng nhập bằng tài khoản Facebook của bạn để cấp quyền quản lý các Trang và Nhóm mà bạn có quyền sử dụng.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleConnectFacebook}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-[#1877F2] hover:bg-[#0c63d4] text-white font-bold text-sm shadow-xl shadow-[#1877F2]/25 transition transform active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Đăng nhập bằng Meta OAuth (Chính thức)</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-slate-400 text-xs pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Không lưu mật khẩu</span>
              </span>
              <span>•</span>
              <span>Server-side Token Exchange</span>
              <span>•</span>
              <span>Graph API v20.0</span>
            </div>
          </div>
        )}
      </div>

      {/* Meta Developer App Setup Instructions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Hướng dẫn cấu hình Meta Developer App (App ID & Secret)
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Để thực hiện đăng nhập OAuth thật từ Facebook của bạn, bạn chỉ cần tạo 1 ứng dụng miễn phí trên Meta for Developers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>Tạo ứng dụng Meta</span>
            </span>
            <p className="text-slate-500">
              Truy cập{" "}
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                developers.facebook.com/apps <ExternalLink className="w-3 h-3" />
              </a>
              , chọn loại ứng dụng là <strong>Business</strong> (Doanh nghiệp).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>Cấu hình Redirect URI</span>
            </span>
            <p className="text-slate-500">
              Trong mục <em>Facebook Login for Business &gt; Settings</em>, thêm URL chuyển hướng hợp lệ:
              <br />
              <code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all block mt-1">
                http://localhost:3000/api/facebook/callback
              </code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span>Cấp quyền (Permissions)</span>
            </span>
            <p className="text-slate-500">
              Thêm các quyền cần thiết: <code className="font-mono text-primary-600">pages_show_list</code>,{" "}
              <code className="font-mono text-primary-600">pages_manage_posts</code>,{" "}
              <code className="font-mono text-primary-600">pages_read_engagement</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black">
                4
              </span>
              <span>Cập nhật file .env</span>
            </span>
            <p className="text-slate-500">
              Sao chép App ID và App Secret dán vào file <code className="font-mono">.env</code>:
              <br />
              <code className="text-slate-600 font-mono text-[10px] block mt-1">
                FACEBOOK_APP_ID="12345..."<br />
                FACEBOOK_APP_SECRET="abcde..."
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
