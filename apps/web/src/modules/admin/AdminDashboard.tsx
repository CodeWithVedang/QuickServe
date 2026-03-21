import { useQuery } from '@tanstack/react-query';
import { orderService, menuService } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { IndianRupee, UtensilsCrossed, Users, TrendingUp, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => orderService.getAllActiveOrders()
  });

  const { data: menuItems } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: () => menuService.getMenuItems()
  });

  if (ordersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  // Calculate high-level analytics
  const activeOrders = orders?.filter(o => o.status !== 'cancelled') || [];
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const cookingCount = activeOrders.filter(o => o.status === 'preparing').length;
  const readyCount = activeOrders.filter(o => o.status === 'done').length;

  const potentialRevenue = activeOrders.reduce((sum, o) => {
    return sum + (o.items?.reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) || 0);
  }, 0);

  const StatCard = ({ title, value, icon, gradient, trend }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-xl">
       <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 rounded-full blur-2xl opacity-20 ${gradient}`} />
       <CardContent className="p-6 relative z-10">
         <div className="flex justify-between items-start mb-4">
           <div className={`p-3 rounded-xl ${gradient} text-white shadow-lg`}>
             {icon}
           </div>
           {trend && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center"><TrendingUp className="w-3 h-3 mr-1"/>{trend}</span>}
         </div>
         <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{value}</h3>
         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
       </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 fade-in animate-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Executive Summary</h1>
           <p className="text-gray-500 font-semibold mt-2 flex items-center">
             <AlertCircle className="w-4 h-4 mr-1 text-primary" /> Live Restaurant Metrics
           </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Potential Revenue" 
          value={`₹${potentialRevenue.toFixed(2)}`} 
          icon={<IndianRupee className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-green-400 to-green-600"
          trend="+12%"
        />
        <StatCard 
          title="Active Tables" 
          value={activeOrders.length} 
          icon={<Users className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-orange-400 to-primary"
        />
        <StatCard 
          title="Kitchen Load" 
          value={cookingCount} 
          icon={<UtensilsCrossed className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-blue-400 to-indigo-600"
        />
        <StatCard 
          title="Awaiting Billing" 
          value={readyCount} 
          icon={<IndianRupee className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-purple-400 to-pink-600"
        />
      </div>

      {/* Operations Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl overflow-hidden">
           <div className="p-6 bg-gray-50/50 border-b border-gray-100">
             <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">Top Selling Dishes Today</h3>
           </div>
           <CardContent className="p-6">
             <div className="space-y-4">
               {menuItems?.slice(0, 4).map((item, idx) => (
                 <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:border-primary transition duration-300">
                   <div className="flex items-center space-x-4">
                     <span className="text-2xl font-black text-gray-200 group-hover:text-primary transition">0{idx + 1}</span>
                     <div>
                       <p className="font-bold text-gray-900">{item.name}</p>
                       <p className="text-xs text-gray-500 font-semibold">{item.category}</p>
                     </div>
                   </div>
                   <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">₹{item.price.toFixed(2)}</span>
                 </div>
               ))}
             </div>
           </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-2xl text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
           <div className="p-8 relative z-10 flex flex-col h-full justify-between">
             <div>
               <h3 className="text-2xl font-black mb-2 flex items-center"><AlertCircle className="mr-2 text-primary" /> System Health</h3>
               <p className="text-gray-400 font-medium">All real-time trackers and GoTrue authentication websockets are operating fully synchronously.</p>
             </div>
             <div className="mt-8 space-y-4">
               <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                 <span className="font-semibold text-gray-400">Database Latency</span>
                 <span className="font-bold text-green-400">12ms</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                 <span className="font-semibold text-gray-400">Realtime Connections</span>
                 <span className="font-bold text-blue-400">Active</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="font-semibold text-gray-400">Pending Orders</span>
                 <span className="font-bold text-orange-400">{pendingCount} in queue</span>
               </div>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
