import bcrypt from 'bcryptjs';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const SEED_PRODUCTS = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Wireless Headphones',
    description: 'Noise cancelling over-ear headphones',
    priceCents: 12999,
    stock: 25,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Mechanical Keyboard',
    description: 'Hot-swappable mechanical keyboard',
    priceCents: 8999,
    stock: 40,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    priceCents: 3499,
    stock: 60,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI',
    priceCents: 4599,
    stock: 30,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: '27-inch 4K Monitor',
    description: '27" IPS 4K monitor, 60Hz',
    priceCents: 28999,
    stock: 15,
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: 'HD Webcam',
    description: 'Full HD webcam with autofocus',
    priceCents: 5499,
    stock: 20,
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    name: 'Laptop Stand',
    description: 'Aluminium adjustable laptop stand',
    priceCents: 1999,
    stock: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    name: 'Earbuds Pro',
    description: 'True wireless earbuds with ANC',
    priceCents: 7999,
    stock: 35,
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    name: 'LED Desk Lamp',
    description: 'Dimmable LED desk lamp',
    priceCents: 2499,
    stock: 45,
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    name: 'Cable Management Kit',
    description: 'Adhesive cable clips and ties',
    priceCents: 1499,
    stock: 80,
  },
];

async function main() {
  const adminPassword = env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD is not set in apps/api/.env');
  }

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash('password123', 10),
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@notifyhub.dev' },
    update: {},
    create: {
      email: 'admin@notifyhub.dev',
      passwordHash: adminHash,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@notifyhub.dev' },
    update: {},
    create: {
      email: 'user@notifyhub.dev',
      passwordHash: userHash,
      fullName: 'Demo User',
      role: 'USER',
    },
  });

  for (const product of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  logger.info('Seed completed');
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'Seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
