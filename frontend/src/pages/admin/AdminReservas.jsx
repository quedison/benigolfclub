import { useEffect, useState } from 'react';
import { Trash2, Check, X, Clock } from 'lucide-react';
import { getReservations, updateReservationStatus, deleteReservation } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const AdminReservas = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const response = await getReservations();
      setReservations(response.data);
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      toast.success('Status atualizado');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) return;
    try {
      await deleteReservation(id);
      toast.success('Reserva excluída');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400"><Check className="w-3 h-3" /> Confirmada</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400"><X className="w-3 h-3" /> Cancelada</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3" /> Pendente</span>;
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-reservas">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-white">Reservas</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-[#141414] border-[#2A2A2A] text-white">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
            <SelectItem value="all" className="text-white">Todas</SelectItem>
            <SelectItem value="pending" className="text-white">Pendentes</SelectItem>
            <SelectItem value="confirmed" className="text-white">Confirmadas</SelectItem>
            <SelectItem value="cancelled" className="text-white">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A]">
              <tr>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Data</th>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Nome</th>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden md:table-cell">Contato</th>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Tipo</th>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium hidden sm:table-cell">Pessoas</th>
                <th className="text-left p-4 text-[#A1A1AA] text-sm font-medium">Status</th>
                <th className="text-right p-4 text-[#A1A1AA] text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr key={res.id} className="border-t border-[#2A2A2A] hover:bg-[#1A1A1A]" data-testid={`reservation-row-${res.id}`}>
                  <td className="p-4">
                    <div className="text-white">{res.date}</div>
                    <div className="text-[#A1A1AA] text-sm">{res.time}</div>
                  </td>
                  <td className="p-4 text-white">{res.name}</td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-[#A1A1AA] text-sm">{res.email}</div>
                    <div className="text-[#A1A1AA] text-sm">{res.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${res.type === 'hotel' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                      {res.type === 'hotel' ? 'Hotel' : 'Restaurant'}
                    </span>
                  </td>
                  <td className="p-4 text-[#A1A1AA] hidden sm:table-cell">{res.guests}</td>
                  <td className="p-4">{getStatusBadge(res.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {res.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(res.id, 'confirmed')} 
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Confirmar"
                            data-testid={`confirm-${res.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(res.id, 'cancelled')} 
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Cancelar"
                            data-testid={`cancel-${res.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(res.id)} 
                        className="text-[#A1A1AA] hover:text-red-400 p-1"
                        title="Excluir"
                        data-testid={`delete-${res.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReservations.length === 0 && (
          <div className="p-8 text-center text-[#A1A1AA]">Nenhuma reserva encontrada</div>
        )}
      </div>
    </div>
  );
};
