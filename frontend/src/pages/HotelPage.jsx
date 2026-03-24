import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bath, Wifi, Coffee, Wine, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { getSiteTexts, getSiteImages } from '@/lib/api';

export const HotelPage = () => {
  const { t, getContent } = useLanguage();
  const [texts, setTexts] = useState({});
  const [images, setImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [textsRes, imagesRes] = await Promise.all([
          getSiteTexts('hotel'),
          getSiteImages('hotel')
        ]);
        
        const textsMap = {};
        textsRes.data.forEach(t => { textsMap[t.key] = t.content; });
        setTexts(textsMap);
        
        const imagesMap = {};
        imagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch hotel data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const roomImages = [
    images.room1?.url,
    images.room2?.url,
    images.room3?.url,
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2D5A3D]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="hotel-page">
      {/* Hero */}
      <section className="h-[70vh] relative overflow-hidden">
        <div className="absolute inset-0">
          {images.hero ? (
            <img
              src={images.hero.url}
              alt={getContent(images.hero.alt) || "Hotel"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2D5A3D]" />
          )}
          <div className="absolute inset-0 bg-[#2D5A3D]/50" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/90 uppercase tracking-[0.3em] text-sm mb-4 block font-accent">
              {getContent(texts.subtitle) || '23 Chambres'}
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-semibold text-white">
              {getContent(texts.title) || "L'Hôtel"}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl text-[#5A7D6A] leading-relaxed font-accent italic"
          >
            {getContent(texts.description) || "Nos 23 chambres et suites allient charme authentique et confort contemporain. Chaque espace a été pensé pour offrir une expérience de séjour inoubliable au cœur de Clervaux."}
          </motion.p>
        </div>
      </section>

      {/* Rooms */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2D5A3D] uppercase tracking-[0.2em] text-sm mb-4 block">
              {getContent(texts.rooms_section_subtitle) || 'Hébergement'}
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-semibold text-[#1F3D2A]">
              {getContent(texts.rooms_section_title) || 'Nos Chambres'}
            </h2>
          </motion.div>

          {/* Amenities Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-8 sm:gap-12 mb-12 py-6 border-y border-[#E5E5E0]"
          >
            <div className="flex flex-col items-center gap-2 text-[#2D5A3D]">
              <Bath className="w-6 h-6" />
              <span className="text-xs uppercase tracking-wider text-[#5A7D6A]">Banheiro</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[#2D5A3D]">
              <Wifi className="w-6 h-6" />
              <span className="text-xs uppercase tracking-wider text-[#5A7D6A]">WiFi</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[#2D5A3D]">
              <Coffee className="w-6 h-6" />
              <span className="text-xs uppercase tracking-wider text-[#5A7D6A]">Café</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[#2D5A3D]">
              <Wine className="w-6 h-6" />
              <span className="text-xs uppercase tracking-wider text-[#5A7D6A]">Bar</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[#2D5A3D]">
              <UtensilsCrossed className="w-6 h-6" />
              <span className="text-xs uppercase tracking-wider text-[#5A7D6A]">Restaurante</span>
            </div>
          </motion.div>

          {/* Room Photos Only */}
          {roomImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roomImages.map((imageUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Quarto ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#2D5A3D] uppercase tracking-[0.2em] text-sm mb-4 block">
                {getContent(texts.experience_subtitle) || 'Un havre de paix'}
              </span>
              <h2 className="text-4xl font-serif font-semibold text-[#1F3D2A] mb-6">
                {getContent(texts.experience_title) || "L'Expérience"}
              </h2>
              <p className="text-[#5A7D6A] leading-relaxed mb-8 whitespace-pre-line">
                {getContent(texts.experience_text) || `Profitez d'un séjour ressourçant dans notre établissement. Le petit-déjeuner gourmand vous attend chaque matin avec des produits locaux soigneusement sélectionnés.

Notre équipe est à votre disposition pour organiser vos excursions dans les Ardennes, vos parties de golf ou vos dîners au restaurant.`}
              </p>
              <Link to="/reservations" className="inline-block bg-[#2D5A3D] text-white uppercase tracking-[0.2em] px-8 py-4 font-medium transition-all duration-300 hover:bg-[#1F3D2A]">
                {t('common.reserve')}
              </Link>
            </motion.div>
            
            {(images.experience1 || images.experience2) && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {images.experience1 && (
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={images.experience1.url}
                      alt={getContent(images.experience1.alt) || "Experience 1"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                {images.experience2 && (
                  <div className="aspect-[3/4] overflow-hidden mt-8">
                    <img
                      src={images.experience2.url}
                      alt={getContent(images.experience2.alt) || "Experience 2"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
