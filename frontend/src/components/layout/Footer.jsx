import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/api';

export const Footer = () => {
  const { t, getContent } = useLanguage();
  const [settings, setSettings] = useState(null);

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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2D5A3D] text-white" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-serif font-semibold text-white tracking-wider">
                BENI
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed font-accent italic">
              {getContent(settings?.slogan)}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-white/70 text-sm">
                <MapPin className="w-4 h-4 mt-1 text-white/90" strokeWidth={1.5} />
                <span>{settings?.address || '2, Rue du Château, L-9748 Clervaux, Luxembourg'}</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-white/90" strokeWidth={1.5} />
                <span>{settings?.phone || '+352 92 93 95 1'}</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-white/90" strokeWidth={1.5} />
                <span>{settings?.email || 'info@benigolfhotel.lu'}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Horaires</h4>
            <div className="flex items-start space-x-3 text-white/70 text-sm">
              <Clock className="w-4 h-4 mt-1 text-white/90" strokeWidth={1.5} />
              <div className="whitespace-pre-line">
                {getContent(settings?.opening_hours) || 'Mardi - Dimanche: 12h00 - 14h00, 18h30 - 21h30\nLundi: Fermé'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/histoire" className="text-white/70 text-sm hover:text-white transition-colors">
                  {t('nav.story')}
                </Link>
              </li>
              <li>
                <Link to="/carte" className="text-white/70 text-sm hover:text-white transition-colors">
                  {t('nav.menu')}
                </Link>
              </li>
              <li>
                <Link to="/hotel" className="text-white/70 text-sm hover:text-white transition-colors">
                  {t('nav.hotel')}
                </Link>
              </li>
              <li>
                <Link to="/golf" className="text-white/70 text-sm hover:text-white transition-colors">
                  {t('nav.golf')}
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-white/70 text-sm hover:text-white transition-colors">
                  {t('nav.reservations')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-white/70 text-sm">
            © {currentYear} Beni Golf & Hôtel. {t('footer.rights')}.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-white/70 text-sm">{t('footer.followUs')}:</span>
            {settings?.social_links?.instagram && (
              <a 
                href={settings.social_links.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
            )}
            {settings?.social_links?.facebook && (
              <a 
                href={settings.social_links.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
