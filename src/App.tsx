import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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
import { ActiveTab, Court, Invoice, Expense, CatalogItem } from './types';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('so-do-san');
  const [courts, setCourts] = useState<Court[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [isDailyClosingModalOpen, setIsDailyClosingModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/courts`).then(res => res.json()),
      fetch(`${API_BASE}/invoices`).then(res => res.json()),
      fetch(`${API_BASE}/expenses`).then(res => res.json()),
      fetch(`${API_BASE}/catalog`).then(res => res.json())
    ]).then(([courtsData, invoicesData, expensesData, catalogData]) => {
      setCourts(courtsData);
      setInvoices(invoicesData);
      setExpenses(expensesData);
      setCatalogItems(catalogData);
    }).catch(err => console.error("Failed to fetch initial data", err));
  }, []);

  const todayRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleSaveInvoice = async (newInv: Invoice) => {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInv)
    });
    if (res.ok) {
      const savedInvoice = await res.json();
      setInvoices(prev => [savedInvoice, ...prev]);
      const courtsRes = await fetch(`${API_BASE}/courts`);
      setCourts(await courtsRes.json());
    }
  };

  const handleUpdateInvoice = async (updatedInv: Invoice) => {
    const res = await fetch(`${API_BASE}/invoices/${updatedInv.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedInv)
    });
    if (res.ok) {
      const savedInvoice = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === savedInvoice.id ? savedInvoice : inv));
      const courtsRes = await fetch(`${API_BASE}/courts`);
      setCourts(await courtsRes.json());
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const res = await fetch(`${API_BASE}/invoices/${invoiceId}`, { method: 'DELETE' });
    if (res.ok) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      const courtsRes = await fetch(`${API_BASE}/courts`);
      setCourts(await courtsRes.json());
    }
  };

  const handleAddExpense = async (newExp: Expense) => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExp)
    });
    if (res.ok) {
      const savedExpense = await res.json();
      setExpenses(prev => [savedExpense, ...prev]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleAddCatalogItem = async (newItem: CatalogItem) => {
    const res = await fetch(`${API_BASE}/catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      const savedItem = await res.json();
      setCatalogItems(prev => [savedItem, ...prev]);
    }
  };

  const handleUpdateCatalogItem = async (updated: CatalogItem) => {
    const res = await fetch(`${API_BASE}/catalog/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      const savedItem = await res.json();
      setCatalogItems(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
    }
  };

  const handleDeleteCatalogItem = async (id: string) => {
    const res = await fetch(`${API_BASE}/catalog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCatalogItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
    setActiveTab('so-do-san');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#85f8c4] selection:text-[#005137]">
      <Header
        todayRevenue={todayRevenue}
        onOpenClosingReport={() => setIsDailyClosingModalOpen(true)}
        selectedDate="24/10/2024"
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex pt-16 min-h-screen relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'so-do-san') {
              setSelectedCourt(null);
            }
            setIsSidebarOpen(false); // Close sidebar on mobile after tab select
          }}
          activeCourtsCount={courts.filter((c) => c.status === 'occupied').length || 0}
          totalCourtsCount={courts.length || 0}
          isOpen={isSidebarOpen}
        />

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-64 p-3 sm:p-5 lg:p-8 overflow-y-auto w-full transition-all duration-300">
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

          {activeTab === 'thu-chi-van-hanh' && (
            <OperatingExpensesView
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'bao-cao-thong-ke' && <ReportsView />}

          {activeTab === 'quan-ly-san-pham' && (
            <ProductCatalogView
              items={catalogItems}
              onAddItem={handleAddCatalogItem}
              onUpdateItem={handleUpdateCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
            />
          )}

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
                  invoices={invoices}
                  onSelectCourt={handleCourtSelect}
                  onQuickBillClick={() => setIsQuickBillOpen(true)}
                  onQuickExpenseClick={() => setIsQuickExpenseOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      <QuickBillModal
        courts={courts}
        catalogItems={catalogItems}
        isOpen={isQuickBillOpen}
        onClose={() => setIsQuickBillOpen(false)}
        onSaveInvoice={handleSaveInvoice}
        onPrintInvoice={(inv) => setPrintableInvoice(inv)}
      />

      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <InvoicePrintModal
        invoice={printableInvoice}
        onClose={() => setPrintableInvoice(null)}
      />

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
