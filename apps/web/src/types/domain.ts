import type { NotificationType, OrderStatus, Role } from '@notifyhub/shared';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  product?: { id: string; name: string; priceCents: number };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
  user?: AuthUser;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}
