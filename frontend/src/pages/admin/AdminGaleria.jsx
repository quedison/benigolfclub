import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Images } from 'lucide-react';
import { getAllGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage, uploadFile } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const AdminGaleria = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [multiUploadOpen, setMultiUploadOpen] = useState(false);
  const [editingImg, setEditingImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [formData, setFormData] = useState({
    url: '',
    alt: { fr: '', de: '', en: '', pt: '' },
    order: 0,
    active: true
  });

  const fetchData = async () => {
    try {
      const response = await getAllGallery();
      setImages(response.data);
    } catch (error) {
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingImg(null);
    setFormData({ url: '', alt: { fr: '', de: '', en: '', pt: '' }, order: images.length, active: true });
    setDialogOpen(true);
  };

  const openEdit = (img) => {
    setEditingImg(img);
    setFormData({ 
      url: img.url, 
      alt: { 
        fr: img.alt?.fr || '', 
        de: img.alt?.de || '', 
        en: img.alt?.en || '',
        pt: img.alt?.pt || ''
      }, 
      order: img.order, 
      active: img.active 
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }
    
    setUploading(true);
    try {
      const response = await uploadFile(file);
      setFormData({ ...formData, url: response.data.url });
      toast.success('Imagem enviada');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  // Handle multiple file upload
  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Filter valid images under 5MB
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande (máx 5MB)`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });
    
    let successCount = 0;
    const startOrder = images.length;
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({ current: i + 1, total: validFiles.length });
      
      try {
        // Upload file
        const uploadResponse = await uploadFile(file);
        const url = uploadResponse.data.url;
        
        // Create gallery entry
        await createGalleryImage({
          url,
          alt: { 
            fr: file.name.replace(/\.[^/.]+$/, ''), 
            de: file.name.replace(/\.[^/.]+$/, ''), 
            en: file.name.replace(/\.[^/.]+$/, ''),
            pt: file.name.replace(/\.[^/.]+$/, '')
          },
          order: startOrder + i,
          active: true
        });
        
        successCount++;
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
    
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    setMultiUploadOpen(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) adicionada(s) com sucesso!`);
      fetchData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      toast.error('Por favor, adicione uma imagem');
      return;
    }
    try {
      if (editingImg) {
        await updateGalleryImage(editingImg.id, formData);
        toast.success('Imagem atualizada');
      } else {
        await createGalleryImage(formData);
        toast.success('Imagem adicionada');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;
    try {
      await deleteGalleryImage(id);
      toast.success('Imagem excluída');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-galeria">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-white">Galeria</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setMultiUploadOpen(true)} 
            className="btn-outline-gold flex items-center gap-2" 
            data-testid="multi-upload-btn"
          >
            <Images className="w-4 h-4" /> Enviar Múltiplas
          </button>
          <button onClick={openCreate} className="btn-gold flex items-center gap-2" data-testid="add-gallery-btn">
            <Plus className="w-4 h-4" /> Nova Imagem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[4/3] bg-[#141414] border border-[#2A2A2A] overflow-hidden rounded-lg" data-testid={`gallery-item-${img.id}`}>
            <img src={img.url} alt={img.alt?.fr || ''} className="w-full h-full object-cover" />
            {!img.active && (
              <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                Oculta
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button onClick={() => openEdit(img)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors" data-testid={`edit-gallery-${img.id}`}>
                <Pencil className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => handleDelete(img.id)} className="bg-red-500/50 hover:bg-red-500/70 p-2 rounded-full transition-colors" data-testid={`delete-gallery-${img.id}`}>
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 text-center text-[#A1A1AA]">
          Nenhuma imagem na galeria
        </div>
      )}

      {/* Multi Upload Dialog */}
      <Dialog open={multiUploadOpen} onOpenChange={setMultiUploadOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white font-serif flex items-center gap-2">
              <Images className="w-5 h-5" /> Enviar Múltiplas Imagens
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {uploading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white mb-2">Enviando imagens...</p>
                <p className="text-[#D4AF37] text-lg font-semibold">
                  {uploadProgress.current} de {uploadProgress.total}
                </p>
                <div className="w-full bg-[#2A2A2A] rounded-full h-2 mt-4">
                  <div 
                    className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-8 text-center hover:border-[#D4AF37]/50 transition-colors">
                  <Images className="w-12 h-12 text-[#A1A1AA] mx-auto mb-4" />
                  <p className="text-white mb-2">Arraste imagens aqui ou clique para selecionar</p>
                  <p className="text-[#A1A1AA] text-sm mb-4">Máximo 5MB por imagem • JPG, PNG, WebP</p>
                  <label className="btn-gold cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar Imagens
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-[#A1A1AA] text-xs text-center">
                  As imagens serão adicionadas com o nome do arquivo como descrição. 
                  Você pode editar depois.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Image Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              {editingImg ? 'Editar Imagem' : 'Nova Imagem'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-white">Imagem *</Label>
              <div className="flex flex-col items-center gap-4">
                {formData.url && (
                  <div className="relative w-full aspect-video">
                    <img src={formData.url} alt="Preview" className="w-full h-full object-contain rounded bg-[#0A0A0A]" />
                    <button type="button" onClick={() => setFormData({ ...formData, url: '' })} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-1 rounded-full">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 btn-outline-gold cursor-pointer text-sm py-2 w-full justify-center">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Selecionar Imagem (máx 5MB)'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <p className="text-[#A1A1AA] text-xs">Ou insira uma URL:</p>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            {/* Alt texts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Descrição (FR)</Label>
                <Input
                  value={formData.alt.fr}
                  onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, fr: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Descrição (DE)</Label>
                <Input
                  value={formData.alt.de}
                  onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, de: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Descrição (EN)</Label>
                <Input
                  value={formData.alt.en}
                  onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, en: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Descrição (PT)</Label>
                <Input
                  value={formData.alt.pt}
                  onChange={(e) => setFormData({ ...formData, alt: { ...formData.alt, pt: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Ordem</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label className="text-white">Ativa (visível)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold">
                {editingImg ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
