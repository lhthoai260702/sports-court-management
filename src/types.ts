export type CourtType = 'pickleball' | 'badminton';

export interface Court {
  id: string;
  code: string;
  name: string;
  type: CourtType;
  subType: string;
  description: string;
  revenueToday: number;
  invoicesCount: number;
  status: 'available' | 'occupied' | 'maintenance';
  hourlyRate: number;
  timeSlot?: string;
  isFeatured?: boolean;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'court' | 'drink' | 'food' | 'accessory' | 'other';
  manualTotal?: number;
  rentalTime?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: 'court' | 'drink' | 'food' | 'accessory' | 'other' | string;
  unit: string;
  isDefault?: boolean;
}

export interface Invoice {
  id: string;
  courtId: string;
  courtName: string;
  timeSlot: string;
  customerName: string;
  note?: string;
  items: BillItem[];
  totalAmount: number;
  courtFee: number;
  serviceFee: number;
  paymentMethod: 'qr' | 'cash';
  status: 'paid' | 'pending';
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'electricity' | 'salary' | 'maintenance' | 'water' | 'other';
  amount: number;
  creator: string;
  date: string;
  note?: string;
}

export interface DailyReportDetail {
  date: string;
  dateLabel: string;
  isToday?: boolean;
  bookingsCount: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  status: string;
  bills: {
    id: string;
    time: string;
    court: string;
    customer: string;
    courtFee: number;
    serviceFee: number;
    total: number;
  }[];
  expenses: {
    id: string;
    title: string;
    note: string;
    creator: string;
    amount: number;
  }[];
  summaryText?: string;
}

export type ActiveTab =
  | 'tong-ket-so'
  | 'thu-chi-san'
  | 'thu-chi-van-hanh'
  | 'bao-cao-thong-ke'
  | 'quan-ly-san-pham'
  | 'so-do-san';
