import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const AdminConfiguracoes = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    phone: '',
    address: '',
    email: '',
    opening_hours: { fr: '', de: '', en: '', pt: '' },
    slogan: { fr: '', de: '', en: '', pt: '' },
    social_links: { instagram: '', facebook: '', twitter: '' },
    site_name: { fr: '', de: '', en: '', pt: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSettings();
        setSettings(response.data);
      } catch (error) {
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Configurações salvas');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[#A1A1AA]">Carregando...</div>;

  return (
    <div data-testid="admin-configuracoes">
      <h1 className="text-3xl font-serif text-white mb-8">Configurações</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Site Name */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-serif text-white mb-6">Nome do Site</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Francês</Label>
              <Input
                value={settings.site_name?.fr || ''}
                onChange={(e) => setSettings({ ...settings, site_name: { ...settings.site_name, fr: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="BENI GOLF CLUB"
                data-testid="input-site-name-fr"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Alemão</Label>
              <Input
                value={settings.site_name?.de || ''}
                onChange={(e) => setSettings({ ...settings, site_name: { ...settings.site_name, de: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="BENI GOLF CLUB"
                data-testid="input-site-name-de"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Inglês</Label>
              <Input
                value={settings.site_name?.en || ''}
                onChange={(e) => setSettings({ ...settings, site_name: { ...settings.site_name, en: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="BENI GOLF CLUB"
                data-testid="input-site-name-en"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Português</Label>
              <Input
                value={settings.site_name?.pt || ''}
                onChange={(e) => setSettings({ ...settings, site_name: { ...settings.site_name, pt: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="BENI GOLF CLUB"
                data-testid="input-site-name-pt"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-serif text-white mb-6">Informações de Contato</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Telefone</Label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="+352 92 93 95 1"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="info@benigolfhotel.lu"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Endereço</Label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="2, Rue du Château, L-9748 Clervaux"
                data-testid="input-address"
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-serif text-white mb-6">Horário de Funcionamento</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Francês</Label>
              <Textarea
                value={settings.opening_hours?.fr || ''}
                onChange={(e) => setSettings({ ...settings, opening_hours: { ...settings.opening_hours, fr: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                rows={3}
                placeholder="Mardi - Dimanche: 12h00 - 14h00, 18h30 - 21h30&#10;Lundi: Fermé"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Alemão</Label>
              <Textarea
                value={settings.opening_hours?.de || ''}
                onChange={(e) => setSettings({ ...settings, opening_hours: { ...settings.opening_hours, de: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Inglês</Label>
              <Textarea
                value={settings.opening_hours?.en || ''}
                onChange={(e) => setSettings({ ...settings, opening_hours: { ...settings.opening_hours, en: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Português</Label>
              <Textarea
                value={settings.opening_hours?.pt || ''}
                onChange={(e) => setSettings({ ...settings, opening_hours: { ...settings.opening_hours, pt: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                rows={3}
                placeholder="Terça - Domingo: 12h00 - 14h00, 18h30 - 21h30&#10;Segunda: Fechado"
              />
            </div>
          </div>
        </div>

        {/* Slogan */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-serif text-white mb-6">Slogan</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Francês</Label>
              <Input
                value={settings.slogan?.fr || ''}
                onChange={(e) => setSettings({ ...settings, slogan: { ...settings.slogan, fr: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Alemão</Label>
              <Input
                value={settings.slogan?.de || ''}
                onChange={(e) => setSettings({ ...settings, slogan: { ...settings.slogan, de: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Inglês</Label>
              <Input
                value={settings.slogan?.en || ''}
                onChange={(e) => setSettings({ ...settings, slogan: { ...settings.slogan, en: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Português</Label>
              <Input
                value={settings.slogan?.pt || ''}
                onChange={(e) => setSettings({ ...settings, slogan: { ...settings.slogan, pt: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-serif text-white mb-6">Redes Sociais</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Instagram</Label>
              <Input
                value={settings.social_links?.instagram || ''}
                onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, instagram: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Facebook</Label>
              <Input
                value={settings.social_links?.facebook || ''}
                onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, facebook: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Twitter / X</Label>
              <Input
                value={settings.social_links?.twitter || ''}
                onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, twitter: e.target.value } })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-gold" data-testid="save-settings">
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
};
