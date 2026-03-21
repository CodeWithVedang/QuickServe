import { useQuery } from '@tanstack/react-query';
import { menuService, orderService } from '../../services/api';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { Plus, Minus, ShoppingCart, Search, Flame } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

const FILTER_TABS = [
  { label: 'All', key: 'All' },
  { label: '🌅 Breakfast', key: 'Breakfast' },
  { label: '🍛 Lunch', key: 'Lunch' },
  { label: '🌙 Dinner', key: 'Dinner' },
  { label: '🍟 Snacks', key: 'Snacks' },
  { label: '🧡 Punjabi', key: 'Punjabi' },
  { label: '🌿 South Indian', key: 'South Indian' },
  { label: '🥡 Chinese', key: 'Chinese' },
  { label: '🥤 Beverages', key: 'Beverages' },
];

export function WaiterDashboard() {
  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: menuService.getMenuItems,
  });

  const { data: activeOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['liveOrders'],
    queryFn: orderService.getAllActiveOrders,
  });

  const { items, tableNumber, setTableNumber, addItem, removeItem, clearOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSubmit = async () => {
    if (!tableNumber) return alert('Please select a table first');
    if (items.length === 0) return alert('Cart is empty');
    if (!user) return;
    setSubmitting(true);
    try {
      await orderService.createOrder(tableNumber, items, user.id);
      clearOrder();
      alert('✅ Order fired to kitchen successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = items.reduce((s, i) => s + i.quantity, 0);

  const filteredMenu = menuItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      item.meal_time === activeFilter ||
      item.food_type === activeFilter ||
      item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (menuLoading || ordersLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-36 bg-gray-200 rounded-t-xl" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-96">
          <Card className="h-[600px] animate-pulse bg-gray-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dine-In Orders</h1>
        <p className="text-gray-500 font-semibold mt-1">Select a table, pick dishes, fire to kitchen</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── LEFT: Menu Panel ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-primary outline-none font-medium text-sm bg-white shadow-sm"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border
                  ${activeFilter === tab.key
                    ? 'bg-primary text-white border-primary shadow-md shadow-orange-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-orange-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          {filteredMenu?.length === 0 ? (
            <div className="text-center text-gray-400 py-16 font-semibold">No dishes found for this filter.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMenu?.map((item) => {
                const inCart = items.find((i) => i.id === item.id);
                return (
                  <Card
                    key={item.id}
                    className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-0 ring-1 ${
                      inCart ? 'ring-primary shadow-orange-100 shadow-lg' : 'ring-gray-200'
                    } ${!item.is_available ? 'opacity-50 saturate-0 pointer-events-none' : ''}`}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl">🍽️</div>
                      )}
                      {!item.is_available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">OUT OF STOCK</span>
                        </div>
                      )}
                      {inCart && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <div className="mb-1">
                        <p className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">{item.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {item.food_type && (
                            <span className="text-xs text-gray-400 font-medium">{item.food_type}</span>
                          )}
                          {item.meal_time && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-xs text-gray-400">{item.meal_time}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-primary text-sm">₹{item.price.toFixed(0)}</span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all duration-200 font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Cart + Table Panel ── */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-orange-500 to-primary p-5 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Current Order
                </h2>
                {cartItemCount > 0 && (
                  <span className="bg-white text-primary text-sm font-black w-7 h-7 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* Table Selector */}
              <div className="p-4 border-b border-gray-100">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                  Select Table
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[...Array(20)].map((_, i) => {
                    const num = i + 1;
                    const isOccupied = activeOrders?.some((o) => o.table_number === num && o.status !== 'done');
                    const isSelected = tableNumber === num;
                    return (
                      <button
                        key={num}
                        onClick={() => !isOccupied && setTableNumber(num)}
                        disabled={isOccupied}
                        title={isOccupied ? `Table ${num} is occupied` : `Select Table ${num}`}
                        className={`h-10 rounded-lg text-sm font-black transition-all duration-200
                          ${isOccupied
                            ? 'bg-red-50 text-red-300 cursor-not-allowed border border-red-100'
                            : isSelected
                            ? 'bg-primary text-white scale-110 shadow-md shadow-orange-300'
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-orange-50'}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Selected
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-4 flex-1">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Cart is empty</p>
                    <p className="text-xs mt-1">Add dishes from the menu</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price.toFixed(0)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-sm text-gray-900 w-16 text-right">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/80">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-xl font-black text-primary">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-shrink-0" onClick={clearOrder}>Clear</Button>
                  <Button
                    className="flex-1 font-black"
                    disabled={submitting || items.length === 0 || !tableNumber}
                    onClick={handleSubmit}
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    {submitting ? 'Firing…' : 'Fire to Kitchen'}
                  </Button>
                </div>
                {!tableNumber && (
                  <p className="text-xs text-orange-500 font-semibold text-center mt-2">⚠️ Select a table to submit</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
