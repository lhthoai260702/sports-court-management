import React from 'react';
import { Calendar, User, FileSpreadsheet, Sparkles, Menu } from 'lucide-react';

interface HeaderProps {
  todayRevenue: number;
  onOpenClosingReport?: () => void;
  selectedDate?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayRevenue,
  onOpenClosingReport,
  selectedDate = '24/10/2024',
  onMenuClick
}) => {
  const formattedRevenue = new Intl.NumberFormat('vi-VN').format(todayRevenue);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 min-w-fit lg:min-w-[240px]">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[#eff4ff] text-[#545c72]"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-[#006948] to-[#005137] text-white items-center justify-center font-black text-lg shadow-sm">
            HY
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#006948] tracking-tight leading-none">
              HaiYenSport
            </span>
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider mt-0.5">
              Sổ Thu Chi & Chốt Doanh Thu
            </span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e5eeff]">
            <div className="w-8 h-8 rounded-full bg-[#006948] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">Hải Yến</span>
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
