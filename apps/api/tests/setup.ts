import { beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

beforeEach(async () => {
  await prisma.$executeRaw`
    TRUNCATE "User", "Product", "Order", "OrderItem", "Notification", "RefreshToken"
    RESTART IDENTITY CASCADE
  `;
});

// Tabloları tek tek saymak yerine hepsini yazdık — yeni model eklenince buraya da eklemek gerekir, bunu not edelim.
