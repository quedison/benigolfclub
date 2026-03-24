import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Image, RefreshCw, Video, Play } from 'lucide-react';
import { getSiteImages, createSiteImage, updateSiteImage, deleteSiteImage, uploadFile } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mapeamento completo de todas as imagens do site
const IMAGE_MAP = {
  home: [
    { key: 'hero', label: 'Hero Principal', description: 'Imagem ou vídeo de fundo da seção hero', supportsVideo: true },
    { key: 'intro', label: 'Seção Introdução', description: 'Imagem ao lado do texto de boas-vindas', supportsVideo: false },
    { key: 'pillar_restaurant', label: 'Pilar Restaurant', description: 'Imagem do card do restaurante', supportsVideo: false },
    { key: 'pillar_hotel', label: 'Pilar Hotel', description: 'Imagem do card do hotel', supportsVideo: false },
    { key: 'pillar_golf', label: 'Pilar Golf', description: 'Imagem do card do golf', supportsVideo: false },
    { key: 'cta_background', label: 'CTA Background', description: 'Fundo da seção de chamada para ação', supportsVideo: false },
  ],
  story: [
    { key: 'main', label: 'Hero Principal', description: 'Imagem de fundo do hero da página Nossa História', supportsVideo: false },
    { key: 'chef', label: 'Foto do Chef', description: 'Foto do chef ao lado do texto principal', supportsVideo: false },
    { key: 'grid1', label: 'Grid Imagem 1', description: 'Primeira imagem da grade inferior', supportsVideo: false },
    { key: 'grid2', label: 'Grid Imagem 2', description: 'Segunda imagem da grade inferior', supportsVideo: false },
    { key: 'grid3', label: 'Grid Imagem 3', description: 'Terceira imagem da grade inferior', supportsVideo: false },
  ],
  menu: [
    { key: 'hero', label: 'Hero Menu', description: 'Imagem de fundo do hero da página Carte/Menu', supportsVideo: false },
  ],
  golf: [
    { key: 'hero', label: 'Hero Principal', description: 'Imagem de fundo do hero da página Golf', supportsVideo: false },
    { key: 'image1', label: 'Imagem Golf 1', description: 'Primeira imagem da seção de imagens', supportsVideo: false },
    { key: 'image2', label: 'Imagem Golf 2', description: 'Segunda imagem da seção de imagens', supportsVideo: false },
  ],
  hotel: [
    { key: 'hero', label: 'Hero Principal', description: 'Imagem de fundo do hero da página Hotel', supportsVideo: false },
    { key: 'room1', label: 'Suite Deluxe', description: 'Imagem da Suite Deluxe', supportsVideo: false },
    { key: 'room2', label: 'Chambre Supérieure', description: 'Imagem do quarto superior', supportsVideo: false },
    { key: 'room3', label: 'Chambre Standard', description: 'Imagem do quarto standard', supportsVideo: false },
    { key: 'experience1', label: 'Experiência 1', description: 'Primeira imagem da seção experiência', supportsVideo: false },
    { key: 'experience2', label: 'Experiência 2', description: 'Segunda imagem da seção experiência', supportsVideo: false },
  ],
  gallery: [
    { key: 'hero', label: 'Hero Galeria', description: 'Imagem de fundo do hero da página Galeria', supportsVideo: false },
  ],
  reservations: [
    { key: 'hero', label: 'Hero Reservas', description: 'Imagem de fundo do hero da página Reservas', supportsVideo: false },
  ],
};

const PAGES = [
  { value: 'home', label: 'Página Inicial', icon: '🏠' },
  { value: 'story', label: 'Nossa História', icon: '📖' },
  { value: 'menu', label: 'Carte / Menu', icon: '🍽️' },
  { value: 'golf', label: 'Golf Club', icon: '⛳' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'gallery', label: 'Galeria', icon: '🖼️' },
  { value: 'reservations', label: 'Reservas', icon: '📅' },
];

