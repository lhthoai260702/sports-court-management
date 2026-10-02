import React from 'react';
import {
  FileSpreadsheet,
  CircleDollarSign,
  Receipt,
  BarChart3,
  Package,
  LayoutGrid,
  Info,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeCourtsCount?: number;
  totalCourtsCount?: number;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen = false,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'so-do-san',
      label: 'Sơ Đồ Sân',
      sublabel: 'Tổng quan sân & bảng giá',
      icon: LayoutGrid,
    },
    {
      id: 'thu-chi-san',
      label: 'Sổ Hóa Đơn Chi Tiết',
      sublabel: 'Tra cứu & chỉnh sửa bill',
      icon: CircleDollarSign,
    },
    {
      id: 'thu-chi-van-hanh',
      label: 'Chi Phí Vận Hành',
      sublabel: 'Ghi chép tiền chi ngày',
      icon: Receipt,
    },
    {
      id: 'bao-cao-thong-ke',
      label: 'Báo Cáo & Thống Kê',
      sublabel: 'Doanh thu & lợi nhuận tuần/tháng',
      icon: BarChart3,
    },
    {
      id: 'quan-ly-san-pham',
      label: 'Bảng Giá & Dịch Vụ',
      sublabel: 'Giá nước, cầu, thuê sân',
      icon: Package,
    },
  ];

  return (
    <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#e5eeff] shadow-[1px_0_8px_rgba(0,0,0,0.03)] z-40 flex flex-col justify-between p-4 overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex flex-col gap-4">
        {/* Section title */}
        <div className="px-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72]">
            Quy Trình Chốt Sổ Chủ Sân
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#006948] text-white font-bold shadow-sm shadow-[#006948]/20'
                    : 'text-[#3d4a42] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isActive ? 'text-white' : 'text-[#545c72]'
                  }`}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-tight">{item.label}</span>
                  {item.sublabel && (
                    <span
                      className={`text-[11px] font-medium mt-0.5 ${
                        isActive ? 'text-[#c6f6df]' : 'text-[#6d7a72]'
                      }`}
                    >
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>


    </aside>
  );
};
