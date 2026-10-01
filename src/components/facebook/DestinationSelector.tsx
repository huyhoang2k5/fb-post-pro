"use client";

import React, { useState, useMemo } from "react";
import { Search, CheckSquare, Square, Flag, Users, Info } from "lucide-react";

interface DestinationItem {
  id: string;
  platformId: string;
  name: string;
  type: "PAGE" | "GROUP";
  category?: string | null;
  avatarUrl?: string | null;
  memberCount?: number | null;
  canPost: boolean;
  requiresManual: boolean;
}

interface DestinationSelectorProps {
  destinations: DestinationItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  loading?: boolean;
}

export function DestinationSelector({
  destinations,
  selectedIds,
  onChange,
  loading = false,
}: DestinationSelectorProps) {
  const [filterType, setFilterType] = useState<"ALL" | "PAGE" | "GROUP">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchType = filterType === "ALL" || dest.type === filterType;
      const matchSearch =
        !searchTerm.trim() ||
        dest.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [destinations, filterType, searchTerm]);

  const selectedCount = selectedIds.length;
  const selectedPagesCount = destinations.filter(
    (d) => selectedIds.includes(d.id) && d.type === "PAGE"
  ).length;
  const selectedGroupsCount = destinations.filter(
    (d) => selectedIds.includes(d.id) && d.type === "GROUP"
  ).length;

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const idsToSelect = Array.from(
      new Set([...selectedIds, ...filteredDestinations.map((d) => d.id)])
    );
    onChange(idsToSelect);
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredDestinations.map((d) => d.id));
    onChange(selectedIds.filter((id) => !filteredIds.has(id)));
  };

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Chọn nơi đăng (Page / Group)
          </h4>
          <p className="text-xs text-slate-500">
            {destinations.length === 0 ? (
              "Chưa có Trang hoặc Nhóm nào được kết nối."
            ) : (
              <span>
                Đã chọn: <strong className="text-primary-600">{selectedCount}</strong> nơi đăng (
                {selectedPagesCount} Trang, {selectedGroupsCount} Nhóm)
              </span>
            )}
          </p>
        </div>

        {destinations.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1.5 rounded-lg transition"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="text-xs font-medium text-slate-600 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              filterType === "ALL"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tất cả ({destinations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("PAGE")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              filterType === "PAGE"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Flag className="w-3 h-3 text-blue-500" />
            <span>Trang ({destinations.filter((d) => d.type === "PAGE").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("GROUP")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              filterType === "GROUP"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Users className="w-3 h-3 text-purple-500" />
            <span>Nhóm ({destinations.filter((d) => d.type === "GROUP").length})</span>
          </button>
        </div>

        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên Trang hoặc Nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Destinations List */}
      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Đang tải danh sách Trang và Nhóm...
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Không tìm thấy đích đến phù hợp.
          </div>
        ) : (
          filteredDestinations.map((dest) => {
            const isSelected = selectedIds.includes(dest.id);
            return (
              <div
                key={dest.id}
                onClick={() => handleToggle(dest.id)}
                className={`flex items-center justify-between p-2.5 cursor-pointer transition select-none ${
                  isSelected
                    ? "bg-primary-50/50 dark:bg-primary-950/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    className="text-primary-600 focus:outline-none shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
                    {dest.avatarUrl ? (
                      <img
                        src={dest.avatarUrl}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                        {dest.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {dest.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{dest.category || dest.type}</span>
                      {dest.memberCount ? (
                        <span>• {dest.memberCount.toLocaleString()} thành viên</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {dest.type === "PAGE" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                      <Flag className="w-2.5 h-2.5" />
                      <span>Trang (Auto API)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-900">
                      <Users className="w-2.5 h-2.5" />
                      <span>Nhóm (Trợ lý thủ công)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Các <strong>Trang (Pages)</strong> sẽ được đăng tự động tức thì qua Meta Graph API chính thức.
          Các <strong>Nhóm (Groups)</strong> được hỗ trợ tự động chuẩn bị nội dung và mở nhóm để dán nhanh trong 3 giây.
        </span>
      </div>
    </div>
  );
}
