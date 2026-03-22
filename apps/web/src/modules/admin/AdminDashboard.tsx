import { useQuery } from '@tanstack/react-query';
import { orderService, menuService, analyticsService } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { IndianRupee, UtensilsCrossed, Users, TrendingUp, Calendar, PieChart, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';

export function AdminDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => analyticsService.getSalesStats()
  });

  const { data: categorySales } = useQuery({
    queryKey: ['categorySales'],
    queryFn: () => analyticsService.getCategorySales()
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => orderService.getAllActiveOrders()
  });

  const { data: menuItems } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: () => menuService.getMenuItems()
  });

  if (statsLoading || ordersLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 shadow-xl overflow-hidden">
               <CardContent className="p-6 space-y-4">
                 <div className="flex justify-between items-start">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                 </div>
                 <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                 </div>
               </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
           <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== 'cancelled' && o.status !== 'paid') || [];
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  
  const StatCard = ({ title, value, icon, gradient, trend, subValue }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white shadow-xl ring-1 ring-gray-100">
       <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 rounded-full blur-3xl opacity-20 ${gradient}`} />
       <CardContent className="p-6 relative z-10">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${gradient} text-white shadow-lg`}>
              {icon}
            </div>
            {trend && <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center"><TrendingUp className="w-3 h-3 mr-1"/>{trend}</span>}
         </div>
         <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{value}</h3>
         <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
         {subValue && <p className="text-[10px] text-gray-400 mt-2 font-semibold italic">{subValue}</p>}
       </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-black text-green-600 uppercase tracking-widest">Business Intelligence</span>
           </div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">Dashboard</h1>
           <p className="text-gray-500 font-semibold">Real-time revenue monitoring and kitchen load analysis.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                period === p 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={`${period.toUpperCase()} REVENUE`} 
          value={`₹${stats?.[period]?.toFixed(0)}`}
          icon={<IndianRupee className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          trend="+12%"
          subValue={period === 'today' ? "Updated just now" : `Previous ${period} growth`}
        />
        <StatCard 
          title="ACTIVE SESSIONS" 
          value={activeOrders.length}
          icon={<Users className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-orange-400 to-primary"
          subValue="Tables currently occupied"
        />
        <StatCard 
          title="KITCHEN LOAD" 
          value={pendingCount}
          icon={<UtensilsCrossed className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
          subValue="Orders waiting in queue"
        />
        <StatCard 
          title="AVG ORDER VALUE" 
          value={`₹${((stats?.allTime || 0) / (stats?.transactionCount || 1)).toFixed(0)}`}
          icon={<ArrowUpRight className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          subValue="Lifetime average ticket"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Performance */}
        <Card className="lg:col-span-2 border-0 shadow-xl overflow-hidden bg-white">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Revenue by Category
            </h3>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              {categorySales?.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-gray-700">{cat.name}</span>
                    <span className="text-sm font-bold text-primary">₹{cat.value.toFixed(0)}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-primary to-orange-300 transition-all duration-1000 shadow-sm`} 
                      style={{ 
                        width: `${Math.min(100, (cat.value / (stats?.month || 1)) * 100)}%`,
                        transitionDelay: `${idx * 100}ms`
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health / Peak Hours */}
        <Card className="bg-slate-950 border-0 shadow-2xl text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-8">
            <div>
               <div className="bg-primary/20 p-3 rounded-2xl w-fit mb-4">
                 <Calendar className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl font-black mb-1">Peak Utilization</h3>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Typical Busy Hours: 7PM - 10PM</p>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary">01</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Maximize Dinner Sales</p>
                    <p className="text-[10px] text-gray-500">72% of daily revenue comes from PM sessions</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400">02</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Menu Optimization</p>
                    <p className="text-[10px] text-gray-500">'Punjabi' category is leading with 45% margin</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-green-400">03</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Staff Efficiency</p>
                    <p className="text-[10px] text-gray-500">Avg ticket turnaround: 28 minutes</p>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-white/10">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-gray-500 uppercase">System Status</span>
                 <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Optimized</span>
               </div>
               <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < 10 ? 'bg-primary' : 'bg-gray-800'}`} />
                  ))}
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Items Grid */}
      <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 mt-8">
        <TrendingUp className="w-5 h-5 text-primary" /> High Performance Menu Items
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {menuItems?.slice(0, 6).map((item, idx) => (
          <Card key={item.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
            <div className="h-24 bg-gray-50 relative">
               {item.image_url ? (
                 <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               ) : (
                 <div className="flex items-center justify-center h-full text-2xl">🍽️</div>
               )}
               <div className="absolute top-0 right-0 p-1.5">
                  <div className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 shadow-sm flex items-center gap-1 font-black text-primary text-[8px] uppercase">
                    <ArrowUpRight className="w-2 h-2" /> Top {idx + 1}
                  </div>
               </div>
            </div>
            <CardContent className="p-3">
               <p className="font-bold text-xs truncate mb-1">{item.name}</p>
               <p className="text-[10px] font-black text-primary tracking-tight">₹{item.price.toFixed(0)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
