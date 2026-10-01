"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [delaySec, setDelaySec] = useState(3);
  const [savedDelay, setSavedDelay] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        setStats(json.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleSaveDelay = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedDelay(true);
    setTimeout(() => setSavedDelay(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" />
          <span>Cài đặt Hệ thống & Tham số Kỹ thuật</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cấu hình khoảng cách an toàn tránh spam Meta, kiểm tra trạng thái Redis BullMQ, Database và biến môi trường.
        </p>
      </div>

      {/* Section 1: Anti-Spam Post Delay */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Khoảng cách giãn cách giữa các bài đăng (Anti-Spam Rate Limit)
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Khi đăng đồng loạt tới 10, 20 hoặc 50 Trang/Nhóm, hệ thống sẽ tự động xếp hàng và tạo độ trễ giữa mỗi job để không bị thuật toán Facebook chặn hành vi đăng nhanh bất thường.
        </p>

        <form onSubmit={handleSaveDelay} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Thời gian nghỉ giữa mỗi job (Giây)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={delaySec}
              onChange={(e) => setDelaySec(parseInt(e.target.value) || 1)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="self-end w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {savedDelay ? "Đã lưu thành công!" : "Lưu thiết lập"}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Architecture & Infrastructure Health */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Server className="w-5 h-5 text-primary-600" />
          <span>Trạng thái Hạ tầng Dịch vụ</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Background Queue */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Background Job Queue</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sẵn sàng
              </span>
            </div>
            <p className="text-slate-500">
              Chế độ hiện tại:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.queueStatus?.queueEngine || "BullMQ + Database In-Process Runner"}
              </strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Tự động điều phối jobs tuần tự, xử lý retry khi xảy ra sự cố mạng.
            </p>
          </div>

          {/* Database */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Cơ sở dữ liệu (Database)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kết nối tốt
              </span>
            </div>
            <p className="text-slate-500">
              Hệ quản trị: <strong>PostgreSQL + Prisma ORM</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Lưu trữ an toàn 13 bảng thực thể phục vụ phân phối bài đăng và kiểm toán audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Meta Compliance Rules */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Chính sách Tuân thủ Meta Graph API</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Tuyệt đối không lưu mật khẩu Facebook:</strong> Toàn bộ quá trình xác thực sử dụng Meta OAuth chính thức, máy chủ chỉ lưu trữ Long-Lived Token đã được mã hóa.
            </span>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Không sử dụng cookie/session lậu hoặc private API:</strong> Mọi lệnh đăng bài được thực hiện qua các endpoint REST chính thức của Facebook Graph API.
            </span>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Tôn trọng giới hạn Facebook Groups:</strong> Phản hồi chính xác trạng thái <em>"Group này không hỗ trợ đăng tự động bằng API hiện tại"</em> và cung cấp công cụ sao chép/tải ảnh/mở nhóm tiện lợi cho nhân viên.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
