import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if superadmin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@artbudget.com' },
  });

  if (existingAdmin) {
    console.log('✅ Superadmin already exists');
    return;
  }

  // Create superadmin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superadmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'admin@artbudget.com',
      password: hashedPassword,
    },
  });

  // Create dashboard for superadmin
  await prisma.dashboard.create({
    data: {
      userId: superadmin.userId,
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    },
  });

  console.log('✅ Superadmin created successfully!');
  console.log('📧 Email: admin@artbudget.com');
  console.log('🔑 Password: admin123');
  console.log('👤 Username: superadmin');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







