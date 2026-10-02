import prisma from './prismaClient';
import { INITIAL_COURTS, INITIAL_INVOICES, INITIAL_EXPENSES, ITEM_CATALOG, DAILY_REPORTS } from '../src/data/mockData';

async function main() {
  console.log('Seeding data...');

  // 1. Courts
  for (const court of INITIAL_COURTS) {
    await prisma.court.upsert({
      where: { code: court.code },
      update: {},
      create: {
        id: court.id,
        code: court.code,
        name: court.name,
        type: court.type,
        subType: court.subType,
        description: court.description,
        revenueToday: court.revenueToday,
        invoicesCount: court.invoicesCount,
        status: court.status,
        hourlyRate: court.hourlyRate,
        timeSlot: court.timeSlot,
        isFeatured: court.isFeatured || false,
      },
    });
  }

  // 2. Catalog
  for (const item of ITEM_CATALOG) {
    await prisma.catalogItem.create({
      data: {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        unit: item.unit,
      },
    });
  }

  // 3. Invoices & BillItems
  for (const inv of INITIAL_INVOICES) {
    const existing = await prisma.invoice.findUnique({ where: { id: inv.id } });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          id: inv.id,
          courtId: inv.courtId,
          courtName: inv.courtName,
          timeSlot: inv.timeSlot,
          customerName: inv.customerName,
          note: inv.note,
          totalAmount: inv.totalAmount,
          courtFee: inv.courtFee,
          serviceFee: inv.serviceFee,
          paymentMethod: inv.paymentMethod,
          status: inv.status,
          createdAt: inv.createdAt,
          items: {
            create: inv.items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              category: item.category,
              manualTotal: item.manualTotal,
              rentalTime: item.rentalTime,
            }))
          }
        }
      });
    }
  }

  // 4. Expenses
  for (const exp of INITIAL_EXPENSES) {
    const existing = await prisma.expense.findUnique({ where: { id: exp.id } });
    if (!existing) {
      await prisma.expense.create({
        data: {
          id: exp.id,
          title: exp.title,
          category: exp.category,
          amount: exp.amount,
          creator: exp.creator,
          date: exp.date,
          note: exp.note,
        }
      });
    }
  }

  // 5. Daily Reports
  for (const rep of DAILY_REPORTS) {
    const existing = await prisma.dailyReportDetail.findUnique({ where: { date: rep.date } });
    if (!existing) {
      await prisma.dailyReportDetail.create({
        data: {
          date: rep.date,
          dateLabel: rep.dateLabel,
          isToday: rep.isToday || false,
          bookingsCount: rep.bookingsCount,
          totalRevenue: rep.totalRevenue,
          totalExpense: rep.totalExpense,
          netProfit: rep.netProfit,
          status: rep.status,
          summaryText: rep.summaryText,
          bills: {
            create: rep.bills.map(b => ({
              billId: b.id,
              time: b.time,
              court: b.court,
              customer: b.customer,
              courtFee: b.courtFee,
              serviceFee: b.serviceFee,
              total: b.total,
            }))
          },
          expenses: {
            create: rep.expenses.map(e => ({
              expenseId: e.id,
              title: e.title,
              note: e.note || '',
              creator: e.creator,
              amount: e.amount,
            }))
          }
        }
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
