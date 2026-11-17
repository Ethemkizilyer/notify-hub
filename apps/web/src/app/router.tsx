import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotFoundPage } from '@/components/NotFoundPage';
import { RequireAuth } from '@/components/RequireAuth';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      {
        path: 'login',
        lazy: () =>
          import('@/features/auth/pages/LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: 'register',
        lazy: () =>
          import('@/features/auth/pages/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
      },
      {
        path: 'products',
        lazy: () =>
          import('@/features/products/pages/ProductsPage').then((m) => ({
            Component: m.ProductsPage,
          })),
      },
      {
        path: 'products/:id',
        lazy: () =>
          import('@/features/products/pages/ProductDetailPage').then((m) => ({
            Component: m.ProductDetailPage,
          })),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'cart',
            lazy: () =>
              import('@/features/cart/pages/CartPage').then((m) => ({ Component: m.CartPage })),
          },
          {
            path: 'orders',
            lazy: () =>
              import('@/features/orders/pages/OrdersPage').then((m) => ({
                Component: m.OrdersPage,
              })),
          },
          {
            path: 'orders/:id',
            lazy: () =>
              import('@/features/orders/pages/OrderDetailPage').then((m) => ({
                Component: m.OrderDetailPage,
              })),
          },
        ],
      },
      {
        element: <RequireAuth role="ADMIN" />,
        children: [
          {
            path: 'admin',
            lazy: () =>
              import('@/features/admin/pages/AdminDashboardPage').then((m) => ({
                Component: m.AdminDashboardPage,
              })),
          },
          {
            path: 'admin/products',
            lazy: () =>
              import('@/features/admin/pages/AdminProductsPage').then((m) => ({
                Component: m.AdminProductsPage,
              })),
          },
          {
            path: 'admin/orders',
            lazy: () =>
              import('@/features/admin/pages/AdminOrdersPage').then((m) => ({
                Component: m.AdminOrdersPage,
              })),
          },
          {
            path: 'admin/users',
            lazy: () =>
              import('@/features/admin/pages/AdminUsersPage').then((m) => ({
                Component: m.AdminUsersPage,
              })),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
