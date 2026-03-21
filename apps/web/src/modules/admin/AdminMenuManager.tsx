import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pencil, Trash2, Plus, X, ListPlus, Search } from 'lucide-react';
import type { MenuItem } from '../../types';

export function AdminMenuManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: menuService.getMenuItems
  });

  const saveMutation = useMutation({
    mutationFn: (item: Partial<MenuItem>) => 
      item.id ? menuService.updateMenuItem(item.id, item) : menuService.createMenuItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
      setIsModalOpen(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteMenuItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
  });

  const openEditModal = (item?: MenuItem) => {
    setEditingItem(item || { name: '', price: 0, category: '', is_available: true, image_url: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.name && editingItem.price !== undefined) {
      saveMutation.mutate(editingItem);
    }
  };

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-gray-200 rounded w-1/4"></div><div className="space-y-3"><div className="h-40 bg-gray-200 rounded"></div></div></div></div>;

  const filteredMenu = menuItems?.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 fade-in animate-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
             <ListPlus className="w-8 h-8 mr-2 text-primary" />
             Menu Setup
           </h1>
           <p className="text-gray-500 mt-1">Manage restaurant dishes, prices, and categories</p>
        </div>
        <Button onClick={() => openEditModal()} size="lg" className="shadow-lg shadow-orange-500/30">
          <Plus className="w-5 h-5 mr-2" />
          Add Dish
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <Input 
          type="text" 
          placeholder="Search menu items..." 
          className="pl-10 h-12 text-lg drop-shadow-sm border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu?.map(item => (
          <Card key={item.id} className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-primary/20 ${!item.is_available ? 'opacity-60 saturate-50' : ''}`}>
             <div className="relative h-48 bg-gray-100 overflow-hidden">
               {item.image_url ? (
                 <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-400 font-medium">No Image</div>
               )}
               {!item.is_available && (
                 <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded shadow-xl">Out of Stock</div>
               )}
             </div>
             <CardContent className="p-5">
               <div className="flex justify-between items-start mb-2 mt-1">
                 <div>
                   <h3 className="font-extrabold text-xl text-gray-900">{item.name}</h3>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.category}</span>
                 </div>
                 <span className="font-bold text-lg text-primary bg-orange-50 px-2 py-0.5 rounded">₹{item.price.toFixed(2)}</span>
               </div>
               
               <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                 <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="w-4 h-4 mr-1.5" /> Edit
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => { if(confirm('Are you sure?')) deleteMutation.mutate(item.id!) }} className="hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                 </Button>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white shadow-2xl p-0 overflow-hidden ring-1 ring-white/20">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold">{editingItem.id ? 'Edit Dish' : 'Add New Dish'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 hover:bg-gray-200 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input label="Dish Name" required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" step="0.5" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} />
                <Input label="Category" required value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} placeholder="e.g. Starters" />
              </div>
              <Input label="Image URL (Optional)" value={editingItem.image_url || ''} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} />
              
              <div className="flex items-center mt-4">
                <input type="checkbox" id="avail" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" checked={editingItem.is_available !== false} onChange={e => setEditingItem({...editingItem, is_available: e.target.checked})} />
                <label htmlFor="avail" className="ml-3 font-medium text-gray-700">Currently in Stock</label>
              </div>

              <div className="mt-8 pt-4 flex gap-3 flex-row-reverse border-t border-gray-100">
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save Dish'}</Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
