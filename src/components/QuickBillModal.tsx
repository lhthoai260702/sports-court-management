import React, { useState } from 'react';
import { QrCode, Banknote, Clock } from 'lucide-react';
import { Court, CatalogItem, Invoice } from '../types';

interface QuickBillModalProps {
  courts: Court[];
  catalogItems: CatalogItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export const QuickBillModal: React.FC<QuickBillModalProps> = ({
  courts,
  isOpen,
  onClose,
  onSaveInvoice,
  onPrintInvoice,
}) => {
  if (!isOpen) return null;

  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || 'pb-01');
  const [customerName, setCustomerName] = useState('');
  const [timeSlot, setTimeSlot] = useState('17:00 - 19:00');
  const [courtFeeManual, setCourtFeeManual] = useState<number>(360000);
  const [waterQty, setWaterQty] = useState(2);
  const [reviveQty, setReviveQty] = useState(2);
  const [ballQty, setBallQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');

  const activeCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  const waterFee = 15000 * waterQty;
  const reviveFee = 20000 * reviveQty;
  const ballFee = 35000 * ballQty;
  const serviceFee = waterFee + reviveFee + ballFee;
  const totalAmount = courtFeeManual + serviceFee;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const handleCreateBill = () => {
    const items = [
      {
        id: `court-${Date.now()}`,
        name: `Tiền giờ thuê sân (${timeSlot})`,
        price: courtFeeManual,
        quantity: 1,
        category: 'court' as const,
        manualTotal: courtFeeManual,
        rentalTime: timeSlot,
      },
      ...(waterQty > 0
        ? [
            {
              id: `w-${Date.now()}`,
              name: 'Nước suối Aquafina 500ml',
              price: 15000,
              quantity: waterQty,
              category: 'drink' as const,
            },
          ]
        : []),
      ...(reviveQty > 0
        ? [
            {
              id: `r-${Date.now()}`,
              name: 'Revive chanh muối bù khoáng',
              price: 20000,
              quantity: reviveQty,
              category: 'drink' as const,
            },
          ]
        : []),
      ...(ballQty > 0
        ? [
            {
              id: `b-${Date.now()}`,
              name: 'Bóng thi đấu Franklin X-40',
              price: 35000,
              quantity: ballQty,
              category: 'accessory' as const,
            },
          ]
        : []),
    ];

    const newInv: Invoice = {
      id: `#BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      courtId: activeCourt.id,
      courtName: activeCourt.name,
      timeSlot,
      customerName: customerName.trim() || 'Khách Vãng Lai',
      items,
      courtFee: courtFeeManual,
      serviceFee,
      totalAmount,
      paymentMethod,
      status: 'paid',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveInvoice(newInv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#0b1c30]">Tạo Hóa Đơn Nhanh</h2>
            <span className="text-xs text-[#6d7a72]">Chỉnh giờ thuê sân, tự nhập tiền sân & dịch vụ</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Choose Court */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">Chọn Sân</label>
              <select
                value={selectedCourtId}
                onChange={(e) => setSelectedCourtId(e.target.value)}
                className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">Giờ thuê sân</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="Vd: 17:00 - 19:00"
                className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-bold text-[#006948] focus:outline-none focus:border-[#006948]"
              />
            </div>
          </div>

          {/* Court Fee Manual Input */}
          <div className="bg-[#f0fbf7] p-3.5 rounded-2xl border border-[#85f8c4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#006948]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  Tiền giờ thuê sân (Tự nhập tay)
                </span>
                <span className="text-[11px] text-[#6d7a72]">Khung giờ: {timeSlot}</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                step="10000"
                value={courtFeeManual === 0 ? '' : courtFeeManual}
                onChange={(e) => setCourtFeeManual(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-36 px-3 py-1.5 bg-white border border-[#85f8c4] focus:border-[#006948] rounded-xl text-right font-extrabold text-sm text-[#006948] focus:outline-none shadow-2xs"
              />
              <span className="text-xs font-bold text-[#006948]">đ</span>
            </div>
          </div>

          {/* Customer */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">Tên Khách Hàng</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên khách (vd: Anh Minh, Chị Trang...)"
              className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#006948]"
            />
          </div>

          {/* Quick Quantities for F&B */}
          <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006948]">
              Nước uống & Phụ kiện
            </span>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0b1c30]">Nước suối Aquafina (15.000đ):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWaterQty(Math.max(0, waterQty - 1))}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  -
                </button>
                <span className="font-extrabold text-sm w-6 text-center">{waterQty}</span>
                <button
                  type="button"
                  onClick={() => setWaterQty(waterQty + 1)}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0b1c30]">Revive chanh muối (20.000đ):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviveQty(Math.max(0, reviveQty - 1))}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  -
                </button>
                <span className="font-extrabold text-sm w-6 text-center">{reviveQty}</span>
                <button
                  type="button"
                  onClick={() => setReviveQty(reviveQty + 1)}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0b1c30]">Bóng thi đấu (35.000đ):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBallQty(Math.max(0, ballQty - 1))}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  -
                </button>
                <span className="font-extrabold text-sm w-6 text-center">{ballQty}</span>
                <button
                  type="button"
                  onClick={() => setBallQty(ballQty + 1)}
                  className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#6d7a72]">Thanh toán:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'qr'
                    ? 'bg-[#006948] text-white'
                    : 'bg-[#eff4ff] text-[#3d4a42]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR VietQR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#006948] text-white'
                    : 'bg-[#eff4ff] text-[#3d4a42]'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tiền mặt</span>
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#6d7a72]">Tổng thanh toán:</span>
            <span className="text-2xl font-extrabold text-[#006948]">
              {formatCurrency(totalAmount)} đ
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#eff4ff] text-[#3d4a42] font-bold text-sm rounded-xl cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => handleCreateBill()}
            className="px-6 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
