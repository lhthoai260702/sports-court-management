import React from 'react';
import { Printer, X, CheckCircle2, QrCode, Banknote, FileSpreadsheet, Calendar, User } from 'lucide-react';
import { Court, Invoice, Expense } from '../types';

interface DailyClosingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  invoices: Invoice[];
  expenses: Expense[];
  courts: Court[];
}

export const DailyClosingSummaryModal: React.FC<DailyClosingSummaryModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  invoices,
  expenses,
  courts,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  // Compute metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCourtFee = invoices.reduce((sum, inv) => sum + inv.courtFee, 0);
  const totalServiceFee = invoices.reduce((sum, inv) => sum + inv.serviceFee, 0);

  const cashRevenue = invoices
    .filter((inv) => inv.paymentMethod === 'cash')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const qrRevenue = invoices
    .filter((inv) => inv.paymentMethod === 'qr')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#dce9ff] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eff4ff] bg-[#f8f9ff]">
          <div className="flex items-center gap-2 text-[#006948]">
            <FileSpreadsheet className="w-5 h-5 text-[#006948]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
              Bảng Kê Chốt Sổ & Đối Soát Doanh Thu Cuối Ngày
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Bảng Kê</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#ffdad6] text-[#545c72] hover:text-[#93000a] flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-[#0b1c30]">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#eff4ff] gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#006948]">
                SportCourt Manager Pro
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
                PHIẾU CHỐT SỔ DOANH THU CUỐI NGÀY
              </h1>
              <p className="text-xs text-[#6d7a72] mt-0.5">
                Bảng tổng hợp đối soát doanh thu, chi phí và tồn quỹ cuối ca
              </p>
            </div>

            <div className="flex flex-col text-xs sm:text-right bg-[#f8f9ff] p-3 rounded-2xl border border-[#e5eeff]">
              <div className="flex items-center sm:justify-end gap-1.5 text-[#0b1c30] font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#006948]" />
                <span>Ngày chốt: {dateStr}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-[#545c72] font-medium mt-1">
                <User className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Người chốt sổ: Chủ Sân (Admin)</span>
              </div>
            </div>
          </div>

          {/* Key Totals Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#6d7a72] uppercase">Tổng Doanh Thu</span>
              <span className="text-lg font-black text-[#006948] mt-0.5">
                {formatCurrency(totalRevenue)} đ
              </span>
              <span className="text-[10px] text-[#545c72]">({invoices.length} bill đã thu)</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#6d7a72] uppercase">Tiền Mặt (Tại Két)</span>
              <span className="text-lg font-black text-[#0b1c30] mt-0.5">
                {formatCurrency(cashRevenue)} đ
              </span>
              <span className="text-[10px] text-[#006948] font-semibold">Đếm khớp két tiền</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#6d7a72] uppercase">Chuyển Khoản QR</span>
              <span className="text-lg font-black text-[#0051d5] mt-0.5">
                {formatCurrency(qrRevenue)} đ
              </span>
              <span className="text-[10px] text-[#0051d5] font-semibold">Kiểm tra app ngân hàng</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#6d7a72] uppercase">Lợi Nhuận Ròng Ngày</span>
              <span className="text-lg font-black text-[#006948] mt-0.5">
                {formatCurrency(netProfit)} đ
              </span>
              <span className="text-[10px] text-[#ba1a1a]">Trừ chi phí: -{formatCurrency(totalExpense)} đ</span>
            </div>
          </div>

          {/* Section 1: Breakdown By Court */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
              1. Doanh thu phân bổ theo từng sân
            </h3>
            <div className="border border-[#e5eeff] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8f9ff] text-[#545c72] font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Tên Sân</th>
                    <th className="px-4 py-2.5 text-center">Số Bill</th>
                    <th className="px-4 py-2.5 text-right">Tiền Thuê Sân</th>
                    <th className="px-4 py-2.5 text-right">Tiền Dịch Vụ</th>
                    <th className="px-4 py-2.5 text-right">Tổng Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff4ff]">
                  {courts.map((court) => {
                    const courtInvs = invoices.filter((i) => i.courtId === court.id);
                    const cCourtFee = courtInvs.reduce((s, i) => s + i.courtFee, 0);
                    const cServiceFee = courtInvs.reduce((s, i) => s + i.serviceFee, 0);
                    const cTotal = courtInvs.reduce((s, i) => s + i.totalAmount, 0);

                    return (
                      <tr key={court.id} className="hover:bg-[#fafcff]">
                        <td className="px-4 py-2.5 font-bold text-[#0b1c30]">
                          {court.name}{' '}
                          <span className="text-[10px] text-[#6d7a72] font-normal">
                            ({court.subType})
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-[#545c72]">
                          {courtInvs.length}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#3d4a42]">
                          {formatCurrency(cCourtFee)} đ
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#3d4a42]">
                          {formatCurrency(cServiceFee)} đ
                        </td>
                        <td className="px-4 py-2.5 text-right font-extrabold text-[#006948]">
                          {formatCurrency(cTotal)} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#f8f9ff] font-extrabold text-[#0b1c30] border-t border-[#e5eeff]">
                  <tr>
                    <td className="px-4 py-2.5">TỔNG CỘNG</td>
                    <td className="px-4 py-2.5 text-center">{invoices.length} bill</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(totalCourtFee)} đ</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(totalServiceFee)} đ</td>
                    <td className="px-4 py-2.5 text-right text-[#006948]">
                      {formatCurrency(totalRevenue)} đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 2: Operating Expenses */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              2. Các khoản chi phí vận hành trong ngày
            </h3>
            {expenses.length === 0 ? (
              <p className="text-xs text-[#6d7a72] italic bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                Không có chi phí vận hành nào ghi nhận cho ngày này.
              </p>
            ) : (
              <div className="border border-[#e5eeff] rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f8f9ff] text-[#545c72] font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Mục Chi</th>
                      <th className="px-4 py-2.5">Nội Dung / Ghi Chú</th>
                      <th className="px-4 py-2.5 text-right">Số Tiền Chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="px-4 py-2.5 font-bold text-[#0b1c30]">{exp.title}</td>
                        <td className="px-4 py-2.5 text-[#545c72]">{exp.note || '-'}</td>
                        <td className="px-4 py-2.5 text-right font-extrabold text-[#ba1a1a]">
                          -{formatCurrency(exp.amount)} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#f8f9ff] font-extrabold border-t border-[#e5eeff]">
                    <tr>
                      <td colSpan={2} className="px-4 py-2.5 text-[#0b1c30]">
                        TỔNG CHI PHÍ VẬN HÀNH
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#ba1a1a]">
                        -{formatCurrency(totalExpense)} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Final Reconciliation Sign-off */}
          <div className="pt-4 border-t border-[#eff4ff] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="text-xs text-[#545c72] leading-relaxed max-w-sm">
              <p>
                <strong>Ghi chú chốt sổ:</strong> Toàn bộ các bill trên đã được chủ sân kiểm đếm, xác thực tiền mặt trong két và đối soát chuẩn xác với thông báo tài khoản ngân hàng.
              </p>
            </div>

            <div className="flex flex-col items-center min-w-[200px] text-center">
              <span className="text-xs font-bold text-[#0b1c30]">Người Chốt Sổ & Giữ Quỹ</span>
              <div className="h-16 flex items-center justify-center text-[#006948] font-bold italic text-sm">
                (Đã xác nhận & ký)
              </div>
              <span className="text-xs font-extrabold text-[#006948]">Chủ Sân</span>
              <span className="text-[10px] text-[#6d7a72]">Thời gian: {dateStr} - 23:30</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#eff4ff] bg-[#f8f9ff]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#eff4ff] text-[#3d4a42] font-bold text-xs rounded-xl border border-[#dce9ff] cursor-pointer transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Chốt Sổ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
