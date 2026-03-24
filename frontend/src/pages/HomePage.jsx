import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Hotel, TreePine } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { getSiteTexts, getSiteImages, getMenuItems, getSettings } from '@/lib/api';

export const HomePage = () => {
  const { t, getContent } = useLanguage();
  const [texts, setTexts] = useState({});
  const [images, setImages] = useState({});
  const [featuredItems, setFeaturedItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [textsRes, imagesRes, itemsRes, settingsRes] = await Promise.all([
          getSiteTexts('home'),
          getSiteImages('home'),
          getMenuItems(),
          getSettings()
        ]);
        
        const textsMap = {};
        textsRes.data.forEach(t => { textsMap[t.key] = t.content; });
        setTexts(textsMap);
        
        const imagesMap = {};
        imagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setImages(imagesMap);
        
        setFeaturedItems(itemsRes.data.slice(0, 3));
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2D5A3D]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const heroMedia = images.hero;
  const isHeroVideo = heroMedia?.media_type === 'video';

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          {heroMedia ? (
            isHeroVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                data-testid="hero-video"
              >
                <source src={heroMedia.url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={heroMedia.url}
                alt={getContent(heroMedia.alt) || "Hero"}
                className="w-full h-full object-cover"
                data-testid="hero-image"
              />
            )
          ) : (
            <div className="w-full h-full bg-[#2D5A3D]" />
          )}
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span 
              className="text-white/90 uppercase tracking-[0.3em] text-sm mb-4 block font-accent"
              variants={fadeUp}
              transition={{ delay: 0.3 }}
            >
              Clervaux, Luxembourg
            </motion.span>
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-8xl font-serif font-semibold text-white mb-6"
              variants={fadeUp}
              transition={{ delay: 0.4 }}
            >
              {getContent(texts.hero_title) || 'Beni Golf & Hôtel'}
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-white/90 font-accent italic max-w-2xl mx-auto mb-10"
              variants={fadeUp}
              transition={{ delay: 0.5 }}
            >
              {getContent(texts.hero_subtitle) || getContent(settings?.slogan) || 'Une expérience gastronomique d\'exception'}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeUp}
              transition={{ delay: 0.6 }}
            >
              <Link to="/reservations" className="bg-white text-[#2D5A3D] uppercase tracking-[0.2em] px-8 py-4 font-medium transition-all duration-300 hover:bg-[#2D5A3D] hover:text-white" data-testid="hero-reserve-btn">
                {t('common.reserve')}
              </Link>
              <Link to="/carte" className="border border-white text-white uppercase tracking-[0.2em] px-8 py-4 font-medium transition-all duration-300 hover:bg-white hover:text-[#2D5A3D]" data-testid="hero-discover-btn">
                {t('common.discover')}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 lg:py-32 px-4 bg-[#F8F7F4]" data-testid="welcome-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#2D5A3D] uppercase tracking-[0.2em] text-sm mb-4 block">
                {t('home.welcomeTitle')}
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif font-semibold text-[#1F3D2A] mb-6">
                {getContent(texts.intro_title) || 'Bienvenue'}
              </h2>
              <p className="text-[#5A7D6A] leading-relaxed mb-8 whitespace-pre-line">
                {getContent(texts.intro_text) || 'Niché au cœur de Clervaux, notre établissement vous invite à découvrir une cuisine raffinée dans un cadre exceptionnel.'}
              </p>
              <Link to="/histoire" className="inline-flex items-center gap-2 text-[#2D5A3D] hover:gap-4 transition-all duration-300 font-medium">
                {t('common.discover')} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            
            {images.intro && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={images.intro.url}
                    alt={getContent(images.intro.alt) || "Cuisine"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-[#2D5A3D] -z-10" />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      {featuredItems.length > 0 && (
        <section className="py-24 bg-white px-4" data-testid="featured-menu-section">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#2D5A3D] uppercase tracking-[0.2em] text-sm mb-4 block">
                {t('home.featuredMenu')}
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif font-semibold text-[#1F3D2A]">
                {getContent(texts.specialties_title) || 'Nos Spécialités'}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                  data-testid={`featured-item-${index}`}
                >
                  <div className="bg-[#F8F7F4] border border-[#E5E5E0] card-hover overflow-hidden">
                    {item.image && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={item.image}
                          alt={getContent(item.name)}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-serif text-[#1F3D2A]">
                          {getContent(item.name)}
                        </h3>
                        <span className="text-[#2D5A3D] font-semibold">
                          €{item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[#5A7D6A] text-sm font-accent italic">
                        {getContent(item.description)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/carte" className="btn-outline-gold" data-testid="view-menu-btn">
                {t('common.viewMore')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Three Pillars */}
      <section className="py-24 px-4 bg-[#F8F7F4]" data-testid="pillars-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Restaurant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Link to="/carte" className="block group" data-testid="pillar-restaurant">
                <div className="aspect-[3/4] relative overflow-hidden mb-6 bg-[#2D5A3D]/10">
                  {images.pillar_restaurant ? (
                    <img
                      src={images.pillar_restaurant.url}
                      alt={getContent(images.pillar_restaurant.alt) || "Restaurant"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-16 h-16 text-[#2D5A3D]/30" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#2D5A3D]/30 group-hover:bg-[#2D5A3D]/10 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-white" strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-[#1F3D2A] mb-2 group-hover:text-[#2D5A3D] transition-colors">
                  {getContent(texts.pillar_restaurant_title) || 'Le Restaurant'}
                </h3>
                <p className="text-[#5A7D6A] text-sm font-accent italic">
                  {getContent(texts.pillar_restaurant_desc) || 'Une cuisine raffinée aux saveurs locales'}
                </p>
              </Link>
            </motion.div>

            {/* Hotel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/hotel" className="block group" data-testid="pillar-hotel">
                <div className="aspect-[3/4] relative overflow-hidden mb-6 bg-[#2D5A3D]/10">
                  {images.pillar_hotel ? (
                    <img
                      src={images.pillar_hotel.url}
                      alt={getContent(images.pillar_hotel.alt) || "Hotel"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Hotel className="w-16 h-16 text-[#2D5A3D]/30" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#2D5A3D]/30 group-hover:bg-[#2D5A3D]/10 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Hotel className="w-12 h-12 text-white" strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-[#1F3D2A] mb-2 group-hover:text-[#2D5A3D] transition-colors">
                  {getContent(texts.pillar_hotel_title) || "L'Hôtel"}
                </h3>
                <p className="text-[#5A7D6A] text-sm font-accent italic">
                  {getContent(texts.pillar_hotel_desc) || '23 chambres de charme au cœur de Clervaux'}
                </p>
              </Link>
            </motion.div>

            {/* Golf */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/golf" className="block group" data-testid="pillar-golf">
                <div className="aspect-[3/4] relative overflow-hidden mb-6 bg-[#2D5A3D]/10">
                  {images.pillar_golf ? (
                    <img
                      src={images.pillar_golf.url}
                      alt={getContent(images.pillar_golf.alt) || "Golf"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TreePine className="w-16 h-16 text-[#2D5A3D]/30" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#2D5A3D]/30 group-hover:bg-[#2D5A3D]/10 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TreePine className="w-12 h-12 text-white" strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-[#1F3D2A] mb-2 group-hover:text-[#2D5A3D] transition-colors">
                  {getContent(texts.pillar_golf_title) || 'The Golf Club'}
                </h3>
                <p className="text-[#5A7D6A] text-sm font-accent italic">
                  {getContent(texts.pillar_golf_desc) || 'Un parcours 18 trous au cœur de la nature'}
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0">
          {images.cta_background ? (
            <img
              src={images.cta_background.url}
              alt={getContent(images.cta_background.alt) || "Interior"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#1F3D2A]" />
          )}
          <div className="absolute inset-0 bg-[#2D5A3D]/80" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white mb-6">
              {getContent(texts.cta_title) || t('reservation.title')}
            </h2>
            <p className="text-lg text-white/90 font-accent italic mb-10 max-w-2xl mx-auto">
              {getContent(texts.cta_text) || t('reservation.subtitle')}
            </p>
            <Link to="/reservations" className="bg-white text-[#2D5A3D] uppercase tracking-[0.2em] px-8 py-4 font-medium transition-all duration-300 hover:bg-[#1F3D2A] hover:text-white" data-testid="cta-reserve-btn">
              {t('common.reserve')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
