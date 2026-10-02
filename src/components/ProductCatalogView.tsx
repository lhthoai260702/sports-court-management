import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Droplet,
  Coffee,
  Sandwich,
  CircleDot,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { CatalogItem } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmModal } from './ConfirmModal';

interface ProductCatalogViewProps {
  items: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
  onUpdateItem: (item: CatalogItem) => void;
  onDeleteItem: (id: string) => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<CatalogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'drink' | 'food' | 'accessory' | 'other'>('drink');
  const [formUnit, setFormUnit] = useState('chai');
  const [formPrice, setFormPrice] = useState<number>(20000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('drink');
    setFormUnit('chai');
    setFormPrice(20000);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category as 'drink' | 'food' | 'accessory' | 'other');
    setFormUnit(item.unit);
    setFormPrice(item.price);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    if (editingItem) {
      const updated: CatalogItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        unit: formUnit.trim() || 'cái',
        price: formPrice,
      };
      onUpdateItem(updated);
      showToast(`Đã cập nhật "${updated.name}" thành công!`);
    } else {
      const newItem: CatalogItem = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        unit: formUnit.trim() || 'cái',
        price: formPrice,
      };
      onAddItem(newItem);
      showToast(`Đã thêm sản phẩm "${newItem.name}" vào danh mục!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteItem) {
      onDeleteItem(confirmDeleteItem.id);
      showToast(`Đã xóa "${confirmDeleteItem.name}" khỏi danh mục!`);
      setConfirmDeleteItem(null);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const getItemIcon = (name: string, category: string) => {
    if (name.toLowerCase().includes('nước suối') || category === 'drink') {
      return <Droplet className="w-4 h-4 text-[#316bf3]" />;
    }
    if (name.toLowerCase().includes('revive') || name.toLowerCase().includes('redbull')) {
      return <Coffee className="w-4 h-4 text-[#f59e0b]" />;
    }
    if (name.toLowerCase().includes('bánh mì') || category === 'food') {
      return <Sandwich className="w-4 h-4 text-[#ea580c]" />;
    }
    return <CircleDot className="w-4 h-4 text-[#006948]" />;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'drink':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff]">
            Nước giải khát
          </span>
        );
      case 'food':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5]">
            Đồ ăn nhanh
          </span>
        );
      case 'accessory':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f0fdf4] text-[#006948] border border-[#dcfce7]">
            Cầu/Bóng & Dụng cụ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
            Dịch vụ khác
          </span>
        );
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const drinkCount = items.filter((i) => i.category === 'drink').length;
  const foodCount = items.filter((i) => i.category === 'food').length;
  const accessoryCount = items.filter((i) => i.category === 'accessory').length;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#006948] text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#85f8c4]" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Quản Lý Sản Phẩm & Giá Bán
          </h1>
          <p className="text-xs sm:text-sm text-[#6d7a72] mt-0.5">
            Cấu hình danh mục đồ uống, đồ ăn nhẹ, bóng/cầu thi đấu và bảng giá bán lẻ tại sân
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Tổng sản phẩm
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] mt-1">
              {items.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-[#006948] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Nước giải khát
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0051d5] mt-1">
              {drinkCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Đồ ăn nhanh
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#ea580c] mt-1">
              {foodCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
            <Sandwich className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Cầu/Bóng & Dụng cụ
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006948] mt-1">
              {accessoryCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#85f8c4]/30 text-[#006948] flex items-center justify-center">
            <CircleDot className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6d7a72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm (vd: Aquafina, Revive, bóng...)..."
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm text-[#0b1c30] focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'drink', label: 'Đồ uống' },
            { id: 'food', label: 'Đồ ăn' },
            { id: 'accessory', label: 'Cầu / Bóng / Dụng cụ' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat.id
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-[#545c72] hover:bg-[#dce9ff]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#006948]" />
            <h2 className="text-base font-bold text-[#0b1c30]">
              Danh Sách Mặt Hàng Đang Bán ({filteredItems.length})
            </h2>
          </div>
          <span className="text-xs text-[#6d7a72]">
            Các sản phẩm này sẽ hiển thị trong mục "thêm món / dịch vụ khác" khi thu ngân tính tiền
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eff4ff] text-[#3d4a42]">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Tên Sản Phẩm</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Phân Loại</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-center">ĐVT</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right">Giá Bán (VNĐ)</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-center w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#0b1c30]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                        {getItemIcon(item.name, item.category)}
                      </div>
                      <span className="font-bold text-[#0b1c30]">{item.name}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-sm">
                    {getCategoryBadge(item.category)}
                  </td>

                  <td className="px-5 py-3.5 text-xs text-center font-bold text-[#545c72]">
                    <span className="bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#dce9ff]">
                      {item.unit}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm font-extrabold text-right text-[#006948]">
                    {formatCurrency(item.price)} đ
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-[#0051d5] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                        title="Chỉnh sửa sản phẩm & giá"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteItem(item)}
                        className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6d7a72]">
                    <Package className="w-8 h-8 mx-auto text-[#bccac0] mb-2" />
                    <p className="text-sm font-semibold">Không tìm thấy sản phẩm nào</p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="mt-2 text-xs text-[#006948] font-bold underline"
                    >
                      + Bấm vào đây để thêm sản phẩm mới
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#85f8c4]/40 text-[#006948] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30]">
                  {editingItem ? 'Chỉnh Sửa Sản Phẩm & Giá' : 'Thêm Sản Phẩm Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">
                  Tên Sản Phẩm / Món <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Vd: Nước suối Lavie 500ml, Trứng luộc, Băng trán..."
                  className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                />
              </div>

              {/* Category and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-[#3d4a42]">Phân Loại</label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as 'drink' | 'food' | 'accessory' | 'other')
                    }
                    className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                  >
                    <option value="drink">Nước giải khát</option>
                    <option value="food">Đồ ăn nhanh</option>
                    <option value="accessory">Cầu/Bóng/Dụng cụ</option>
                    <option value="other">Dịch vụ khác</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-[#3d4a42]">Đơn Vị Tính</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Chai, Lon, Quả, Cái, Ống..."
                    className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">
                  Giá Bán Niêm Yết (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CurrencyInput
                    required
                    value={formPrice}
                    onChange={(val) => setFormPrice(Number(val) || 0)}
                    className="w-full pl-3.5 pr-8 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-base font-extrabold text-[#006948] focus:outline-none focus:border-[#006948]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#006948]">
                    đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a42] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  {editingItem ? 'Lưu' : 'thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteItem}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa "${confirmDeleteItem?.name}" khỏi danh mục bán hàng?`}
        confirmText="Xóa sản phẩm"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteItem(null)}
      />
    </div>
  );
};
