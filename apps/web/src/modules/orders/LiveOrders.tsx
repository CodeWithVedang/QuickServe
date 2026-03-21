import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/api';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ChefHat, CheckCircle2, AlertCircle, RefreshCw, IndianRupee, XCircle } from 'lucide-react';

export function LiveOrders() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Waiters and Admins can see live orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['liveOrders'],
    queryFn: () => orderService.getAllActiveOrders()
  });

  useEffect(() => {
    const channel = supabase.channel('live-orders-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    try {
      await orderService.cancelOrder(orderId);
      queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order.';
      alert(`❌ ${message}`);
    }
  };

  // Only show orders created by this waiter if they are a waiter.
  const myOrders = user?.role === 'waiter' 
    ? orders?.filter(o => o.created_by === user.id) 
    : orders;
    
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <Card key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Tracker</h1>
          <p className="text-gray-500 mt-1">Real-time status of your active tables</p>
        </div>
      </div>

      {myOrders?.length === 0 ? (
        <Card className="p-12 text-center bg-white/50 backdrop-blur border-dashed border-2">
           <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
           <p className="text-gray-500 font-semibold">No active orders found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myOrders?.map(order => {
             const progress = order.status === 'pending' ? 10 : order.status === 'preparing' ? 50 : 100;
             const isComplete = order.status === 'done';
             const isPending = order.status === 'pending';
             const totalAmount = order.items?.reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) || 0;

             return (
               <Card key={order.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-md ring-1 ring-gray-200">
                  {/* Decorative Gradient Background */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${isComplete ? 'bg-green-500' : isPending ? 'bg-orange-400' : 'bg-blue-500'}`} />
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Table</span>
                        <h2 className="text-4xl font-black text-gray-800 leading-none">{order.table_number}</h2>
                      </div>
                      <Badge variant={isComplete ? 'success' : isPending ? 'warning' : 'info'} className="shadow-sm">
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Progress Tracker */}
                    <div className="mb-8 pl-2">
                       <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 relative z-10">
                          <span className={order.status === 'pending' ? 'text-orange-500' : 'text-gray-900'}>Received</span>
                          <span className={order.status === 'preparing' ? 'text-blue-500' : progress >= 50 ? 'text-gray-900' : ''}>Cooking</span>
                          <span className={isComplete ? 'text-green-500' : ''}>Ready</span>
                       </div>
                       <div className="h-2 bg-gray-100 rounded-full relative overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : isPending ? 'bg-orange-400' : 'bg-blue-500'}`} 
                            style={{ width: `${progress}%` }} 
                          />
                       </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-6">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50/50 p-2 rounded">
                          <span className="font-semibold text-gray-700">{item.quantity}x {item.menu_item?.name}</span>
                          {item.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : item.status === 'preparing' ? (
                            <ChefHat className="w-4 h-4 text-blue-500 animate-pulse" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                       <div className="font-black text-lg text-primary flex items-center">
                         <IndianRupee className="w-4 h-4 mr-0.5" />{totalAmount.toFixed(2)}
                       </div>
                       {isPending && (
                         <Button variant="danger" size="sm" onClick={() => handleCancel(order.id)} className="opacity-90 hover:opacity-100">
                            <XCircle className="w-4 h-4 mr-1" /> Revoke
                         </Button>
                       )}
                    </div>
                  </CardContent>
               </Card>
             );
          })}
        </div>
      )}
    </div>
  );
}
