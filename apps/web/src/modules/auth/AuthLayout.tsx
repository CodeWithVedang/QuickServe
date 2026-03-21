import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';
import { Loader2, LogOut, UtensilsCrossed, ChefHat, IndianRupee, LayoutDashboard, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface AuthLayoutProps {
  allowedRoles?: Role[];
}

export function AuthLayout({ allowedRoles }: AuthLayoutProps) {
  const { user, isLoading, checkAuth, signOut } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Premium vibrant header */}
      <header className="bg-white shadow-sm border-b-4" style={{ borderColor: 'var(--color-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <span className="text-2xl font-black uppercase flex items-center tracking-tighter" style={{ color: 'var(--color-primary)' }}>
                <UtensilsCrossed className="w-6 h-6 mr-1" />
                QuickServe<span className="text-gray-800 ml-1">India</span>
              </span>
              
              {/* Organized Menu bar based on Role */}
              {user.role === 'admin' ? (
                <nav className="hidden md:flex space-x-2 ml-6">
                  <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/admin' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <LayoutDashboard className="inline w-4 h-4 mr-2" /> Board
                  </Link>
                  <Link to="/tracker" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/tracker' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Activity className="inline w-4 h-4 mr-2" /> Live
                  </Link>
                  <Link to="/waiter" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/waiter' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <UtensilsCrossed className="inline w-4 h-4 mr-2" /> Orders
                  </Link>
                  <Link to="/kitchen" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/kitchen' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ChefHat className="inline w-4 h-4 mr-2" /> Kitchen
                  </Link>
                  <Link to="/admin/menu" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/admin/menu' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <UtensilsCrossed className="inline w-4 h-4 mr-2" /> Setup Menu
                  </Link>
                  <Link to="/counter" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/counter' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <IndianRupee className="inline w-4 h-4 mr-2" /> Billing
                  </Link>
                </nav>
              ) : user.role === 'waiter' ? (
                <nav className="hidden md:flex space-x-2 ml-6">
                  <Link to="/waiter" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/waiter' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <UtensilsCrossed className="inline w-4 h-4 mr-2" /> New Order
                  </Link>
                  <Link to="/tracker" className={`px-4 py-2 rounded-lg text-sm font-bold ${location.pathname === '/tracker' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Activity className="inline w-4 h-4 mr-2" /> Track Orders
                  </Link>
                </nav>
              ) : (
                <span className="ml-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                  {user.role} Portal
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-gray-900 leading-none">{user.name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline-block font-semibold">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Nav for Admin & Waiter */}
      {user.role === 'admin' && (
        <div className="md:hidden bg-white border-b overflow-x-auto">
           <nav className="flex p-2 space-x-2 min-w-max">
             <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Board</Link>
             <Link to="/tracker" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Tracker</Link>
             <Link to="/waiter" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Orders</Link>
             <Link to="/kitchen" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Kitchen</Link>
             <Link to="/admin/menu" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Setup Menu</Link>
             <Link to="/counter" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Billing</Link>
           </nav>
        </div>
      )}
      {user.role === 'waiter' && (
        <div className="md:hidden bg-white border-b overflow-x-auto">
           <nav className="flex p-2 space-x-2 min-w-max">
             <Link to="/waiter" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">New Order</Link>
             <Link to="/tracker" className="px-3 py-2 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 flex items-center">Track Orders</Link>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
}
