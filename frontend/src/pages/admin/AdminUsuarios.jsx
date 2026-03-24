import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getUsers, register, deleteUser } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AdminUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });

  const currentUser = JSON.parse(localStorage.getItem('beni-user') || '{}');

  const fetchData = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Usuário criado');
      setDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await deleteUser(id);
      toast.success('Usuário excluído');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir');
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-usuarios">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-white">Usuários</h1>
        <button onClick={() => setDialogOpen(true)} className="btn-gold flex items-center gap-2" data-testid="add-user-btn">
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Nome</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Email</th>
              <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden sm:table-cell">Função</th>
              <th className="text-right p-4 text-[#A1A1AA] text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#2A2A2A] hover:bg-[#1A1A1A]" data-testid={`user-row-${user.id}`}>
                <td className="p-4 text-white">{user.name}</td>
                <td className="p-4 text-[#A1A1AA]">{user.email}</td>
                <td className="p-4 hidden sm:table-cell">
                  <span className="px-2 py-1 rounded text-xs bg-[#D4AF37]/20 text-[#D4AF37]">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.id !== currentUser.id ? (
                    <button onClick={() => handleDelete(user.id)} className="text-[#A1A1AA] hover:text-red-400" data-testid={`delete-user-${user.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[#A1A1AA] text-xs">(você)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-[#A1A1AA]">Nenhum usuário cadastrado</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-white">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                required
                data-testid="new-user-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                required
                data-testid="new-user-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Senha *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                required
                minLength={6}
                data-testid="new-user-password"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold">
                Criar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
