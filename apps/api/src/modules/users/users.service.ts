import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getSkip } from '@/utils/pagination';
import { PUBLIC_USER_SELECT } from '../auth/auth.service';
import type { ListUsersQuery } from './users.schema';

export async function listUsers({ page, limit, search }: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: PUBLIC_USER_SELECT,
      skip: getSkip(page, limit),
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}
