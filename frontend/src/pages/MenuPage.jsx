import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getCategories, getMenuItems, getSiteImages } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const MenuPage = () => {
  const { t, getContent, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [images, setImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemsRes, imagesRes] = await Promise.all([
          getCategories(),
          getMenuItems(),
          getSiteImages('menu')
        ]);
        setCategories(catRes.data.filter(c => c.active));
        setMenuItems(itemsRes.data.filter(i => i.active));
        if (catRes.data.length > 0) {
          setActiveCategory(catRes.data[0].id);
        }
        
        const imagesMap = {};
        imagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.category_id === activeCategory)
    : menuItems;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2D5A3D]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="menu-page">
      {/* Hero */}
      <section className="h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0">
          {images.hero ? (
            <img
              src={images.hero.url}
              alt={getContent(images.hero.alt) || "Menu"}
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
              Le Bistro
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-semibold text-white">
              {t('nav.menu')}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto">
          {categories.length > 0 && (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent border-b border-[#E5E5E0] pb-6 mb-12">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="px-6 py-3 text-sm uppercase tracking-[0.15em] text-[#5A7D6A] data-[state=active]:text-[#2D5A3D] data-[state=active]:border-b-2 data-[state=active]:border-[#2D5A3D] rounded-none bg-transparent transition-all"
                    data-testid={`menu-tab-${cat.id}`}
                  >
                    {getContent(cat.name)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white border border-[#E5E5E0] rounded-lg overflow-hidden card-hover"
                        data-testid={`menu-item-${item.id}`}
                      >
                        {item.image && (
                          <div className="aspect-[16/10] overflow-hidden">
                            <img
                              src={item.image}
                              alt={getContent(item.name)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-baseline justify-between mb-3">
                            <h3 className="text-xl font-serif text-[#1F3D2A] group-hover:text-[#2D5A3D] transition-colors">
                              {getContent(item.name)}
                            </h3>
                            <span className="text-[#2D5A3D] font-semibold text-lg ml-4 whitespace-nowrap">
                              €{item.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[#5A7D6A] text-sm font-accent italic leading-relaxed">
                            {getContent(item.description)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#5A7D6A]">{t('common.loading')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-white px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#5A7D6A] text-sm font-accent italic">
            {language === 'fr' && 'Tous nos plats sont préparés avec des produits frais et locaux. Veuillez nous informer de toute allergie alimentaire.'}
            {language === 'de' && 'Alle unsere Gerichte werden mit frischen, lokalen Produkten zubereitet. Bitte informieren Sie uns über eventuelle Lebensmittelallergien.'}
            {language === 'en' && 'All our dishes are prepared with fresh, local products. Please inform us of any food allergies.'}
            {language === 'pt' && 'Todos os nossos pratos são preparados com produtos frescos e locais. Por favor, informe-nos sobre qualquer alergia alimentar.'}
          </p>
        </div>
      </section>
    </div>
  );
};
