import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = [
    { name: 'Revive', price: 15000, category: 'drink', unit: 'chai' },
    { name: 'Nước suối', price: 10000, category: 'drink', unit: 'chai' },
    { name: 'Quả cầu lông vina', price: 20000, category: 'equipment', unit: 'quả' },
    { name: 'HY', price: 15000, category: 'drink', unit: 'chai' },
    { name: 'Trà đá', price: 5000, category: 'drink', unit: 'ly' }
  ];

  for (const item of items) {
    const existing = await prisma.catalogItem.findFirst({
      where: { name: { contains: item.name, mode: 'insensitive' } }
    });
    
    if (!existing) {
      await prisma.catalogItem.create({ data: item });
      console.log(`Created: ${item.name}`);
    } else {
      console.log(`Already exists: ${existing.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
