import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthLayout } from '../modules/auth/AuthLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';

const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const CounterDashboard = lazy(() => import('../modules/billing/CounterDashboard').then(m => ({ default: m.CounterDashboard })));
const LiveOrders = lazy(() => import('../modules/orders/LiveOrders').then(m => ({ default: m.LiveOrders })));
const AdminDashboard = lazy(() => import('../modules/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminMenuManager = lazy(() => import('../modules/admin/AdminMenuManager').then(m => ({ default: m.AdminMenuManager })));
const WaiterDashboard = lazy(() => import('../modules/orders/WaiterDashboard').then(m => ({ default: m.WaiterDashboard })));
const KitchenDashboard = lazy(() => import('../modules/kitchen/KitchenDashboard').then(m => ({ default: m.KitchenDashboard })));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="p-8 space-y-4">
    <Skeleton className="h-12 w-64 mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<AuthLayout allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenuManager />} />
            </Route>

            <Route element={<AuthLayout allowedRoles={['waiter', 'admin']} />}>
              <Route path="/waiter" element={<WaiterDashboard />} />
              <Route path="/tracker" element={<LiveOrders />} />
            </Route>
            
            <Route element={<AuthLayout allowedRoles={['kitchen', 'admin']} />}>
              <Route path="/kitchen" element={<KitchenDashboard />} />
            </Route>

            <Route element={<AuthLayout allowedRoles={['counter', 'admin']} />}>
              <Route path="/counter" element={<CounterDashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}
