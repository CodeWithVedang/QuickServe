import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, paymentService } from '../../services/api';
import { supabase } from '../../services/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Receipt, CreditCard, Banknote, QrCode } from 'lucide-react';
import type { Order, PaymentMethod } from '../../types';

export function CounterDashboard() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processing, setProcessing] = useState(false);

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ['counterOrders'],
    queryFn: () => orderService.getOrdersByStatus(['pending', 'preparing', 'done'])
  });

  // Group orders by table number to handle multi-part orders on one bill
  const activeOrders = rawOrders ? Object.values(rawOrders.reduce((acc: Record<number, Order>, order) => {
    if (order.table_number === null) return acc;
    if (!acc[order.table_number]) {
      acc[order.table_number] = { ...order, items: [...(order.items || [])] };
    } else {
      acc[order.table_number].items = [...(acc[order.table_number].items || []), ...(order.items || [])];
      // Keep the "most advanced" status
      const statusPriority = { 'pending': 0, 'preparing': 1, 'done': 2, 'paid': 3, 'cancelled': -1 };
      if (statusPriority[order.status] > statusPriority[acc[order.table_number].status]) {
        acc[order.table_number].status = order.status;
      }
    }
    return acc;
  }, {})) : [];

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const channel = supabase.channel('counter-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['counterOrders'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handlePayment = async (method: PaymentMethod) => {
    if (!selectedOrder) return;
    setProcessing(true);
    
    // Calculate total from API since prices might change, but for frontend simplicity we do it here
    const amount = selectedOrder.items?.reduce((sum, item) => sum + ((item.menu_item?.price || 0) * item.quantity), 0) || 0;

    try {
      await paymentService.createPayment({
        order_id: selectedOrder.id,
        amount,
        payment_method: method,
        status: 'completed'
      });
      setSelectedOrder(null);
      alert('Payment successful!');
    } catch (e) {
      console.error(e);
      alert('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Active Tables / Orders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 bg-gray-100 animate-pulse" />)}
          </div>
        </div>
        <div className="w-full lg:w-96">
          <Card className="h-[500px] bg-gray-50 animate-pulse" />
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'done') return <Badge variant="success">Ready for Billing</Badge>;
    if (status === 'preparing') return <Badge variant="info">Preparing in Kitchen</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Active Orders List */}
      <div className="flex-1">
         <h2 className="text-2xl font-bold mb-6 text-gray-800">Active Tables / Orders</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {activeOrders?.map(order => (
             <Card 
                key={order.id} 
                className={`cursor-pointer transition hover:border-indigo-500 hover:shadow-md ${selectedOrder?.id === order.id ? 'ring-2 ring-indigo-600 border-indigo-600' : ''}`}
                onClick={() => setSelectedOrder(order)}
             >
               <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                 <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                   {order.table_number}
                 </div>
                 <div className="font-semibold text-gray-500 text-sm">Table Number</div>
                 {getStatusBadge(order.status)}
               </CardContent>
             </Card>
           ))}
           {activeOrders?.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-400">No active orders</div>
           )}
         </div>
      </div>

      {/* Billing Panel */}
      <div className="w-full lg:w-96">
        <Card className="sticky top-24 min-h-[500px] flex flex-col">
          <div className="p-6 bg-gray-50 border-b flex items-center">
            <Receipt className="mr-2 text-gray-600" />
            <h2 className="text-xl font-bold">Billing Details</h2>
          </div>
          
          <CardContent className="flex-1 p-6 flex flex-col">
            {!selectedOrder ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                <Receipt className="w-12 h-12 mb-2 opacity-20" />
                <p>Select an order to view bill</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Table {selectedOrder.table_number}</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <div className="flex-1 bg-white p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col mb-6 relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-300 rounded-t-lg" />
                  <div className="text-center border-b-2 border-dashed border-gray-200 pb-4 mb-4 mt-2">
                     <h3 className="font-black text-2xl tracking-tighter text-gray-900">QUICKSERVE INDIA</h3>
                     <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">RESTAURANT RECEIPT</p>
                     <p className="text-sm font-semibold text-gray-700 mt-2">Table Number: <span className="text-primary font-black text-xl">{selectedOrder.table_number}</span></p>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase border-b pb-2">
                       <span>Item</span>
                       <span>Amount</span>
                    </div>
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm items-center">
                        <span className="text-gray-700 font-semibold">{item.quantity}  <span className="text-gray-400 mx-1">x</span>  {item.menu_item?.name}</span>
                        <span className="font-bold text-gray-900">
                          ₹{((item.menu_item?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-1">
                      <span>Subtotal</span>
                      <span>₹{(selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-4">
                      <span>GST (5%)</span>
                      <span>₹{((selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-black bg-orange-50 p-3 rounded-lg text-gray-900 ring-1 ring-primary/20">
                      <span>TOTAL</span>
                      <span className="text-primary">
                        ₹{((selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) * 1.05).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 border-dashed border-2 hover:bg-orange-50 font-bold"
                    onClick={handlePrint}
                  >
                    <Receipt className="w-4 h-4 mr-2" /> Print Receipt
                  </Button>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-500 uppercase">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        disabled={processing}
                        onClick={() => handlePayment('cash')}
                        className="flex flex-col h-auto py-3 items-center text-xs"
                      >
                        <Banknote className="w-5 h-5 mb-1" /> Cash
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={processing}
                        onClick={() => handlePayment('card')}
                        className="flex flex-col h-auto py-3 items-center text-xs"
                      >
                        <CreditCard className="w-5 h-5 mb-1" /> Card
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={processing}
                        onClick={() => handlePayment('upi')}
                        className="flex flex-col h-auto py-3 items-center text-xs"
                      >
                        <QrCode className="w-5 h-5 mb-1" /> UPI
                      </Button>
                    </div>
                    {selectedOrder.status !== 'done' && (
                      <p className="text-xs text-blue-500 text-center mt-2 font-semibold">
                        Note: Order is still being {selectedOrder.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
