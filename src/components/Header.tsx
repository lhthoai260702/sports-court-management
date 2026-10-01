import React from 'react';
import { Calendar, User, FileSpreadsheet, Sparkles } from 'lucide-react';

interface HeaderProps {
  todayRevenue: number;
  onOpenClosingReport?: () => void;
  selectedDate?: string;
}

export const Header: React.FC<HeaderProps> = ({
  todayRevenue,
  onOpenClosingReport,
  selectedDate = '24/10/2024',
}) => {
  const formattedRevenue = new Intl.NumberFormat('vi-VN').format(todayRevenue);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006948] to-[#005137] text-white flex items-center justify-center font-black text-lg shadow-sm">
            SC
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#006948] tracking-tight leading-none">
              SportCourt
            </span>
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider mt-0.5">
              Sổ Thu Chi & Chốt Doanh Thu
            </span>
          </div>
        </div>

        {/* Operational Context in Center */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Mode Pill */}
          <div className="flex items-center gap-2 bg-[#f0fbf7] px-3.5 py-1.5 rounded-xl border border-[#c6f6df]">
            <Sparkles className="w-3.5 h-3.5 text-[#006948]" />
            <span className="text-xs font-bold text-[#006948]">
              Chế độ: Tổng Kết Sổ Cuối Ngày
            </span>
          </div>

          {/* Date Badge */}
          <div className="flex items-center gap-2 bg-[#eff4ff] px-3.5 py-1.5 rounded-xl border border-[#dce9ff]">
            <Calendar className="w-3.5 h-3.5 text-[#545c72]" />
            <span className="text-xs font-semibold text-[#0b1c30]">
              Ngày chốt sổ: <strong className="font-extrabold text-[#006948]">{selectedDate}</strong>
            </span>
          </div>

          {/* Today's Tally */}
          <div className="flex items-center gap-2 bg-[#85f8c4]/25 px-3.5 py-1.5 rounded-xl border border-[#85f8c4]/60">
            <span className="text-xs font-semibold text-[#005137]">Tổng đã ghi sổ:</span>
            <span className="text-sm font-black text-[#006948]">
              {formattedRevenue} đ
            </span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {onOpenClosingReport && (
            <button
              onClick={onOpenClosingReport}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] font-bold text-xs transition-all cursor-pointer border border-[#dce9ff] shadow-2xs"
              title="Xem bảng kê chốt sổ cuối ngày"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0051d5]" />
              <span className="hidden sm:inline">In Bảng Kê Chốt Sổ</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e5eeff]">
            <div className="w-8 h-8 rounded-full bg-[#006948] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">Chủ Sân</span>
              <span className="text-[10px] text-[#6d7a72] font-semibold uppercase tracking-wider">
                Quản trị viên duy nhất
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
