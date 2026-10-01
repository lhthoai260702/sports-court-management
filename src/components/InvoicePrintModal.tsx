import React from 'react';
import { Printer, X, CheckCircle2, QrCode, Banknote, Calendar, Clock, Phone, MapPin } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#dce9ff] flex flex-col gap-6 my-auto print:shadow-none print:border-none print:m-0 print:p-2 print:max-w-full">
        {/* Header with Close and Print action */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eff4ff] print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#006948]">
            <CheckCircle2 className="w-4 h-4" />
            <span>HÓA ĐƠN ĐÃ ĐỐI SOÁT & LẬP THÀNH CÔNG</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#ffdad6] hover:text-[#ba1a1a] text-[#545c72] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="flex flex-col gap-4 border-2 border-dashed border-[#bccac0] p-6 rounded-2xl bg-[#fcfdfc] font-sans">
          {/* Logo & Court Club Title */}
          <div className="flex flex-col items-center text-center pb-3 border-b border-[#bccac0]/40">
            <span className="text-xl font-extrabold text-[#006948] tracking-tight">
              SPORTCOURT MANAGER PRO
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] mt-0.5">
              CÂU LẠC BỘ PICKLEBALL & CẦU LÔNG QUỐC TẾ
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6d7a72] mt-1">
              <MapPin className="w-3 h-3" />
              <span>Số 128 Đường Thể Thao, Quận 7, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6d7a72]">
              <Phone className="w-3 h-3" />
              <span>Hotline đặt sân: 0908.123.456 • 0912.888.999</span>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-[#bccac0]/40">
            <div>
              <span className="text-[#6d7a72]">Số hóa đơn: </span>
              <span className="font-extrabold text-[#0b1c30]">{invoice.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6d7a72]">Thời gian lập: </span>
              <span className="font-semibold text-[#0b1c30]">
                {invoice.createdAt || '10:15'} • 24/10/2024
              </span>
            </div>
            <div>
              <span className="text-[#6d7a72]">Sân thi đấu: </span>
              <span className="font-extrabold text-[#006948]">{invoice.courtName}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6d7a72]">Khung giờ: </span>
              <span className="font-bold text-[#0b1c30]">{invoice.timeSlot}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#6d7a72]">Khách hàng / Đội: </span>
              <span className="font-bold text-[#0b1c30]">{invoice.customerName}</span>
            </div>
            {invoice.note && (
              <div className="col-span-2 text-[11px] text-[#545c72] italic">
                Ghi chú: {invoice.note}
              </div>
            )}
          </div>

          {/* Items breakdown list */}
          <div className="flex flex-col gap-2 py-2">
            <div className="flex justify-between text-xs font-bold text-[#3d4a42] border-b border-[#bccac0]/40 pb-1">
              <span>Nội dung / Dịch vụ</span>
              <span className="text-right">Thành tiền</span>
            </div>
            {invoice.items.map((item, idx) => {
              const lineTotal = item.category === 'court' ? (item.manualTotal ?? item.price) : item.price * item.quantity;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#0b1c30]">{item.name}</span>
                    {item.category === 'court' ? (
                      <span className="text-[10px] text-[#6d7a72]">Theo khung giờ thuê sân</span>
                    ) : (
                      <span className="text-[10px] text-[#6d7a72]">
                        {formatCurrency(item.price)} đ x {item.quantity}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#0b1c30]">
                    {formatCurrency(lineTotal)} đ
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals & Method */}
          <div className="pt-2 border-t-2 border-dashed border-[#bccac0] flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-[#545c72]">
              <span>Tiền giờ sân:</span>
              <span>{formatCurrency(invoice.courtFee)} đ</span>
            </div>
            <div className="flex justify-between text-xs text-[#545c72]">
              <span>Dịch vụ & Đồ uống:</span>
              <span>{formatCurrency(invoice.serviceFee)} đ</span>
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t border-[#eff4ff]">
              <span className="text-[#0b1c30] uppercase">Tổng tiền thanh toán:</span>
              <span className="text-xl text-[#006948]">{formatCurrency(invoice.totalAmount)} đ</span>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="mt-2 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {invoice.paymentMethod === 'qr' ? (
                <>
                  <QrCode className="w-5 h-5 text-[#0051d5]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0051d5]">Thanh toán QR VietQR</span>
                    <span className="text-[10px] text-[#6d7a72]">Giao dịch đã xác thực qua app ngân hàng</span>
                  </div>
                </>
              ) : (
                <>
                  <Banknote className="w-5 h-5 text-[#006948]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#006948]">Thanh toán Tiền mặt</span>
                    <span className="text-[10px] text-[#6d7a72]">Thu ngân đã thu đủ tiền</span>
                  </div>
                </>
              )}
            </div>
            <span className="px-2 py-0.5 rounded bg-[#85f8c4]/80 text-[#005137] text-[11px] font-bold">
              ĐÃ THANH TOÁN
            </span>
          </div>

          {/* Footer Thank You */}
          <div className="text-center text-[11px] text-[#6d7a72] pt-2 border-t border-[#bccac0]/30 italic">
            Cảm ơn quý khách đã đồng hành cùng SportCourt Club. Hẹn gặp lại quý khách!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a42] font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Thu Ngân</span>
          </button>
        </div>
      </div>
    </div>
  );
};