export const AdminImagens = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImg, setEditingImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentMapping, setCurrentMapping] = useState(null);
  const [formData, setFormData] = useState({
    page: 'home',
    key: '',
    url: '',
    alt: { fr: '', de: '', en: '', pt: '' },
    media_type: 'image'
  });

  const fetchData = async () => {
    try {
      const response = await getSiteImages();
      setImages(response.data);
    } catch (error) {
      toast.error('Erro ao carregar imagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Get existing image for a specific key
  const getImageForKey = (page, key) => {
    return images.find(img => img.page === page && img.key === key);
  };

  // Get missing images count for a page
  const getMissingCount = (page) => {
    const pageImages = IMAGE_MAP[page] || [];
    return pageImages.filter(mapping => !getImageForKey(page, mapping.key)).length;
  };

  const openEdit = (img, mapping) => {
    setEditingImg(img);
    setCurrentMapping(mapping);
    setFormData({ 
      page: img.page, 
      key: img.key, 
      url: img.url, 
      alt: { 
        fr: img.alt?.fr || '', 
        de: img.alt?.de || '', 
        en: img.alt?.en || '',
        pt: img.alt?.pt || ''
      },
      media_type: img.media_type || 'image'
    });
    setDialogOpen(true);
  };

  const openCreate = (page, key, label, mapping) => {
    setEditingImg(null);
    setCurrentMapping(mapping);
    setFormData({ 
      page, 
      key, 
      url: '', 
      alt: { fr: label, de: label, en: label, pt: label },
      media_type: 'image'
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      toast.error('Arquivo não suportado. Use imagem ou vídeo MP4.');
      return;
    }
    
    // Videos should be uploaded via URL (too large for base64)
    if (isVideo) {
      toast.error('Vídeos são muito grandes para upload direto. Por favor, hospede o vídeo externamente e cole a URL abaixo.');
      return;
    }
    
    if (isVideo && !currentMapping?.supportsVideo) {
      toast.error('Esta posição não suporta vídeo. Use uma imagem.');
      return;
    }
    
    // Check image size (max 5MB)
    if (isImage && file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }
    
    setUploading(true);
    try {
      const response = await uploadFile(file);
      setFormData({ 
        ...formData, 
        url: response.data.url,
        media_type: 'image'
      });
      toast.success('Imagem enviada');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      toast.error('Por favor, adicione uma imagem ou vídeo');
      return;
    }
    try {
      // Check if image already exists for this page/key
      const existingImage = images.find(img => img.page === formData.page && img.key === formData.key);
      
      if (editingImg || existingImage) {
        // UPDATE existing image
        const imgId = editingImg?.id || existingImage.id;
        await updateSiteImage(imgId, formData);
        toast.success('Mídia atualizada');
      } else {
        // CREATE new image
        await createSiteImage(formData);
        toast.success('Mídia criada');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mídia?')) return;
    try {
      await deleteSiteImage(id);
      toast.success('Mídia excluída');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-imagens">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white">Imagens do Site</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">Gerencie todas as imagens e vídeos de cada página do site</p>
        </div>
        <button onClick={fetchData} className="btn-outline-gold flex items-center gap-2" data-testid="refresh-btn">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#141414] border border-[#2A2A2A] mb-6 flex-wrap h-auto p-1">
          {PAGES.map((page) => {
            const missingCount = getMissingCount(page.value);
            return (
              <TabsTrigger
                key={page.value}
                value={page.value}
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0A0A] relative"
              >
                <span className="mr-1">{page.icon}</span>
                {page.label}
                {missingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {missingCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.value} value={page.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(IMAGE_MAP[page.value] || []).map((mapping) => {
                const existingImage = getImageForKey(page.value, mapping.key);
                const isVideo = existingImage?.media_type === 'video';
                
                return (
                  <div 
                    key={mapping.key} 
                    className={`bg-[#141414] border rounded-lg overflow-hidden ${
                      existingImage ? 'border-[#2A2A2A]' : 'border-red-500/50 border-dashed'
                    }`}
                    data-testid={`image-slot-${page.value}-${mapping.key}`}
                  >
                    {existingImage ? (
                      <>
                        <div className="aspect-video relative group">
                          {isVideo ? (
                            <>
                              <video
                                src={existingImage.url}
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img 
                              src={existingImage.url} 
                              alt={existingImage.alt?.fr || mapping.label} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEdit(existingImage, mapping)} 
                              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                              data-testid={`edit-${mapping.key}`}
                            >
                              <Pencil className="w-4 h-4 text-white" />
                            </button>
                            <button 
                              onClick={() => handleDelete(existingImage.id)} 
                              className="bg-red-500/50 hover:bg-red-500/70 p-2 rounded-full transition-colors"
                              data-testid={`delete-${mapping.key}`}
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[#D4AF37] font-mono text-xs bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                              {mapping.key}
                            </span>
                            {isVideo ? (
                              <span className="text-purple-400 text-xs flex items-center gap-1">
                                <Video className="w-3 h-3" /> Vídeo
                              </span>
                            ) : (
                              <span className="text-green-500 text-xs">✓ Imagem</span>
                            )}
                          </div>
                          <p className="text-white font-medium text-sm">{mapping.label}</p>
                          <p className="text-[#A1A1AA] text-xs mt-1">{mapping.description}</p>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="aspect-video flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                        onClick={() => openCreate(page.value, mapping.key, mapping.label, mapping)}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-3">
                          {mapping.supportsVideo ? (
                            <div className="flex gap-1">
                              <Image className="w-5 h-5 text-[#A1A1AA]" />
                              <Video className="w-5 h-5 text-[#A1A1AA]" />
                            </div>
                          ) : (
                            <Image className="w-6 h-6 text-[#A1A1AA]" />
                          )}
                        </div>
                        <span className="text-[#D4AF37] font-mono text-xs bg-[#D4AF37]/10 px-2 py-0.5 rounded mb-2">
                          {mapping.key}
                        </span>
                        <p className="text-white font-medium text-sm text-center">{mapping.label}</p>
                        <p className="text-[#A1A1AA] text-xs mt-1 text-center">{mapping.description}</p>
                        {mapping.supportsVideo && (
                          <span className="text-purple-400 text-xs mt-2 flex items-center gap-1">
                            <Video className="w-3 h-3" /> Suporta vídeo MP4
                          </span>
                        )}
                        <button className="mt-3 text-[#D4AF37] text-xs flex items-center gap-1 hover:underline">
                          <Plus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {(IMAGE_MAP[page.value] || []).length === 0 && (
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 text-center text-[#A1A1AA]">
                Nenhuma mídia mapeada para esta página
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog para editar/criar mídia */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              {editingImg ? 'Editar Mídia' : 'Adicionar Mídia'}
              <span className="ml-2 text-[#D4AF37] font-mono text-sm">
                [{formData.page}/{formData.key}]
              </span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Media Type Selector (only for hero) */}
            {currentMapping?.supportsVideo && (
              <div className="space-y-2">
                <Label className="text-white">Tipo de Mídia</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, media_type: 'image', url: '' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                      formData.media_type === 'image' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' 
                        : 'border-[#2A2A2A] text-[#A1A1AA] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <Image className="w-5 h-5" />
                    Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, media_type: 'video', url: '' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                      formData.media_type === 'video' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                        : 'border-[#2A2A2A] text-[#A1A1AA] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    Vídeo MP4
                  </button>
                </div>
              </div>
            )}

            {/* Media Preview/Upload */}
            <div className="space-y-2">
              <Label className="text-white">
                {formData.media_type === 'video' ? 'Vídeo *' : 'Imagem *'}
              </Label>
              <div className="flex flex-col gap-4">
                {formData.url ? (
                  <div className="relative aspect-video bg-[#0A0A0A] rounded-lg overflow-hidden">
                    {formData.media_type === 'video' ? (
                      <video 
                        src={formData.url} 
                        className="w-full h-full object-contain" 
                        controls
                        muted
                      />
                    ) : (
                      <img src={formData.url} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, url: '' })} 
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-1 rounded-full"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video bg-[#0A0A0A] rounded-lg flex items-center justify-center border-2 border-dashed border-[#2A2A2A]">
                    <div className="text-center">
                      {formData.media_type === 'video' ? (
                        <Video className="w-12 h-12 text-[#A1A1AA] mx-auto mb-2" />
                      ) : (
                        <Image className="w-12 h-12 text-[#A1A1AA] mx-auto mb-2" />
                      )}
                      <p className="text-[#A1A1AA] text-sm">
                        {formData.media_type === 'video' ? 'Nenhum vídeo selecionado' : 'Nenhuma imagem selecionada'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {formData.media_type === 'video' ? (
                    <div className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                      <Video className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                      <p className="text-purple-400 text-xs">
                        Para vídeos, hospede o arquivo externamente e cole a URL abaixo
                      </p>
                      <p className="text-purple-400/60 text-xs mt-1">
                        (Ex: seu servidor, S3, Cloudinary, etc.)
                      </p>
                    </div>
                  ) : (
                    <label className="flex-1 flex items-center gap-2 btn-outline-gold cursor-pointer text-sm py-2 justify-center">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Enviando...' : 'Fazer Upload (máx 5MB)'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={uploading} 
                      />
                    </label>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-[#2A2A2A]"></div>
                  <span className="text-[#A1A1AA] text-xs">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-[#2A2A2A]"></div>
                </div>
                
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={formData.media_type === 'video' ? 'https://exemplo.com/video.mp4' : 'https://exemplo.com/imagem.jpg'}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Alt texts */}
            <div className="space-y-4">
              <Label className="text-white">Descrições (Alt Text)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A1A1AA] text-xs">Francês</Label>
                  <Input
                    value={formData.alt.fr}
                    onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, fr: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                    placeholder="Description en français"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A1A1AA] text-xs">Alemão</Label>
                  <Input
                    value={formData.alt.de}
                    onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, de: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                    placeholder="Beschreibung auf Deutsch"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A1A1AA] text-xs">Inglês</Label>
                  <Input
                    value={formData.alt.en}
                    onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, en: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                    placeholder="Description in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A1A1AA] text-xs">Português</Label>
                  <Input
                    value={formData.alt.pt}
                    onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, pt: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                    placeholder="Descrição em português"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-[#2A2A2A]">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold" disabled={uploading}>
                {editingImg ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
