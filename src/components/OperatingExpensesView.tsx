import React, { useState } from 'react';
import { Plus, Zap, UserCheck, Wrench, Droplets, Receipt, Trash2, Calendar } from 'lucide-react';
import { Expense } from '../types';

interface OperatingExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const OperatingExpensesView: React.FC<OperatingExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('maintenance');
  const [note, setNote] = useState('');

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newExp: Expense = {
      id: `PC-010${expenses.length + 5}`,
      title: title.trim(),
      category,
      amount: numAmount,
      creator: 'Thu ngân ca trực',
      date: new Date().toISOString().slice(0, 10),
      note: note.trim() || undefined,
    };

    onAddExpense(newExp);
    setTitle('');
    setAmount('');
    setNote('');
    setShowAddForm(false);
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (cat: Expense['category']) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="w-4 h-4 text-[#ba1a1a]" />;
      case 'salary':
        return <UserCheck className="w-4 h-4 text-[#545c72]" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-[#6d7a72]" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-[#0051d5]" />;
      default:
        return <Receipt className="w-4 h-4 text-[#3d4a42]" />;
    }
  };

  const getCategoryName = (cat: Expense['category']) => {
    switch (cat) {
      case 'electricity':
        return 'Điện chiếu sáng sân';
      case 'salary':
        return 'Lương nhân sự & vệ sinh';
      case 'maintenance':
        return 'Bảo trì lưới, mặt sân';
      case 'water':
        return 'Nước sinh hoạt & đá lạnh';
      default:
        return 'Chi phí khác';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Thu - Chi Vận Hành
          </h1>
          <p className="text-xs sm:text-sm text-[#6d7a72] mt-0.5">
            Quản lý chi phí tiền điện, nhân sự ca trực, bảo trì mặt sân và vật tư tiêu hao
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nhập Phiếu Chi Mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#6d7a72] uppercase">
              Tổng chi vận hành hôm nay
            </span>
            <span className="text-2xl font-extrabold text-[#ba1a1a] mt-1">
              {formatCurrency(totalExpenseAmount)} đ
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#6d7a72] uppercase">
              Số phiếu chi đã lập
            </span>
            <span className="text-2xl font-extrabold text-[#0b1c30] mt-1">
              {expenses.length} phiếu
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#6d7a72] uppercase">
              Định mức ngân sách
            </span>
            <span className="text-sm font-bold text-[#005137] bg-[#85f8c4]/50 px-2.5 py-1 rounded-full mt-1 w-fit">
              Đang kiểm soát tốt (&lt; 35%)
            </span>
          </div>
        </div>
      </div>

      {/* Form modal */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-[#e5eeff] shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
            <h2 className="text-lg font-bold text-[#0b1c30]">Tạo Phiếu Chi Vận Hành Sân</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[#6d7a72] hover:text-[#0b1c30] text-sm font-bold"
            >
              ✕ Hủy
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">
                Lý do / Nội dung chi tiền *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vd: Chi tiền nước đá ca sáng, Mua 2 bóng đèn LED Philips..."
                className="px-4 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">
                Số tiền chi (VNĐ) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Vd: 420000"
                className="px-4 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">
                Danh mục chi phí
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-4 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
              >
                <option value="maintenance">Bảo trì mặt sân, thay bóng đèn, lưới</option>
                <option value="electricity">Tiền điện chiếu sáng sân</option>
                <option value="salary">Lương nhân sự & trực ca</option>
                <option value="water">Tiền nước sinh hoạt & nước đá</option>
                <option value="other">Chi phí khác</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase text-[#3d4a42]">
                Ghi chú bổ sung
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Số hóa đơn đỏ, người nhận tiền..."
                className="px-4 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-[#eff4ff] text-[#3d4a42] rounded-xl text-sm font-bold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-sm font-bold shadow-sm"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eff4ff] text-[#3d4a42]">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Mã phiếu</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Ngày</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Nội dung chi</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Phân loại</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Số tiền</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-5 py-4 text-xs font-extrabold text-[#ba1a1a]">
                    {exp.id}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6d7a72] font-semibold">
                    {exp.date}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-[#0b1c30]">
                    <div>{exp.title}</div>
                    {exp.note && <div className="text-[11px] text-[#6d7a72] font-normal mt-0.5">{exp.note}</div>}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-semibold text-[11px] border border-[#dce9ff]">
                      {getCategoryIcon(exp.category)}
                      {getCategoryName(exp.category)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-extrabold text-right text-[#ba1a1a]">
                    -{formatCurrency(exp.amount)} đ
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-[#6d7a72] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                      title="Xóa phiếu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
