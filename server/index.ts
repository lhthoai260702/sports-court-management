import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './prismaClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- COURTS API ---
app.get('/api/courts', async (req, res) => {
  try {
    const courts = await prisma.court.findMany();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

app.put('/api/courts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const court = await prisma.court.update({
      where: { id },
      data: req.body,
    });
    res.json(court);
  } catch (error) {
    res.status(404).json({ error: 'Court not found' });
  }
});

// --- INVOICES API ---
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { items, ...invoiceData } = req.body;
    const newInvoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        id: `#INV-${Date.now()}`,
        items: {
          create: items?.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            manualTotal: item.manualTotal,
            rentalTime: item.rentalTime,
          })) || []
        }
      },
      include: { items: true }
    });

    // Update court statistics
    const court = await prisma.court.findUnique({ where: { id: newInvoice.courtId } });
    if (court) {
      await prisma.court.update({
        where: { id: newInvoice.courtId },
        data: {
          revenueToday: court.revenueToday + newInvoice.totalAmount,
          invoicesCount: court.invoicesCount + 1,
          status: 'occupied'
        }
      });
    }

    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id } });
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const { items, ...invoiceData } = req.body;
    const oldAmount = existingInvoice.totalAmount;
    
    // For simplicity, we only update the invoice fields and not the nested items in this PUT
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: invoiceData,
      include: { items: true }
    });

    // Update court stats if court is the same
    if (existingInvoice.courtId === updatedInvoice.courtId) {
      const court = await prisma.court.findUnique({ where: { id: updatedInvoice.courtId } });
      if (court) {
        await prisma.court.update({
          where: { id: updatedInvoice.courtId },
          data: {
            revenueToday: court.revenueToday + (updatedInvoice.totalAmount - oldAmount)
          }
        });
      }
    }

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const targetInv = await prisma.invoice.findUnique({ where: { id } });
    if (targetInv) {
      await prisma.invoice.delete({ where: { id } });
      
      // Update court stats
      const court = await prisma.court.findUnique({ where: { id: targetInv.courtId } });
      if (court) {
        await prisma.court.update({
          where: { id: targetInv.courtId },
          data: {
            revenueToday: Math.max(0, court.revenueToday - targetInv.totalAmount),
            invoicesCount: Math.max(0, court.invoicesCount - 1),
            status: court.invoicesCount - 1 === 0 ? 'available' : court.status
          }
        });
      }
      res.json({ message: 'Deleted successfully' });
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// --- EXPENSES API ---
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = await prisma.expense.create({
      data: {
        ...req.body,
        id: `EXP-${Date.now()}`
      }
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// --- CATALOG API ---
app.get('/api/catalog', async (req, res) => {
  try {
    const catalogItems = await prisma.catalogItem.findMany();
    res.json(catalogItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

app.post('/api/catalog', async (req, res) => {
  try {
    const newItem = await prisma.catalogItem.create({
      data: {
        ...req.body,
        id: `CAT-${Date.now()}`
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create catalog item' });
  }
});

app.put('/api/catalog/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.catalogItem.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(404).json({ error: 'Catalog item not found' });
  }
});

app.delete('/api/catalog/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.catalogItem.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete catalog item' });
  }
});

// --- REPORTS API ---
app.get('/api/reports', async (req, res) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let invoiceWhere: any = {};
    let expenseWhere: any = {};

    if (startDate && endDate) {
      invoiceWhere.createdAt = {
        gte: startDate + ' 00:00',
        lte: endDate + ' 23:59:59'
      };
      expenseWhere.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const invoices = await prisma.invoice.findMany({ 
      where: invoiceWhere,
      include: { items: true } 
    });
    const expenses = await prisma.expense.findMany({
      where: expenseWhere
    });

    const reportsMap = new Map();

    const getOrCreateReport = (dateStr: string) => {
      if (!reportsMap.has(dateStr)) {
        reportsMap.set(dateStr, {
          id: `rep-${dateStr}`,
          date: dateStr,
          dateLabel: dateStr.split('-').reverse().join('/'),
          isToday: dateStr === new Date().toISOString().split('T')[0],
          bookingsCount: 0,
          totalRevenue: 0,
          totalExpense: 0,
          netProfit: 0,
          status: 'Hoàn Tất',
          bills: [],
          expenses: []
        });
      }
      return reportsMap.get(dateStr);
    };

    invoices.forEach((inv: any) => {
      // inv.createdAt is like '2024-10-24 07:50'
      const dateStr = inv.createdAt.split(' ')[0];
      const report = getOrCreateReport(dateStr);
      report.bookingsCount += 1;
      report.totalRevenue += inv.totalAmount;
      
      report.bills.push({
        id: inv.id,
        time: inv.createdAt.split(' ')[1] || '',
        court: inv.courtName,
        customer: inv.customerName,
        courtFee: inv.courtFee,
        serviceFee: inv.serviceFee,
        total: inv.totalAmount,
        items: inv.items
      });
    });

    expenses.forEach((exp: any) => {
      // exp.date is like '2024-10-24'
      const dateStr = exp.date;
      const report = getOrCreateReport(dateStr);
      report.totalExpense += exp.amount;
      
      report.expenses.push({
        id: exp.id,
        title: exp.title,
        creator: exp.creator,
        amount: exp.amount,
        note: exp.note,
        category: exp.category
      });
    });

    const reportsArray = Array.from(reportsMap.values()).map((r: any) => {
      r.netProfit = r.totalRevenue - r.totalExpense;
      return r;
    });

    // Sort by date descending
    reportsArray.sort((a, b) => b.date.localeCompare(a.date));

    res.json(reportsArray);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Serve static frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const seedDatabase = async () => {
  const courtCount = await prisma.court.count();
  if (courtCount === 0) {
    console.log('Seeding default courts...');
    const defaultCourts = [
      {"id":"pb-02","code":"PB-02","name":"Pickleball 2","type":"pickleball","subType":"SÂN PICKLEBALL","description":"Sân thi đấu tiêu chuẩn ProCushion","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":180000,"timeSlot":"08:00 - 10:00","isFeatured":true},
      {"id":"cl-05","code":"CL-05","name":"Cầu lông 5","type":"badminton","subType":"SÂN CẦU LÔNG","description":"Sân đơn / đôi tiêu chuẩn BWF (Thảm PVC)","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":120000,"timeSlot":"09:00 - 11:00","isFeatured":true},
      {"id":"pb-01","code":"PB-01","name":"Pickleball 1","type":"pickleball","subType":"SÂN PICKLEBALL","description":"Sân trung tâm mặt thảm tiêu chuẩn USAPA","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":180000,"timeSlot":"08:00 - 10:00","isFeatured":false},
      {"id":"cl-04","code":"CL-04","name":"Cầu lông 4","type":"badminton","subType":"SÂN CẦU LÔNG","description":"Sân thảm tiêu chuẩn đôi","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":120000,"timeSlot":"14:00 - 16:00","isFeatured":false},
      {"id":"cl-03","code":"CL-03","name":"Cầu lông 3","type":"badminton","subType":"SÂN CẦU LÔNG","description":"Sân cầu lông cao cấp sàn gỗ chống chấn","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":130000,"timeSlot":"16:00 - 18:00","isFeatured":false},
      {"id":"cl-02","code":"CL-02","name":"Cầu lông 2","type":"badminton","subType":"SÂN CẦU LÔNG","description":"Sân thảm chống trượt chuẩn thi đấu","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":120000,"timeSlot":"18:00 - 20:00","isFeatured":false},
      {"id":"cl-01","code":"CL-01","name":"Cầu lông 1","type":"badminton","subType":"SÂN CẦU LÔNG","description":"VIP Thảm Yonex chính hãng","revenueToday":0,"invoicesCount":0,"status":"available","hourlyRate":140000,"timeSlot":"06:00 - 08:00","isFeatured":false}
    ];
    for (const c of defaultCourts) {
      await prisma.court.create({ data: c });
    }
    console.log('Default courts seeded.');
  }
};

app.listen(port, async () => {
  await seedDatabase();
  console.log(`Server running at http://localhost:${port}`);
});
