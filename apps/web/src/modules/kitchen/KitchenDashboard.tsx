import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/api';
import { supabase } from '../../services/supabase';
import type { Order, OrderStatus } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function KitchenDashboard() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => orderService.getOrdersByStatus(['pending', 'preparing'])
  });

  useEffect(() => {
    const channel = supabase.channel('kitchen-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateItemStatus = async (itemId: string, status: OrderStatus) => {
    setUpdating(itemId);
    try {
      await orderService.updateOrderItemStatus(itemId, status);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const markOrderDone = async (orderId: string) => {
    setUpdating(orderId);
    try {
      await orderService.updateOrderStatus(orderId, 'done');
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 bg-gray-200 w-48 rounded mb-6 animate-pulse" />
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 bg-gray-100/50 p-4 rounded-xl min-h-[500px]">
             <div className="space-y-4">
               {[1, 2, 3].map(i => <Card key={i} className="h-32 bg-white animate-pulse" />)}
             </div>
           </div>
           <div className="flex-1 bg-gray-100/50 p-4 rounded-xl min-h-[500px]">
             <div className="space-y-4">
               {[1, 2].map(i => <Card key={i} className="h-32 bg-white animate-pulse" />)}
             </div>
           </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];

  const Column = ({ title, status, items }: { title: string, status: 'pending' | 'preparing', items: Order[] }) => (
    <div className="flex-1 bg-gray-100/50 p-4 rounded-xl min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-700">{title}</h2>
        <Badge variant={status === 'pending' ? 'warning' : 'info'}>{items.length}</Badge>
      </div>
      
      <div className="space-y-4">
        {items.map(order => (
          <Card key={order.id} className={cn("border-l-8", status === 'pending' ? 'border-l-orange-400' : 'border-l-green-500', "shadow-sm")}>
            <CardHeader className="py-3 px-4 flex justify-between items-center bg-white">
              <span className="font-bold">Table {order.table_number}</span>
              <span className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </CardHeader>
            <CardContent className="p-4 bg-gray-50/50">
              <ul className="space-y-3">
                {order.items?.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{item.quantity}x</span>
                      <span>{item.menu_item?.name}</span>
                       {item.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    {item.status !== 'done' && (
                      <Button 
                        size="sm" 
                        variant={item.status === 'pending' ? 'outline' : 'primary'}
                        disabled={updating === item.id}
                        onClick={() => updateItemStatus(item.id, item.status === 'pending' ? 'preparing' : 'done')}
                      >
                        {item.status === 'pending' ? 'Start' : 'Done'}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  disabled={updating === order.id || order.items?.some(i => i.status !== 'done')}
                  variant="secondary"
                  onClick={() => markOrderDone(order.id)}
                  className="w-full"
                >
                  Mark Order Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No orders</div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kitchen Display System</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <Column title="Incoming Orders" status="pending" items={pendingOrders} />
        <Column title="Currently Preparing" status="preparing" items={preparingOrders} />
      </div>
    </div>
  );
}
