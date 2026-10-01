import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DailyClosingView } from './components/DailyClosingView';
import { DailyClosingSummaryModal } from './components/DailyClosingSummaryModal';
import { CourtOverviewView } from './components/CourtOverviewView';
import { CourtDetailView } from './components/CourtDetailView';
import { ReportsView } from './components/ReportsView';
import { CourtInvoicesView } from './components/CourtInvoicesView';
import { OperatingExpensesView } from './components/OperatingExpensesView';
import { ProductCatalogView } from './components/ProductCatalogView';
import { QuickBillModal } from './components/QuickBillModal';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { INITIAL_COURTS, INITIAL_INVOICES, INITIAL_EXPENSES, ITEM_CATALOG } from './data/mockData';
import { ActiveTab, Court, Invoice, Expense, CatalogItem } from './types';

export default function App() {
  // Single-user end of day workflow: 'tong-ket-so' is the primary home screen
  const [activeTab, setActiveTab] = useState<ActiveTab>('tong-ket-so');
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(ITEM_CATALOG);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // Modals state
  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [isDailyClosingModalOpen, setIsDailyClosingModalOpen] = useState(false);

  // Overall today's revenue calculation
  const todayRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Handle saving new invoice
  const handleSaveInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);

    // Update court revenue
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id === newInv.courtId) {
          return {
            ...c,
            revenueToday: c.revenueToday + newInv.totalAmount,
            invoicesCount: c.invoicesCount + 1,
            status: 'occupied',
          };
        }
        return c;
      })
    );
  };

  // Handle updating existing invoice
  const handleUpdateInvoice = (updatedInv: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv)));

    // Recalculate court revenue
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id === updatedInv.courtId) {
          const courtInvoices = invoices
            .map((inv) => (inv.id === updatedInv.id ? updatedInv : inv))
            .filter((inv) => inv.courtId === c.id);
          const newRevenue = courtInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
          return {
            ...c,
            revenueToday: newRevenue,
          };
        }
        return c;
      })
    );
  };

  // Handle deleting invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    const targetInv = invoices.find((inv) => inv.id === invoiceId);
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));

    if (targetInv) {
      setCourts((prev) =>
        prev.map((c) => {
          if (c.id === targetInv.courtId) {
            const remainingCourtInvoices = invoices.filter(
              (inv) => inv.id !== invoiceId && inv.courtId === c.id
            );
            const newRevenue = remainingCourtInvoices.reduce(
              (sum, inv) => sum + inv.totalAmount,
              0
            );
            return {
              ...c,
              revenueToday: newRevenue,
              invoicesCount: Math.max(0, remainingCourtInvoices.length),
            };
          }
          return c;
        })
      );
    }
  };

  // Handle adding new expense
  const handleAddExpense = (newExp: Expense) => {
    setExpenses((prev) => [newExp, ...prev]);
  };

  // Handle deleting expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handle catalog product items
  const handleAddCatalogItem = (newItem: CatalogItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateCatalogItem = (updated: CatalogItem) => {
    setCatalogItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalogItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
    setActiveTab('so-do-san');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#85f8c4] selection:text-[#005137]">
      {/* Top Header - Tailored for 1 single owner/manager */}
      <Header
        todayRevenue={todayRevenue}
        onOpenClosingReport={() => setIsDailyClosingModalOpen(true)}
        selectedDate="24/10/2024"
      />

      {/* Main Layout Shell */}
      <div className="flex pt-16 min-h-screen">
        {/* Persistent Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            // If switching away from individual court detail, reset
            if (tab !== 'so-do-san') {
              setSelectedCourt(null);
            }
          }}
          activeCourtsCount={courts.filter((c) => c.status === 'occupied').length || 7}
          totalCourtsCount={courts.length || 7}
        />

        {/* Content View Area */}
        <main className="flex-1 ml-64 p-5 sm:p-8 overflow-y-auto max-w-7xl">
          {/* TAB 1 (PRIMARY): TỔNG KẾT SỔ CUỐI NGÀY & NHẬP TỪNG BILL */}
          {activeTab === 'tong-ket-so' && (
            <DailyClosingView
              courts={courts}
              invoices={invoices}
              expenses={expenses}
              catalogItems={catalogItems}
              onSaveInvoice={handleSaveInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onPrintInvoice={(inv) => setPrintableInvoice(inv)}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {/* TAB 2: SỔ HÓA ĐƠN CHI TIẾT */}
          {activeTab === 'thu-chi-san' && (
            <CourtInvoicesView
              invoices={invoices}
              courts={courts}
              catalogItems={catalogItems}
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onPrintInvoice={(inv) => setPrintableInvoice(inv)}
              onNewBillClick={() => setIsQuickBillOpen(true)}
            />
          )}

          {/* TAB 3: THU - CHI VẬN HÀNH */}
          {activeTab === 'thu-chi-van-hanh' && (
            <OperatingExpensesView
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* TAB 4: BÁO CÁO & THỐNG KÊ DOANH THU */}
          {activeTab === 'bao-cao-thong-ke' && <ReportsView />}

          {/* TAB 5: BẢNG GIÁ & DỊCH VỤ SÂN */}
          {activeTab === 'quan-ly-san-pham' && (
            <ProductCatalogView
              items={catalogItems}
              onAddItem={handleAddCatalogItem}
              onUpdateItem={handleUpdateCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
            />
          )}

          {/* TAB 6: SƠ ĐỒ SÂN (THAM KHẢO) */}
          {activeTab === 'so-do-san' && (
            <>
              {selectedCourt ? (
                <CourtDetailView
                  key={selectedCourt.id}
                  court={selectedCourt}
                  invoices={invoices.filter((inv) => inv.courtId === selectedCourt.id)}
                  catalogItems={catalogItems}
                  onBack={() => setSelectedCourt(null)}
                  onSaveInvoice={handleSaveInvoice}
                  onUpdateInvoice={handleUpdateInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onPrintInvoice={(inv) => setPrintableInvoice(inv)}
                  onNavigateToProducts={() => setActiveTab('quan-ly-san-pham')}
                />
              ) : (
                <CourtOverviewView
                  courts={courts}
                  onSelectCourt={handleCourtSelect}
                  onQuickBillClick={() => setIsQuickBillOpen(true)}
                  onQuickExpenseClick={() => setIsQuickExpenseOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Quick Bill Modal (if triggered from other places) */}
      <QuickBillModal
        courts={courts}
        catalogItems={catalogItems}
        isOpen={isQuickBillOpen}
        onClose={() => setIsQuickBillOpen(false)}
        onSaveInvoice={handleSaveInvoice}
        onPrintInvoice={(inv) => setPrintableInvoice(inv)}
      />

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Invoice Print & Receipt Modal */}
      <InvoicePrintModal
        invoice={printableInvoice}
        onClose={() => setPrintableInvoice(null)}
      />

      {/* End-of-Day Closing Statement Modal */}
      <DailyClosingSummaryModal
        isOpen={isDailyClosingModalOpen}
        onClose={() => setIsDailyClosingModalOpen(false)}
        dateStr="24/10/2024 (Hôm nay)"
        invoices={invoices}
        expenses={expenses}
        courts={courts}
      />
    </div>
  );
}
