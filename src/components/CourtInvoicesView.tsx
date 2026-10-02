import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, CheckCircle2, QrCode, Banknote, Calendar, Edit3, Trash2, Eye } from 'lucide-react';
import { Invoice, Court, CatalogItem } from '../types';
import { InvoiceDetailEditModal } from './InvoiceDetailEditModal';
import { ConfirmModal } from './ConfirmModal';
import { CustomCalendar } from './CustomCalendar';

interface CourtInvoicesViewProps {
  invoices: Invoice[];
  courts?: Court[];
  catalogItems?: CatalogItem[];
  onUpdateInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onPrintInvoice?: (inv: Invoice) => void;
  onNewBillClick: () => void;
}

export const CourtInvoicesView: React.FC<CourtInvoicesViewProps> = ({
  invoices,
  courts = [],
  catalogItems = [],
  onUpdateInvoice,
  onDeleteInvoice,
  onNewBillClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courtFilter, setCourtFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'qr' | 'cash'>('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Default date filter to today
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.courtName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCourt = courtFilter === 'all' || inv.courtId === courtFilter;
    const matchPayment = paymentFilter === 'all' || inv.paymentMethod === paymentFilter;

    let matchDate = true;
    if (dateFilter) {
      // Parse createdAt string which could be "YYYY-MM-DD HH:mm" or just "HH:mm" (assumed today)
      let invDateString = '';
      if (inv.createdAt.includes('-')) {
        invDateString = inv.createdAt.split(' ')[0];
      } else {
        // If it's just time like "10:15", assume today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        invDateString = `${yyyy}-${mm}-${dd}`;
      }
      matchDate = invDateString === dateFilter;
    }

    return matchSearch && matchCourt && matchPayment && matchDate;
  });

  const totalFilteredRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

  const handleDeleteClick = (invoiceId: string) => {
    if (onDeleteInvoice) {
      onDeleteInvoice(invoiceId);
    }
    setConfirmDeleteRowId(null);
    setToastMessage(`Đã xóa hóa đơn ${invoiceId} thành công!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Quản Lý Thu - Chi Sân
          </h1>
          <p className="text-xs sm:text-sm text-[#6d7a72] mt-0.5">
            Tổng hợp danh sách các hóa đơn tiền giờ và dịch vụ bổ trợ đã lập hôm nay
          </p>
        </div>

        <button
          type="button"
          onClick={onNewBillClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer w-fit"
        >
          <FileText className="w-4 h-4" />
          <span>Tạo Hóa Đơn Mới</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6d7a72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo số HĐ, tên khách hàng hoặc tên sân..."
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm text-[#0b1c30] focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
          />
        </div>

        {/* Court Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="px-3 py-2 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả các sân</option>
            <option value="pb-01">Pickleball 1</option>
            <option value="pb-02">Pickleball 2</option>
            <option value="cl-01">Cầu lông 1</option>
            <option value="cl-02">Cầu lông 2</option>
            <option value="cl-03">Cầu lông 3</option>
            <option value="cl-04">Cầu lông 4</option>
            <option value="cl-05">Cầu lông 5</option>
          </select>

          {/* Payment Method filter */}
          <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${paymentFilter === 'all'
                ? 'bg-[#006948] text-white font-bold'
                : 'text-[#545c72] hover:text-[#0b1c30]'
                }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('qr')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${paymentFilter === 'qr'
                ? 'bg-[#006948] text-white font-bold'
                : 'text-[#545c72] hover:text-[#0b1c30]'
                }`}
            >
              QR
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('cash')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${paymentFilter === 'cash'
                ? 'bg-[#006948] text-white font-bold'
                : 'text-[#545c72] hover:text-[#0b1c30]'
                }`}
            >
              Tiền mặt
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date Filter placed on the far left */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-[#6d7a72] uppercase">Ngày xem báo cáo</span>
          <div className="flex items-center gap-2">
            <div
              className="relative"
              ref={calendarContainerRef}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl cursor-pointer hover:bg-white transition-colors"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar className="w-4 h-4 text-[#0051d5]" />
                <span className="text-xs font-bold text-[#0b1c30]">
                  {dateFilter ? new Date(dateFilter).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Tất cả'}
                </span>
              </div>

              {showCalendar && (
                <CustomCalendar
                  selectedDate={dateFilter ? new Date(dateFilter) : null}
                  onSelect={(date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    setDateFilter(`${y}-${m}-${d}`);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-[#6d7a72] hover:text-[#ba1a1a] underline cursor-pointer whitespace-nowrap"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-[#6d7a72] uppercase">Tổng số hóa đơn</span>
          <span className="text-xl font-extrabold text-[#0b1c30]">
            {filteredInvoices.length} đơn
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-[#6d7a72] uppercase">Tổng tiền đã thu</span>
          <span className="text-xl font-extrabold text-[#006948]">
            {formatCurrency(totalFilteredRevenue)} đ
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eff4ff] text-[#3d4a42]">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-28 min-w-[100px] whitespace-nowrap">Sân</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-28 min-w-[105px] whitespace-nowrap">Khung giờ</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-56 min-w-[200px]">Khách hàng</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-32 min-w-[140px] whitespace-nowrap">Thanh toán</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right w-28 whitespace-nowrap">Tiền sân</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right w-28 whitespace-nowrap">Dịch vụ</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right w-32 whitespace-nowrap">Tổng tiền</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-center w-24 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-5 py-4 text-xs font-bold text-[#006948] whitespace-nowrap">
                    {inv.courtName}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#545c72] font-medium whitespace-nowrap">
                    {inv.timeSlot}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-[#0b1c30]" title={inv.customerName}>
                    {inv.customerName}
                  </td>
                  <td className="px-5 py-4 text-xs whitespace-nowrap">
                    {inv.paymentMethod === 'qr' ? (
                      <span className="inline-flex items-center gap-1 text-[#0051d5] font-semibold bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#dce9ff]">
                        <QrCode className="w-3 h-3" /> QR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#006948] font-semibold bg-[#85f8c4]/30 px-2 py-0.5 rounded-md border border-[#85f8c4]/60">
                        <Banknote className="w-3 h-3" /> Tiền mặt
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-right font-medium text-[#3d4a42] whitespace-nowrap">
                    {formatCurrency(inv.courtFee)} đ
                  </td>
                  <td className="px-5 py-4 text-xs text-right font-medium text-[#3d4a42] whitespace-nowrap">
                    {formatCurrency(inv.serviceFee)} đ
                  </td>
                  <td className="px-5 py-4 text-xs font-extrabold text-right text-[#006948] whitespace-nowrap">
                    {formatCurrency(inv.totalAmount)} đ
                  </td>
                  <td className="px-5 py-3 text-xs text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingInvoice(inv)}
                        className="w-8 h-8 flex items-center justify-center bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] rounded-xl border border-[#dce9ff] transition-colors cursor-pointer shadow-2xs"
                        title="Xem & Sửa hóa đơn"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteRowId(inv.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors cursor-pointer"
                        title="Xóa hóa đơn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#85f8c4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Invoice View & Edit Modal */}
      <InvoiceDetailEditModal
        isOpen={!!editingInvoice}
        invoice={editingInvoice}
        courts={courts}
        catalogItems={catalogItems}
        onClose={() => setEditingInvoice(null)}
        onSave={(updatedInv) => {
          if (onUpdateInvoice) {
            onUpdateInvoice(updatedInv);
          }
          setEditingInvoice(null);
          setToastMessage(`Đã cập nhật hóa đơn ${updatedInv.id} thành công!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
        onDelete={(invoiceId) => {
          handleDeleteClick(invoiceId);
          setEditingInvoice(null);
        }}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteRowId}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc chắn muốn xóa hóa đơn ${confirmDeleteRowId} không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={() => {
          if (confirmDeleteRowId) {
            handleDeleteClick(confirmDeleteRowId);
          }
        }}
        onCancel={() => setConfirmDeleteRowId(null)}
      />
    </div>
  );
};
