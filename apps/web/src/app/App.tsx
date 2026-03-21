import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../modules/auth/LoginPage';
import { AuthLayout } from '../modules/auth/AuthLayout';
import { CounterDashboard } from '../modules/billing/CounterDashboard';
import { LiveOrders } from '../modules/orders/LiveOrders';
import { AdminDashboard } from '../modules/admin/AdminDashboard';
import { AdminMenuManager } from '../modules/admin/AdminMenuManager';
import { WaiterDashboard } from '../modules/orders/WaiterDashboard';
import { KitchenDashboard } from '../modules/kitchen/KitchenDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
      </Router>
    </QueryClientProvider>
  );
}
