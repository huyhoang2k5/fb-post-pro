"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Megaphone,
  Calendar,
  Layers,
  Package,
  BookTemplate,
  Image as ImageIcon,
  History,
  BarChart3,
  Share2,
  Settings,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Tạo bài", href: "/create-post", icon: PenSquare, highlight: true },
  { label: "Bài đăng", href: "/posts", icon: FileText },
  { label: "Chiến dịch", href: "/campaigns", icon: Megaphone },
  { label: "Lịch đăng", href: "/schedules", icon: Calendar },
  { label: "Group / Page", href: "/destinations", icon: Layers },
  { label: "Sản phẩm", href: "/products", icon: Package },
  { label: "Mẫu bài", href: "/templates", icon: BookTemplate },
  { label: "Media", href: "/media", icon: ImageIcon },
  { label: "Lịch sử", href: "/history", icon: History },
  { label: "Báo cáo", href: "/reports", icon: BarChart3 },
  { label: "Kết nối Facebook", href: "/connections", icon: Share2 },
  { label: "Cài đặt", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-primary-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
            F
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              FB Post Pro
            </span>
            <span className="block text-[10px] text-blue-400 font-medium">
              Meta Official Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
                item.highlight && !isActive && "text-blue-400 font-bold bg-blue-950/30 border border-blue-900/40"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                    item.highlight && !isActive && "text-blue-400"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Meta Compliance Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Meta Graph API v20.0 Tuân thủ chính thức 100%</span>
        </div>
      </div>
    </aside>
  );
}
