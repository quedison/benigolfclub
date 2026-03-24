import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const AdminCategorias = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: { fr: '', de: '', en: '' },
    order: 0,
    active: true
  });

  const fetchData = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingCat(null);
    setFormData({ name: { fr: '', de: '', en: '' }, order: categories.length, active: true });
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, order: cat.order, active: cat.active });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        toast.success('Categoria atualizada');
      } else {
        await createCategory(formData);
        toast.success('Categoria criada');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await deleteCategory(id);
      toast.success('Categoria excluída');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-categorias">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-white">Categorias</h1>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2" data-testid="add-category-btn">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Nome (FR)</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden sm:table-cell">Nome (DE)</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden md:table-cell">Nome (EN)</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Ordem</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Ativo</th>
              <th className="text-right p-4 text-[#A1A1AA] text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-[#2A2A2A] hover:bg-[#1A1A1A]" data-testid={`category-row-${cat.id}`}>
                <td className="p-4 text-white">{cat.name.fr}</td>
                <td className="p-4 text-[#A1A1AA] hidden sm:table-cell">{cat.name.de}</td>
                <td className="p-4 text-[#A1A1AA] hidden md:table-cell">{cat.name.en}</td>
                <td className="p-4 text-[#A1A1AA]">{cat.order}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${cat.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {cat.active ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(cat)} className="text-[#A1A1AA] hover:text-white mr-3" data-testid={`edit-category-${cat.id}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-[#A1A1AA] hover:text-red-400" data-testid={`delete-category-${cat.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-8 text-center text-[#A1A1AA]">Nenhuma categoria cadastrada</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Nome (FR) *</Label>
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

            <div className="space-y-2">
              <Label className="text-white">Ordem</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="text-white">Ativa (visível no site)</Label>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold">
                {editingCat ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
