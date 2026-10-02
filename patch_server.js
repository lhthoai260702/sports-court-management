const fs = require('fs');

let serverCode = fs.readFileSync('server/index.ts', 'utf-8');

const newReportsApi = `// --- REPORTS API ---
app.get('/api/reports', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { items: true } });
    const expenses = await prisma.expense.findMany();

    const reportsMap = new Map();

    const getOrCreateReport = (dateStr) => {
      if (!reportsMap.has(dateStr)) {
        reportsMap.set(dateStr, {
          id: \`rep-\${dateStr}\`,
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

    invoices.forEach(inv => {
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
        total: inv.totalAmount
      });
    });

    expenses.forEach(exp => {
      const dateStr = exp.date;
      const report = getOrCreateReport(dateStr);
      report.totalExpense += exp.amount;
      
      report.expenses.push({
        id: exp.id,
        title: exp.title,
        creator: exp.creator,
        amount: exp.amount,
        note: exp.note
      });
    });

    const reportsArray = Array.from(reportsMap.values()).map(r => {
      r.netProfit = r.totalRevenue - r.totalExpense;
      return r;
    });

    reportsArray.sort((a, b) => b.date.localeCompare(a.date));

    res.json(reportsArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});`;

serverCode = serverCode.replace(/\/\/ --- REPORTS API ---[\s\S]*?app\.listen/g, newReportsApi + '\n\napp.listen');

fs.writeFileSync('server/index.ts', serverCode);
console.log("Patched server/index.ts");
