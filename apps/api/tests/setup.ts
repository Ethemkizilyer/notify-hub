import { afterAll, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { closeNotificationQueue } from '@/jobs/notification.queue';

beforeEach(async () => {
  await prisma.$executeRaw`
    TRUNCATE "User", "Product", "Order", "OrderItem", "Notification", "RefreshToken"
    RESTART IDENTITY CASCADE
  `;
});

afterAll(async () => {
  await closeNotificationQueue();
});
// Tabloları tek tek saymak yerine hepsini yazdık — yeni model eklenince buraya da eklemek gerekir, bunu not edelim.
