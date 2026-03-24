import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getGallery, getSiteImages } from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export const GalleryPage = () => {
  const { t, getContent } = useLanguage();
  const [images, setImages] = useState([]);
  const [siteImages, setSiteImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryRes, siteImagesRes] = await Promise.all([
          getGallery(),
          getSiteImages('gallery')
        ]);
        setImages(galleryRes.data);
        
        const imagesMap = {};
        siteImagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setSiteImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
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
    <div data-testid="gallery-page">
      {/* Hero */}
      <section className="h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={siteImages.hero?.url || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920"}
            alt={getContent(siteImages.hero?.alt) || "Gallery"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2D5A3D]/60" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-semibold text-white">
              {t('nav.gallery')}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="aspect-[4/3] overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img.url}
                  alt={getContent(img.alt)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#5A7D6A]">Aucune image dans la galerie</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={getContent(selectedImage.alt)}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
