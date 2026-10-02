import React, { useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { Court } from '../types';
import { CurrencyInput } from './CurrencyInput';

interface CourtSettingsViewProps {
  courts: Court[];
  onUpdateCourt: (updated: Court) => void;
}

export const CourtSettingsView: React.FC<CourtSettingsViewProps> = ({
  courts,
  onUpdateCourt,
}) => {
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt) return;
    onUpdateCourt(editingCourt);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingCourt(null);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
          Cài Đặt Giá & Quản Lý Sân
        </h1>
        <p className="text-xs sm:text-sm text-[#6d7a72]">
          Thiết lập đơn giá theo giờ, giá giờ vàng cao điểm và tình trạng bảo trì sân
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-[#85f8c4]/40 border border-[#006948] text-[#005137] px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-[#006948]" />
          <span>Cập nhật bảng giá sân thành công!</span>
        </div>
      )}

      {/* Courts list cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courts.map((court) => (
          <div
            key={court.id}
            className="bg-white p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-[#006948] uppercase tracking-wider">
                  {court.subType}
                </span>
                <h3 className="text-lg font-bold text-[#0b1c30]">{court.name}</h3>
                <span className="text-xs text-[#545c72]">{court.description}</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  court.status === 'occupied'
                    ? 'bg-[#85f8c4]/40 text-[#005137]'
                    : court.status === 'available'
                    ? 'bg-[#eff4ff] text-[#0051d5]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {court.status === 'occupied'
                  ? 'Đang có khách'
                  : court.status === 'available'
                  ? 'Sân trống'
                  : 'Bảo trì'}
              </span>
            </div>

            <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#eff4ff] flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Giá giờ chuẩn:</span>
                <span className="font-extrabold text-[#006948]">
                  {formatCurrency(court.hourlyRate)} đ / giờ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Giá giờ cao điểm (17h - 22h):</span>
                <span className="font-bold text-[#0b1c30]">
                  {formatCurrency(court.hourlyRate + 40000)} đ / giờ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Mã ký hiệu sân:</span>
                <span className="font-bold text-[#545c72]">{court.code}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingCourt({ ...court })}
              className="w-full py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006948] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Chỉnh sửa thông số sân</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <h3 className="text-lg font-bold text-[#0b1c30]">
                Cập nhật sân: {editingCourt.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCourt(null)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Tên hiển thị sân</label>
                <input
                  type="text"
                  value={editingCourt.name}
                  onChange={(e) =>
                    setEditingCourt({ ...editingCourt, name: e.target.value })
                  }
                  className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">
                  Đơn giá thuê sân / giờ (VNĐ)
                </label>
                <CurrencyInput
                  value={editingCourt.hourlyRate}
                  onChange={(val) =>
                    setEditingCourt({
                      ...editingCourt,
                      hourlyRate: val || 0,
                    })
                  }
                  className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Mô tả đặc điểm sân</label>
                <input
                  type="text"
                  value={editingCourt.description}
                  onChange={(e) =>
                    setEditingCourt({ ...editingCourt, description: e.target.value })
                  }
                  className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="px-4 py-2 bg-[#eff4ff] text-[#3d4a42] rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
