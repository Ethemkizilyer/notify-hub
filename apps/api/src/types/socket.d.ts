import type { Role } from '@/generated/prisma/enums';

export interface AppSocketData {
  user: {
    id: string;
    role: Role;
  };
}
