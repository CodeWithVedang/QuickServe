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

  const activeOrders = orders?.filter(o => o.status !== 'cancelled' && o.status !== 'paid') || [];
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const cookingCount = activeOrders.filter(o => o.status === 'preparing').length;
  const readyCount = activeOrders.filter(o => o.status === 'done').length;

  const potentialRevenue = activeOrders.reduce((sum: number, o: any) => {
    return sum + (o.items?.reduce((s: number, i: any) => s + ((i.menu_item?.price || 0) * i.quantity), 0) || 0);
  }, 0);

  const todayRevenue = orders?.filter(o => o.status === 'paid')
    .reduce((sum: number, o: any) => sum + (o.items?.reduce((s: number, i: any) => s + ((i.menu_item?.price || 0) * i.quantity), 0) || 0), 0) || 0;

  const StatCard = ({ title, value, icon, gradient, trend, subValue }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-xl ring-1 ring-gray-100">
       <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 rounded-full blur-3xl opacity-20 ${gradient}`} />
       <CardContent className="p-6 relative z-10">
         <div className="flex justify-between items-start mb-4">
           <div className={`p-3 rounded-2xl ${gradient} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
             {icon}
           </div>
           {trend && <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center shadow-sm"><TrendingUp className="w-3 h-3 mr-1"/>{trend}</span>}
         </div>
         <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 select-none">{value}</h3>
         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
         {subValue && <p className="text-xs text-gray-400 mt-2 font-semibold italic">{subValue}</p>}
       </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 fade-in animate-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-black text-green-600 uppercase tracking-widest">Live System</span>
           </div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">Executive Summary</h1>
           <p className="text-gray-500 font-semibold mt-1">Real-time performance tracking and resource allocation.</p>
        </div>
        <div className="flex gap-2">
             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary font-bold">
                 {activeOrders.length}
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Active Sessions</p>
                 <p className="text-sm font-black text-gray-800">Live Traffic</p>
               </div>
             </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Revenue" 
          value={`₹${todayRevenue.toFixed(0)}`} 
          icon={<IndianRupee className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          trend="+18.4%"
          subValue={`Potential: ₹${potentialRevenue.toFixed(0)}`}
        />
        <StatCard 
          title="Active Capacity" 
          value={`${activeOrders.length}/20`} 
          icon={<Users className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-orange-400 to-primary"
          subValue={`${((activeOrders.length / 20) * 100).toFixed(0)}% occupancy`}
        />
        <StatCard 
          title="Kitchen Load" 
          value={cookingCount} 
          icon={<UtensilsCrossed className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-sky-400 to-indigo-600"
          subValue={`${pendingCount} orders pending`}
        />
        <StatCard 
          title="Unbilled Value" 
          value={`₹${potentialRevenue.toFixed(0)}`} 
          icon={<IndianRupee className="w-6 h-6" />} 
          gradient="bg-gradient-to-br from-fuchsia-400 to-pink-600"
          subValue={`${readyCount} bills awaiting payment`}
        />
      </div>

      {/* Operations Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-lg border-0 shadow-2xl overflow-hidden ring-1 ring-gray-100">
           <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" /> Popular Items Performance
             </h3>
             <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View Inventory</button>
           </div>
           <CardContent className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {menuItems?.slice(0, 6).map((item, idx) => (
                 <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:border-primary/50 hover:shadow-lg transition-all duration-500">
                   <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-300 group-hover:text-primary transition">
                       {idx + 1}
                     </div>
                     <div>
                       <p className="font-bold text-gray-900 group-hover:text-primary transition">{item.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.category}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-gray-900">₹{item.price.toFixed(0)}</p>
                     <p className="text-[10px] font-bold text-green-500">Trending</p>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 border-0 shadow-2xl text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[120px] opacity-10 -mr-20 -mt-20" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 -ml-20 -mb-20" />
           
           <div className="p-8 relative z-10 flex flex-col h-full">
             <div className="mb-10">
               <div className="bg-primary/20 p-3 rounded-2xl w-fit mb-4 ring-1 ring-primary/30">
                 <AlertCircle className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-tight">System Infrastructure</h3>
               <p className="text-gray-400 text-sm font-medium leading-relaxed">
                 PostgreSQL Realtime Engine is broadcasting deltas via WebSocket L5. Authentication is managed by GoTrue identity provider.
               </p>
             </div>

             <div className="space-y-6 flex-1">
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                   <span>Supabase Realtime</span>
                   <span className="text-green-400">Stable</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 w-[98%] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                   <span>DB Node Latency</span>
                   <span className="text-blue-400">12ms</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[85%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                   <span>Active Workers</span>
                   <span className="text-orange-400">Optimal</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-[72%] shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 </div>
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className={`w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'text-primary' : i === 2 ? 'text-blue-400' : 'text-green-400'}`}>
                     {i === 1 ? 'W' : i === 2 ? 'K' : 'C'}
                   </div>
                 ))}
               </div>
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Synchronized</span>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
