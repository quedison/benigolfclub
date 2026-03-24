import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, UtensilsCrossed, FolderTree, Images, FileText, 
  ImageIcon, Settings, Users, LogOut, Menu, X, Calendar 
} from 'lucide-react';
import { getMe } from '@/lib/api';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('beni-token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      try {
        const response = await getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('beni-token');
        localStorage.removeItem('beni-user');
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('beni-token');
    localStorage.removeItem('beni-user');
    navigate('/admin/login');
  };

  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/cardapio', icon: UtensilsCrossed, label: 'Cardápio' },
    { to: '/admin/categorias', icon: FolderTree, label: 'Categorias' },
    { to: '/admin/galeria', icon: Images, label: 'Galeria' },
    { to: '/admin/textos', icon: FileText, label: 'Textos do Site' },
    { to: '/admin/imagens', icon: ImageIcon, label: 'Imagens do Site' },
    { to: '/admin/reservas', icon: Calendar, label: 'Reservas' },
    { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
    { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#A1A1AA]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-[#2A2A2A] transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-testid="admin-sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-[#2A2A2A]">
            <Link to="/" className="text-2xl font-serif font-semibold gold-text tracking-wider">
              BENI
            </Link>
            <p className="text-[#A1A1AA] text-xs mt-1">Administration</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive(item)
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#2A2A2A]'
                }`}
                data-testid={`admin-menu-${item.to.split('/').pop()}`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{user.name}</p>
                <p className="text-[#A1A1AA] text-xs">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#A1A1AA] hover:text-white transition-colors"
                data-testid="admin-logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white"
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <Link to="/" className="text-[#A1A1AA] hover:text-white text-sm transition-colors">
                ← Voir le site
              </Link>
            </div>
            <div className="text-[#A1A1AA] text-sm">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
