import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getSiteTexts, getSiteImages } from '@/lib/api';

export const StoryPage = () => {
  const { getContent } = useLanguage();
  const [texts, setTexts] = useState({});
  const [images, setImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [textsRes, imagesRes] = await Promise.all([
          getSiteTexts('story'),
          getSiteImages('story')
        ]);
        
        const textsMap = {};
        textsRes.data.forEach(t => { textsMap[t.key] = t.content; });
        setTexts(textsMap);
        
        const imagesMap = {};
        imagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch story data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2D5A3D]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="story-page">
      {/* Hero */}
      <section className="h-[60vh] relative overflow-hidden">
        <div className="absolute inset-0">
          {images.main ? (
            <img
              src={images.main.url}
              alt={getContent(images.main.alt) || "Story"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2D5A3D]" />
          )}
          <div className="absolute inset-0 bg-[#2D5A3D]/60" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/90 uppercase tracking-[0.3em] text-sm mb-4 block font-accent">
              {getContent(texts.subtitle) || 'Depuis 2005'}
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-semibold text-white">
              {getContent(texts.title) || 'Notre Histoire'}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content with Chef Photo */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="prose prose-lg max-w-none"
            >
              <div className="text-[#5A7D6A] leading-relaxed whitespace-pre-line text-lg">
                {getContent(texts.content) || `C'est avec passion et dévouement que nous avons créé ce lieu unique. Notre histoire est celle d'une famille unie par l'amour de la gastronomie et le désir de partager des moments d'exception avec nos convives.

Chaque plat raconte une histoire, chaque saveur évoque un souvenir. Notre cuisine est le reflet de notre parcours, alliant les techniques classiques aux influences contemporaines.

Au fil des années, nous avons cultivé des relations privilégiées avec les producteurs locaux, garantissant ainsi la fraîcheur et la qualité exceptionnelle de nos ingrédients.`}
              </div>
            </motion.div>
            
            {/* Chef Photo with Name and Title */}
            {images.chef && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <div className="aspect-[3/4] w-full max-w-md overflow-hidden mb-6">
                  <img
                    src={images.chef.url}
                    alt={getContent(images.chef.alt) || "Chef"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-serif text-[#1F3D2A] text-center">
                  {getContent(texts.chef_name) || 'Chef Beni'}
                </h3>
                <p className="text-[#5A7D6A] text-sm font-accent italic text-center mt-1">
                  {getContent(texts.chef_title) || 'Chef Exécutif'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Images Grid - only show if at least one image exists */}
      {(images.grid1 || images.grid2 || images.grid3) && (
        <section className="py-16 bg-white px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.grid1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="aspect-[4/3] overflow-hidden"
                >
                  <img
                    src={images.grid1.url}
                    alt={getContent(images.grid1.alt) || "Image 1"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              )}
              {images.grid2 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="aspect-[4/3] overflow-hidden"
                >
                  <img
                    src={images.grid2.url}
                    alt={getContent(images.grid2.alt) || "Image 2"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              )}
              {images.grid3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="aspect-[4/3] overflow-hidden"
                >
                  <img
                    src={images.grid3.url}
                    alt={getContent(images.grid3.alt) || "Image 3"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quote */}
      <section className="py-24 px-4 bg-[#2D5A3D]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-2xl sm:text-3xl font-accent italic text-white/90 mb-6">
              "{getContent(texts.quote) || 'La cuisine est un art sincère où chaque plat devient une expression de notre passion.'}"
            </blockquote>
            <cite className="text-white/70 uppercase tracking-[0.2em] text-sm not-italic">
              — {getContent(texts.quote_author) || 'Chef Beni'}
            </cite>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
