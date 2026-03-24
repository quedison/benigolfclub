import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useLanguage, languages } from '@/lib/i18n';
import { getSettings } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const { language, setLanguage, t, getContent } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const navLinks = [
    { to: '/histoire', label: t('nav.story') },
    { to: '/carte', label: t('nav.menu') },
    { to: '/galerie', label: t('nav.gallery') },
    { to: '/golf', label: t('nav.golf') },
    { to: '/hotel', label: t('nav.hotel') },
  ];

  const currentLang = languages.find(l => l.code === language);
  const siteName = getContent(settings?.site_name) || 'BENI GOLF CLUB';

  return (
    <>
      <header
        data-testid="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass-header py-3' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header: Menu | Name | Reserve */}
          <div className="flex lg:hidden items-center justify-between">
            {/* Left - Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 transition-colors ${isScrolled ? 'text-[#2D5A3D]' : 'text-white'}`}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Center - Logo/Site Name */}
            <Link to="/" className="flex-1 text-center" data-testid="logo-link-mobile">
              <span 
                className={`text-lg sm:text-xl font-serif font-semibold tracking-[0.1em] transition-colors ${
                  isScrolled ? 'text-[#2D5A3D]' : 'text-white'
                }`}
                data-testid="site-name-mobile"
              >
                {siteName}
              </span>
            </Link>

            {/* Right - Reserve Button */}
            <Link 
              to="/reservations" 
              className={`text-xs uppercase tracking-[0.1em] font-medium px-3 py-2 transition-all duration-300 ${
                isScrolled 
                  ? 'text-[#2D5A3D]' 
                  : 'text-white'
              }`}
              data-testid="mobile-header-reserve-btn"
            >
              {t('common.reserve')}
            </Link>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            {/* Top Row: Language | Logo/Name | Reserve Button */}
            <div className="flex items-center justify-between">
              {/* Left Side - Language Selector */}
              <div className="w-32 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    className={`flex items-center gap-2 text-sm uppercase tracking-wider transition-colors ${
                      isScrolled 
                        ? 'text-[#5A7D6A] hover:text-[#2D5A3D]' 
                        : 'text-white/80 hover:text-white'
                    }`}
                    data-testid="language-selector"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{currentLang?.flag}</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white border-[#E5E5E0]">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`cursor-pointer ${language === lang.code ? 'text-[#2D5A3D] font-medium' : 'text-[#5A7D6A]'}`}
                        data-testid={`lang-option-${lang.code}`}
                      >
                        <span className="mr-2 font-medium">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Center - Logo/Site Name */}
              <Link to="/" className="flex-1 text-center" data-testid="logo-link">
                <span 
                  className={`text-2xl sm:text-3xl font-serif font-semibold tracking-[0.15em] transition-colors ${
                    isScrolled ? 'text-[#2D5A3D]' : 'text-white'
                  }`}
                  data-testid="site-name"
                >
                  {siteName}
                </span>
              </Link>

              {/* Right Side - Reserve Button */}
              <div className="w-32 flex items-center justify-end">
                <Link 
                  to="/reservations" 
                  className={`text-xs uppercase tracking-[0.15em] font-medium px-4 py-2 border transition-all duration-300 ${
                    isScrolled 
                      ? 'border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white' 
                      : 'border-white text-white hover:bg-white hover:text-[#2D5A3D]'
                  }`}
                  data-testid="header-reserve-btn"
                >
                  {t('common.reserve')}
                </Link>
              </div>
            </div>

            {/* Bottom Row: Navigation Menu (Desktop) */}
            <nav className="flex items-center justify-center gap-8 mt-4 pt-3 border-t border-white/10" data-testid="desktop-nav">
              <Link
                to="/"
                data-testid="nav-link-home"
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                  isScrolled
                    ? location.pathname === '/'
                      ? 'text-[#2D5A3D]'
                      : 'text-[#5A7D6A] hover:text-[#2D5A3D]'
                    : location.pathname === '/'
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                }`}
              >
                {t('nav.home')}
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-testid={`nav-link-${link.to.replace('/', '')}`}
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                    isScrolled
                      ? location.pathname === link.to
                        ? 'text-[#2D5A3D]'
                        : 'text-[#5A7D6A] hover:text-[#2D5A3D]'
                      : location.pathname === link.to
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
            data-testid="mobile-menu"
          >
            <div className="absolute inset-0 bg-[#F8F7F4]" />
            <nav className="relative h-full flex flex-col items-center justify-center space-y-5 px-6 py-24 overflow-y-auto">
              {/* Site Name in Mobile Menu */}
              <Link to="/" className="mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-2xl font-serif font-semibold text-[#2D5A3D] tracking-[0.15em]">
                  {siteName}
                </span>
              </Link>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="mobile-nav-link-home"
                  className={`text-xl font-serif tracking-wide ${
                    location.pathname === '/'
                      ? 'text-[#2D5A3D]'
                      : 'text-[#5A7D6A] hover:text-[#2D5A3D]'
                  }`}
                >
                  {t('nav.home')}
                </Link>
              </motion.div>
              
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 1) * 0.08 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${link.to.replace('/', '')}`}
                    className={`text-xl font-serif tracking-wide ${
                      location.pathname === link.to
                        ? 'text-[#2D5A3D]'
                        : 'text-[#5A7D6A] hover:text-[#2D5A3D]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* Reserve Button in Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <Link
                  to="/reservations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#2D5A3D] text-white uppercase tracking-[0.2em] px-8 py-3 font-medium text-sm inline-block"
                  data-testid="mobile-reserve-btn"
                >
                  {t('common.reserve')}
                </Link>
              </motion.div>

              {/* Language Selector in Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 mt-4"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-sm font-medium transition-colors ${
                      language === lang.code 
                        ? 'text-[#2D5A3D]' 
                        : 'text-[#5A7D6A] hover:text-[#2D5A3D]'
                    }`}
                    data-testid={`mobile-lang-${lang.code}`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
