import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Type, AlertCircle } from 'lucide-react';
import { getSiteTexts, createSiteText, updateSiteText, deleteSiteText } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mapeamento completo de todos os textos do site
const TEXT_MAP = {
  home: [
    { key: 'hero_title', label: 'Hero - Título Principal', description: 'Título grande no hero da página inicial', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero - Subtítulo', description: 'Texto abaixo do título no hero', type: 'text' },
    { key: 'hero_location', label: 'Hero - Localização', description: 'Texto de localização acima do título (ex: Clervaux, Luxembourg)', type: 'text' },
    { key: 'intro_title', label: 'Introdução - Título', description: 'Título da seção de boas-vindas', type: 'text' },
    { key: 'intro_text', label: 'Introdução - Texto', description: 'Texto descritivo da seção de boas-vindas', type: 'textarea' },
    { key: 'specialties_title', label: 'Especialidades - Título', description: 'Título da seção de pratos em destaque', type: 'text' },
    { key: 'pillar_restaurant_title', label: 'Pilar Restaurant - Título', description: 'Título do card do restaurante', type: 'text' },
    { key: 'pillar_restaurant_desc', label: 'Pilar Restaurant - Descrição', description: 'Descrição do card do restaurante', type: 'text' },
    { key: 'pillar_hotel_title', label: 'Pilar Hotel - Título', description: 'Título do card do hotel', type: 'text' },
    { key: 'pillar_hotel_desc', label: 'Pilar Hotel - Descrição', description: 'Descrição do card do hotel', type: 'text' },
    { key: 'pillar_golf_title', label: 'Pilar Golf - Título', description: 'Título do card do golf', type: 'text' },
    { key: 'pillar_golf_desc', label: 'Pilar Golf - Descrição', description: 'Descrição do card do golf', type: 'text' },
    { key: 'cta_title', label: 'CTA - Título', description: 'Título da seção de chamada para ação', type: 'text' },
    { key: 'cta_text', label: 'CTA - Texto', description: 'Texto da seção de chamada para ação', type: 'text' },
  ],
  story: [
    { key: 'title', label: 'Título da Página', description: 'Título principal (ex: Notre Histoire)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', description: 'Texto acima do título (ex: Depuis 2005)', type: 'text' },
    { key: 'content', label: 'Conteúdo Principal', description: 'Texto principal da história do restaurante', type: 'textarea' },
    { key: 'chef_name', label: 'Chef - Nome', description: 'Nome do chef (ex: Chef Beni)', type: 'text' },
    { key: 'chef_title', label: 'Chef - Título', description: 'Título/cargo do chef (ex: Chef Exécutif)', type: 'text' },
    { key: 'quote', label: 'Citação', description: 'Citação em destaque', type: 'textarea' },
    { key: 'quote_author', label: 'Autor da Citação', description: 'Nome do autor da citação (ex: Chef Beni)', type: 'text' },
  ],
  golf: [
    { key: 'title', label: 'Título da Página', description: 'Título principal (ex: The Golf Club)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', description: 'Texto acima do título (ex: Golf Club Clervaux)', type: 'text' },
    { key: 'description', label: 'Descrição', description: 'Texto descritivo do golf', type: 'textarea' },
    { key: 'feature_1_title', label: 'Feature 1 - Título', description: 'Título da 1ª característica (ex: 18 Trous)', type: 'text' },
    { key: 'feature_1_desc', label: 'Feature 1 - Descrição', description: 'Descrição da 1ª característica', type: 'text' },
    { key: 'feature_2_title', label: 'Feature 2 - Título', description: 'Título da 2ª característica (ex: Nature Préservée)', type: 'text' },
    { key: 'feature_2_desc', label: 'Feature 2 - Descrição', description: 'Descrição da 2ª característica', type: 'text' },
    { key: 'feature_3_title', label: 'Feature 3 - Título', description: 'Título da 3ª característica (ex: Pro Shop)', type: 'text' },
    { key: 'feature_3_desc', label: 'Feature 3 - Descrição', description: 'Descrição da 3ª característica', type: 'text' },
    { key: 'feature_4_title', label: 'Feature 4 - Título', description: 'Título da 4ª característica (ex: Driving Range)', type: 'text' },
    { key: 'feature_4_desc', label: 'Feature 4 - Descrição', description: 'Descrição da 4ª característica', type: 'text' },
    { key: 'cta_title', label: 'CTA - Título', description: 'Título da seção final (ex: Prêt pour une partie?)', type: 'text' },
    { key: 'cta_text', label: 'CTA - Texto', description: 'Texto da seção final', type: 'text' },
  ],
  hotel: [
    { key: 'title', label: 'Título da Página', description: 'Título principal (ex: L\'Hôtel)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', description: 'Texto acima do título (ex: 23 Chambres)', type: 'text' },
    { key: 'description', label: 'Descrição', description: 'Texto descritivo do hotel', type: 'textarea' },
    { key: 'rooms_section_title', label: 'Quartos - Título da Seção', description: 'Título da seção de quartos (ex: Nos Chambres)', type: 'text' },
    { key: 'rooms_section_subtitle', label: 'Quartos - Subtítulo', description: 'Subtítulo da seção (ex: Hébergement)', type: 'text' },
    { key: 'room_1_name', label: 'Quarto 1 - Nome', description: 'Nome do primeiro quarto (ex: Suite Deluxe)', type: 'text' },
    { key: 'room_1_desc', label: 'Quarto 1 - Descrição', description: 'Descrição do primeiro quarto', type: 'text' },
    { key: 'room_1_price', label: 'Quarto 1 - Preço', description: 'Preço por noite (apenas número)', type: 'text' },
    { key: 'room_2_name', label: 'Quarto 2 - Nome', description: 'Nome do segundo quarto (ex: Chambre Supérieure)', type: 'text' },
    { key: 'room_2_desc', label: 'Quarto 2 - Descrição', description: 'Descrição do segundo quarto', type: 'text' },
    { key: 'room_2_price', label: 'Quarto 2 - Preço', description: 'Preço por noite (apenas número)', type: 'text' },
    { key: 'room_3_name', label: 'Quarto 3 - Nome', description: 'Nome do terceiro quarto (ex: Chambre Standard)', type: 'text' },
    { key: 'room_3_desc', label: 'Quarto 3 - Descrição', description: 'Descrição do terceiro quarto', type: 'text' },
    { key: 'room_3_price', label: 'Quarto 3 - Preço', description: 'Preço por noite (apenas número)', type: 'text' },
    { key: 'experience_title', label: 'Experiência - Título', description: 'Título da seção experiência (ex: L\'Expérience)', type: 'text' },
    { key: 'experience_subtitle', label: 'Experiência - Subtítulo', description: 'Subtítulo da seção (ex: Un havre de paix)', type: 'text' },
    { key: 'experience_text', label: 'Experiência - Texto', description: 'Texto descritivo da experiência', type: 'textarea' },
  ],
  reservations: [
    { key: 'title', label: 'Título da Página', description: 'Título principal (ex: Réservations)', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', description: 'Texto abaixo do título', type: 'text' },
    { key: 'success_title', label: 'Sucesso - Título', description: 'Título da mensagem de sucesso (ex: Merci!)', type: 'text' },
    { key: 'success_message', label: 'Sucesso - Mensagem', description: 'Mensagem após enviar reserva', type: 'textarea' },
  ],
  menu: [
    { key: 'title', label: 'Título da Página', description: 'Título principal da página de menu', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', description: 'Texto acima do título (ex: Le Bistro)', type: 'text' },
    { key: 'allergy_note', label: 'Nota de Alergias', description: 'Texto sobre alergias alimentares', type: 'textarea' },
  ],
  gallery: [
    { key: 'title', label: 'Título da Página', description: 'Título principal da página de galeria', type: 'text' },
  ],
  footer: [
    { key: 'copyright', label: 'Copyright', description: 'Texto de direitos autorais', type: 'text' },
    { key: 'address', label: 'Endereço', description: 'Endereço completo', type: 'textarea' },
    { key: 'phone', label: 'Telefone', description: 'Número de telefone', type: 'text' },
    { key: 'email', label: 'Email', description: 'Email de contato', type: 'text' },
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
  { value: 'footer', label: 'Rodapé', icon: '📝' },
];

export const AdminTextos = () => {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [currentMapping, setCurrentMapping] = useState(null);
  const [formData, setFormData] = useState({
    page: 'home',
    key: '',
    content: { fr: '', de: '', en: '', pt: '' }
  });

  const fetchData = async () => {
    try {
      const response = await getSiteTexts();
      setTexts(response.data);
    } catch (error) {
      toast.error('Erro ao carregar textos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Get existing text for a specific key
  const getTextForKey = (page, key) => {
    return texts.find(t => t.page === page && t.key === key);
  };

  // Get missing texts count for a page
  const getMissingCount = (page) => {
    const pageTexts = TEXT_MAP[page] || [];
    return pageTexts.filter(mapping => !getTextForKey(page, mapping.key)).length;
  };

  const openEdit = (text, mapping) => {
    setEditingText(text);
    setCurrentMapping(mapping);
    setFormData({ 
      page: text.page, 
      key: text.key, 
      content: { 
        fr: text.content?.fr || '', 
        de: text.content?.de || '', 
        en: text.content?.en || '',
        pt: text.content?.pt || ''
      }
    });
    setDialogOpen(true);
  };

  const openCreate = (page, key, mapping) => {
    setEditingText(null);
    setCurrentMapping(mapping);
    setFormData({ 
      page, 
      key, 
      content: { fr: '', de: '', en: '', pt: '' }
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.fr) {
      toast.error('O conteúdo em Francês é obrigatório');
      return;
    }
    try {
      if (editingText) {
        await updateSiteText(editingText.id, formData);
        toast.success('Texto atualizado');
      } else {
        await createSiteText(formData);
        toast.success('Texto criado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este texto?')) return;
    try {
      await deleteSiteText(id);
      toast.success('Texto excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-textos">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white">Textos do Site</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">Gerencie todos os textos editáveis de cada página</p>
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
            <div className="space-y-3">
              {(TEXT_MAP[page.value] || []).map((mapping) => {
                const existingText = getTextForKey(page.value, mapping.key);
                
                return (
                  <div 
                    key={mapping.key} 
                    className={`bg-[#141414] border rounded-lg p-4 ${
                      existingText ? 'border-[#2A2A2A]' : 'border-red-500/50 border-dashed'
                    }`}
                    data-testid={`text-slot-${page.value}-${mapping.key}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#D4AF37] font-mono text-xs bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {mapping.key}
                          </span>
                          {existingText ? (
                            <span className="text-green-500 text-xs">✓ Configurado</span>
                          ) : (
                            <span className="text-red-400 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Não configurado
                            </span>
                          )}
                          <span className="text-[#A1A1AA] text-xs bg-[#2A2A2A] px-2 py-0.5 rounded">
                            {mapping.type === 'textarea' ? 'Texto longo' : 'Texto curto'}
                          </span>
                        </div>
                        <p className="text-white font-medium">{mapping.label}</p>
                        <p className="text-[#A1A1AA] text-xs mt-1">{mapping.description}</p>
                        
                        {existingText && (
                          <div className="mt-3 p-3 bg-[#0A0A0A] rounded text-sm">
                            <p className="text-[#5A7D6A] text-xs mb-1">FR:</p>
                            <p className="text-white/80 line-clamp-2">{existingText.content?.fr || '-'}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {existingText ? (
                          <>
                            <button 
                              onClick={() => openEdit(existingText, mapping)} 
                              className="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                              data-testid={`edit-${mapping.key}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(existingText.id)} 
                              className="p-2 text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              data-testid={`delete-${mapping.key}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => openCreate(page.value, mapping.key, mapping)} 
                            className="flex items-center gap-2 px-3 py-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded text-sm transition-colors"
                            data-testid={`create-${mapping.key}`}
                          >
                            <Plus className="w-4 h-4" /> Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(TEXT_MAP[page.value] || []).length === 0 && (
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 text-center text-[#A1A1AA]">
                Nenhum texto mapeado para esta página
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog para editar/criar texto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              {editingText ? 'Editar Texto' : 'Adicionar Texto'}
              <span className="ml-2 text-[#D4AF37] font-mono text-sm">
                [{formData.page}/{formData.key}]
              </span>
            </DialogTitle>
            {currentMapping && (
              <p className="text-[#A1A1AA] text-sm mt-1">{currentMapping.description}</p>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* French (required) */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                Francês <span className="text-red-400">*</span>
                <span className="text-[#A1A1AA] text-xs font-normal">(idioma principal)</span>
              </Label>
              {currentMapping?.type === 'textarea' ? (
                <Textarea
                  value={formData.content.fr}
                  onChange={(e) => setFormData({ ...formData, content: { ...formData.content, fr: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[120px]"
                  required
                  placeholder="Conteúdo em francês..."
                />
              ) : (
                <Input
                  value={formData.content.fr}
                  onChange={(e) => setFormData({ ...formData, content: { ...formData.content, fr: e.target.value } })}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  required
                  placeholder="Conteúdo em francês..."
                />
              )}
            </div>

            {/* Other languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Alemão</Label>
                {currentMapping?.type === 'textarea' ? (
                  <Textarea
                    value={formData.content.de}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, de: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[80px] text-sm"
                    placeholder="Deutsch..."
                  />
                ) : (
                  <Input
                    value={formData.content.de}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, de: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white text-sm"
                    placeholder="Deutsch..."
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Inglês</Label>
                {currentMapping?.type === 'textarea' ? (
                  <Textarea
                    value={formData.content.en}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[80px] text-sm"
                    placeholder="English..."
                  />
                ) : (
                  <Input
                    value={formData.content.en}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white text-sm"
                    placeholder="English..."
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] text-sm">Português</Label>
                {currentMapping?.type === 'textarea' ? (
                  <Textarea
                    value={formData.content.pt}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, pt: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[80px] text-sm"
                    placeholder="Português..."
                  />
                ) : (
                  <Input
                    value={formData.content.pt}
                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, pt: e.target.value } })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white text-sm"
                    placeholder="Português..."
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-[#2A2A2A]">
              <button type="button" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                Cancelar
              </button>
              <button type="submit" className="btn-gold">
                {editingText ? 'Salvar Alterações' : 'Adicionar Texto'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
