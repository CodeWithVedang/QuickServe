import { supabase } from './supabase';
import type { MenuItem, Order, Payment, OrderStatus } from '../types';

export const menuService = {
  getMenuItems: async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('category');
    if (error) throw error;
    return data as MenuItem[];
  },
  
  createMenuItem: async (item: Partial<MenuItem>) => {
    const { data, error } = await supabase.from('menu_items').insert(item).select().single();
    if (error) throw error;
    return data as MenuItem;
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
    const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as MenuItem;
  },

  deleteMenuItem: async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  }
};

export const orderService = {
  getLatestActiveOrder: async (tableNumber: number) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*))')
      .eq('table_number', tableNumber)
      .not('status', 'in', '("paid", "cancelled")')
      .order('created_at', { ascending: false })
      .maybeSingle();
    
    if (error) throw error;
    return data as Order | null;
  },

  createOrder: async (tableNumber: number | null, items: { id: string, quantity: number }[], userId: string) => {
    let orderId: string;
    let existingOrder: Order | null = null;

    if (tableNumber) {
      existingOrder = await orderService.getLatestActiveOrder(tableNumber);
    }

    if (existingOrder) {
      orderId = existingOrder.id;
      // Update order status back to pending if it was done (new items added)
      if (existingOrder.status === 'done') {
        await supabase.from('orders').update({ status: 'pending' }).eq('id', orderId);
      }
    } else {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ table_number: tableNumber, created_by: userId, status: 'pending' })
        .select()
        .single();
      
      if (orderError) throw orderError;
      orderId = order.id;
    }

    const orderItems = items.map(item => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      status: 'pending'
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Return the order (either new or existing)
    const { data: updatedOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();
    return updatedOrder as Order;
  },

  getOrdersByStatus: async (statuses: OrderStatus[]) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*))')
      .in('status', statuses)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
  },
  
  updateOrderItemStatus: async (orderItemId: string, status: OrderStatus) => {
    const { error } = await supabase.from('order_items').update({ status }).eq('id', orderItemId);
    const { data } = await supabase.from('order_items').select('order_id').eq('id', orderItemId).single();
    
    if (data) {
      // Check if all items are done to mark order as done
      const { data: allItems } = await supabase.from('order_items').select('status').eq('order_id', data.order_id);
      if (allItems && allItems.every(i => i.status === 'done')) {
        await supabase.from('orders').update({ status: 'done' }).eq('id', data.order_id);
      } else if (allItems && allItems.some(i => i.status === 'preparing')) {
        await supabase.from('orders').update({ status: 'preparing' }).eq('id', data.order_id);
      }
    }
    if (error) throw error;
  },

  cancelOrder: async (orderId: string) => {
    // Verify order is still pending before deleting
    const { data: order } = await supabase.from('orders').select('status').eq('id', orderId).single();
    if (!order || order.status !== 'pending') {
      throw new Error('Order cannot be cancelled once kitchen has started preparing.');
    }
    // Delete child items first (cascade may not always fire depending on RLS)
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', orderId);
    if (itemsErr) throw itemsErr;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
  },

  getAllActiveOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  getHistoricalOrders: async () => {
    // Analytics: fetch orders that are checked out or paid historically
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*)), payment:payments(*)')
      .eq('status', 'done') /* or completed if you map it */
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data as Order[];
  }
};

export const paymentService = {
  createPayment: async (paymentData: Partial<Payment>) => {
    const { error } = await supabase.from('payments').insert(paymentData);
    if (error) throw error;
    
    // Also mark order as completed/paid
    if (paymentData.order_id) {
       // Just marking it done but usually wait for payment. Here let's just complete it
       await supabase.from('orders').update({ status: 'paid' }).eq('id', paymentData.order_id);
    }
  }
};
