import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "./lib/i18n";
import { Layout } from "./components/layout/Layout";

// Public Pages
import { HomePage } from "./pages/HomePage";
import { StoryPage } from "./pages/StoryPage";
import { MenuPage } from "./pages/MenuPage";
import { GalleryPage } from "./pages/GalleryPage";
import { GolfPage } from "./pages/GolfPage";
import { HotelPage } from "./pages/HotelPage";
import { ReservationsPage } from "./pages/ReservationsPage";

// Admin Pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCardapio } from "./pages/admin/AdminCardapio";
import { AdminCategorias } from "./pages/admin/AdminCategorias";
import { AdminGaleria } from "./pages/admin/AdminGaleria";
import { AdminTextos } from "./pages/admin/AdminTextos";
import { AdminImagens } from "./pages/admin/AdminImagens";
import { AdminConfiguracoes } from "./pages/admin/AdminConfiguracoes";
import { AdminUsuarios } from "./pages/admin/AdminUsuarios";
import { AdminReservas } from "./pages/admin/AdminReservas";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/histoire" element={<Layout><StoryPage /></Layout>} />
          <Route path="/carte" element={<Layout><MenuPage /></Layout>} />
          <Route path="/galerie" element={<Layout><GalleryPage /></Layout>} />
          <Route path="/golf" element={<Layout><GolfPage /></Layout>} />
          <Route path="/hotel" element={<Layout><HotelPage /></Layout>} />
          <Route path="/reservations" element={<Layout><ReservationsPage /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cardapio" element={<AdminCardapio />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="galeria" element={<AdminGaleria />} />
            <Route path="textos" element={<AdminTextos />} />
            <Route path="imagens" element={<AdminImagens />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="configuracoes" element={<AdminConfiguracoes />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#FFFFFF',
            border: '1px solid #E5E5E0',
            color: '#1F3D2A'
          }
        }}
      />
    </LanguageProvider>
  );
}

export default App;
