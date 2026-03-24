import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem, uploadFile } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const AdminCardapio = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: { fr: '', de: '', en: '' },
    description: { fr: '', de: '', en: '' },
    price: '',
    category_id: '',
    image: '',
    active: true,
    order: 0
  });

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([getMenuItems(), getCategories()]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      name: { fr: '', de: '', en: '' },
      description: { fr: '', de: '', en: '' },
      price: '',
      category_id: categories[0]?.id || '',
      image: '',
      active: true,
      order: items.length
    });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id,
      image: item.image || '',
      active: item.active,
      order: item.order
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadFile(file);
      setFormData({ ...formData, image: response.data.url });
      toast.success('Imagem enviada');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        order: parseInt(formData.order.toString())
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
        toast.success('Item atualizado');
      } else {
        await createMenuItem(data);
        toast.success('Item criado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name?.fr || 'Sem categoria';
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-cardapio">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-white">Cardápio</h1>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2" data-testid="add-item-btn">
          <Plus className="w-4 h-4" /> Adicionar Item
        </button>
      </div>

      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Imagem</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Nome</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden md:table-cell">Categoria</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Preço</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden sm:table-cell">Ativo</th>
              <th className="text-right p-4 text-[#A1A1AA] text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#2A2A2A] hover:bg-[#1A1A1A]" data-testid={`menu-item-row-${item.id}`}>
                <td className="p-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name.fr} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-[#2A2A2A] rounded flex items-center justify-center text-[#A1A1AA] text-xs">
                      Sem foto
                    </div>
                  )}
                </td>
                <td className="p-4 text-white">{item.name.fr}</td>
                <td className="p-4 text-[#A1A1AA] hidden md:table-cell">{getCategoryName(item.category_id)}</td>
                <td className="p-4 text-[#D4AF37]">€{item.price.toFixed(2)}</td>
                <td className="p-4 hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.active ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(item)} className="text-[#A1A1AA] hover:text-white mr-3" data-testid={`edit-item-${item.id}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-[#A1A1AA] hover:text-red-400" data-testid={`delete-item-${item.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-8 text-center text-[#A1A1AA]">Nenhum item cadastrado</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Image */}
            <div className="space-y-2">
              <Label className="text-white">Imagem</Label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <label className="flex items-center gap-2 btn-outline-gold cursor-pointer text-sm py-2">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
                {formData.image && (
                  <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="text-red-400 hover:text-red-300">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Nome (FR)</Label>
                <Input
                  value={formData.name.fr}
                  onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Nome (DE)</Label>
                <Input
                  value={formData.name.de}
                  onChange={(e) => setFormData({ ...formData, name: { ...formData.name, de: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Nome (EN)</Label>
                <Input
                  value={formData.name.en}
                  onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Descrição (FR)</Label>
                <Textarea
                  value={formData.description.fr}
                  onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descrição (DE)</Label>
                <Textarea
                  value={formData.description.de}
                  onChange={(e) => setFormData({ ...formData, description: { ...formData.description, de: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descrição (EN)</Label>
                <Textarea
                  value={formData.description.en}
                  onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  rows={2}
                />
              </div>
            </div>

            {/* Price, Category, Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Preço (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white">{cat.name.fr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Ordem</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="text-white">Ativo (visível no site)</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold">
                {editingItem ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
