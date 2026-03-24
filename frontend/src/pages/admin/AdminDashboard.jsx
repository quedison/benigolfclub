import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Users, Calendar, Images } from 'lucide-react';
import { getMenuItems, getReservations, getGallery, getUsers } from '@/lib/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    menuItems: 0,
    reservations: 0,
    gallery: 0,
    users: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [items, reservations, gallery, users] = await Promise.all([
          getMenuItems(),
          getReservations(),
          getGallery(),
          getUsers()
        ]);
        setStats({
          menuItems: items.data.length,
          reservations: reservations.data.length,
          gallery: gallery.data.length,
          users: users.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: UtensilsCrossed, label: 'Itens do Cardápio', value: stats.menuItems, color: '#D4AF37' },
    { icon: Calendar, label: 'Reservas', value: stats.reservations, color: '#10B981' },
    { icon: Images, label: 'Imagens na Galeria', value: stats.gallery, color: '#8B5CF6' },
    { icon: Users, label: 'Usuários', value: stats.users, color: '#3B82F6' }
  ];

  return (
    <div data-testid="admin-dashboard">
      <h1 className="text-3xl font-serif text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#141414] border border-[#2A2A2A] p-6 rounded-lg"
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-white mb-1">{card.value}</p>
            <p className="text-[#A1A1AA] text-sm">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
        <h2 className="text-xl font-serif text-white mb-4">Bem-vindo ao Painel Admin</h2>
        <p className="text-[#A1A1AA]">
          Use o menu lateral para gerenciar o conteúdo do site. Você pode:
        </p>
        <ul className="mt-4 space-y-2 text-[#A1A1AA]">
          <li>• <span className="text-white">Cardápio:</span> Adicionar, editar e remover pratos</li>
          <li>• <span className="text-white">Categorias:</span> Gerenciar categorias do menu</li>
          <li>• <span className="text-white">Galeria:</span> Adicionar e organizar fotos</li>
          <li>• <span className="text-white">Textos:</span> Editar todos os textos do site</li>
          <li>• <span className="text-white">Imagens:</span> Alterar imagens das páginas</li>
          <li>• <span className="text-white">Reservas:</span> Visualizar e gerenciar reservas</li>
          <li>• <span className="text-white">Configurações:</span> Dados do restaurante e hotel</li>
          <li>• <span className="text-white">Usuários:</span> Gerenciar administradores</li>
        </ul>
      </div>
    </div>
  );
};
