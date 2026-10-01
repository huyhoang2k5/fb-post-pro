"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      const json = await res.json();
      if (json.data) setCampaigns(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setStatus("ACTIVE");
    setModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCampaign(c);
    setName(c.name);
    setDescription(c.description || "");
    setStartDate(c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "");
    setEndDate(c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "");
    setBudget(c.budget ? c.budget.toString() : "");
    setStatus(c.status);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chiến dịch này?")) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const payload = {
      name,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget ? parseFloat(budget) : null,
      status,
    };

    try {
      if (editingCampaign) {
        await fetch(`/api/campaigns/${editingCampaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-600" />
            <span>Quản lý Chiến dịch Marketing</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gom nhóm các bài đăng theo từng chiến dịch sale, đợt ra mắt hoặc chương trình ưu đãi đặc biệt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCampaigns}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo chiến dịch</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
          <span>Đang tải danh sách chiến dịch...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Chưa có chiến dịch nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tạo chiến dịch đầu tiên để phân loại và theo dõi hiệu suất các bài đăng Facebook của đội ngũ.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            Tạo chiến dịch ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    {c.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                  {c.name}
                </h4>

                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  {c.budget && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ngân sách dự kiến:</span>
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {formatCurrency(c.budget)}
                      </strong>
                    </div>
                  )}

                  {(c.startDate || c.endDate) && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Thời gian:</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        {c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "Bắt đầu"} &rarr;{" "}
                        {c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "Kết thúc"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-primary-600" />
                  <span>{c._count?.posts || 0} bài đăng</span>
                </span>

                <Link
                  href={`/posts?campaignId=${c.id}`}
                  className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                >
                  Xem bài viết &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD Campaign */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCampaign ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tên chiến dịch <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Chiến dịch Ra mắt Bộ Sưu Tập Mùa Thu 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mô tả mục tiêu
            </label>
            <textarea
              rows={3}
              placeholder="Mục tiêu tiếp cận 100.000 khách hàng tiềm năng qua các group chuyên ngành..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ngân sách dự kiến (VNĐ)
              </label>
              <input
                type="number"
                placeholder="10000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none"
              >
                <option value="PLANNING">Đang lên kế hoạch</option>
                <option value="ACTIVE">Đang diễn ra</option>
                <option value="COMPLETED">Đã kết thúc</option>
                <option value="PAUSED">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-xl hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow"
            >
              {saving ? "Đang lưu..." : "Lưu chiến dịch"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
