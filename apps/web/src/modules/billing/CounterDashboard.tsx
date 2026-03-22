import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, paymentService } from '../../services/api';
import { supabase } from '../../services/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Receipt, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
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
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-5 flex flex-col items-center justify-center space-y-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-96">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
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
    <>
      {/* Printable Receipt (Hidden by default, shown during print) */}
      <div id="printable-receipt" className="hidden print:block p-8 max-w-[400px] mx-auto bg-white text-black font-mono">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="text-center border-b-2 border-dashed border-black pb-6">
              <h1 className="text-3xl font-black tracking-tighter mb-1">QUICKSERVE</h1>
              <p className="text-xs font-bold uppercase tracking-widest">Premium Dining Experience</p>
              <p className="text-[10px] mt-2 font-medium">123 Food Street, Tech Park, India</p>
              <p className="text-[10px] font-medium">GSTIN: 27AAACQ1234F1Z5</p>
            </div>

            <div className="flex justify-between text-[10px] font-bold py-2 border-b border-gray-100">
               <span>Date: {new Date().toLocaleDateString()}</span>
               <span>Time: {new Date().toLocaleTimeString()}</span>
            </div>

            <div className="py-2">
              <p className="text-sm font-black">Table: {selectedOrder.table_number}</p>
              <p className="text-[10px] text-gray-500 font-bold">Order ID: #{selectedOrder.id.slice(0, 8)}</p>
            </div>

            <div className="space-y-3 min-h-[100px]">
              <div className="flex justify-between text-[10px] font-black border-b border-black pb-1 uppercase">
                <span>Description</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="flex justify-between text-xs font-medium">
                  <span className="flex-1">{item.menu_item?.name}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">₹{((item.menu_item?.price || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-black pt-4 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Subtotal</span>
                <span>₹{(selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Tax (GST 5%)</span>
                <span>₹{((selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span>GRAND TOTAL</span>
                <span>₹{((selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) * 1.05).toFixed(0)}</span>
              </div>
            </div>

            <div className="text-center pt-10 pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center p-2 rounded-lg border border-gray-200">
                   <QrCode className="w-full h-full opacity-30" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Scan for Feedback</p>
              <p className="text-xs font-bold">Thank you for visiting!</p>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Software by QuickServe</p>
            </div>
            
            <div className="text-[8px] text-center text-gray-300">
               -----------------------------------------------
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          @page {
            margin: 0;
          }
        }
      `}} />

      <div className="flex flex-col lg:flex-row gap-8 print:hidden">
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

                  <div className="flex-1 bg-white p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4 mt-2">
                       <h3 className="font-black text-xl tracking-tighter text-gray-900">QUICKSERVE</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dine-In Invoice</p>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin">
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm items-center">
                          <div className="flex-1">
                            <p className="text-gray-900 font-bold leading-tight">{item.menu_item?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} Unit(s) × ₹{item.menu_item?.price.toFixed(0)}</p>
                          </div>
                          <span className="font-black text-gray-900">
                            ₹{((item.menu_item?.price || 0) * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                      <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-2">
                        <span>Grand Total</span>
                        <span className="text-primary text-xl font-black">
                          ₹{((selectedOrder.items || []).reduce((s, i) => s + ((i.menu_item?.price || 0) * i.quantity), 0) * 1.05).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center font-bold italic">Inclusive of 5% CGST & SGST</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full mb-4 border-dashed border-2 hover:bg-orange-50 font-bold py-6 group"
                      onClick={handlePrint}
                    >
                      <Receipt className="w-5 h-5 mr-4 text-primary group-hover:scale-110 transition" /> 
                      <div className="text-left">
                        <p className="text-sm">Print Receipt</p>
                        <p className="text-[10px] font-normal text-gray-400">Generate PDF/Print Copy</p>
                      </div>
                    </Button>

                    <div className="space-y-3">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Process Payment</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          disabled={processing}
                          onClick={() => handlePayment('cash')}
                          className="flex flex-col h-auto py-3 items-center text-xs"
                        >
                          <Banknote className="w-5 h-5 mb-1 text-green-500" /> Cash
                        </Button>
                        <Button 
                          variant="outline" 
                          disabled={processing}
                          onClick={() => handlePayment('card')}
                          className="flex flex-col h-auto py-3 items-center text-xs"
                        >
                          <CreditCard className="w-5 h-5 mb-1 text-blue-500" /> Card
                        </Button>
                        <Button 
                          variant="outline" 
                          disabled={processing}
                          onClick={() => handlePayment('upi')}
                          className="flex flex-col h-auto py-3 items-center text-xs"
                        >
                          <QrCode className="w-5 h-5 mb-1 text-purple-500" /> UPI
                        </Button>
                      </div>
                      {selectedOrder.status !== 'done' && (
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 mt-2">
                          <p className="text-[10px] text-blue-600 text-center font-bold">
                            ORDER IN PROGRESS ({selectedOrder.status.toUpperCase()})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
