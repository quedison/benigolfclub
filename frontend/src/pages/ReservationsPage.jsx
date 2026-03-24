import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { createReservation, getSiteImages } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr, de, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

export const ReservationsPage = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState({});
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    guests: '2',
    type: 'restaurant',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const imagesRes = await getSiteImages('reservations');
        const imagesMap = {};
        imagesRes.data.forEach(i => { imagesMap[i.key] = i; });
        setImages(imagesMap);
      } catch (error) {
        console.error('Failed to fetch images:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const locale = language === 'fr' ? fr : language === 'de' ? de : enUS;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      toast.error(language === 'fr' ? 'Veuillez sélectionner une date' : language === 'de' ? 'Bitte wählen Sie ein Datum' : 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      await createReservation({
        ...formData,
        date: format(date, 'yyyy-MM-dd'),
        guests: parseInt(formData.guests)
      });
      setSuccess(true);
      toast.success(t('reservation.successMessage'));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2D5A3D]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F7F4] pt-20" data-testid="reservation-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle className="w-20 h-20 text-[#2D5A3D] mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-[#1F3D2A] mb-4">
            {language === 'fr' ? 'Merci!' : language === 'de' ? 'Danke!' : 'Thank you!'}
          </h2>
          <p className="text-[#5A7D6A] mb-8">{t('reservation.successMessage')}</p>
          <button
            onClick={() => { setSuccess(false); setFormData({ name: '', email: '', phone: '', time: '', guests: '2', type: 'restaurant', message: '' }); setDate(null); }}
            className="btn-outline-gold"
          >
            {language === 'fr' ? 'Nouvelle réservation' : language === 'de' ? 'Neue Reservierung' : 'New reservation'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-testid="reservations-page">
      {/* Hero */}
      <section className="h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={images.hero?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"}
            alt="Reservations"
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-semibold text-white mb-4">
              {t('reservation.title')}
            </h1>
            <p className="text-lg text-white/90 font-accent italic">
              {t('reservation.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 px-4 bg-[#F8F7F4]">
        <div className="max-w-2xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-8"
            data-testid="reservation-form"
          >
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.type')}</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14" data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E0]">
                  <SelectItem value="restaurant" className="text-[#1F3D2A]">{t('reservation.restaurant')}</SelectItem>
                  <SelectItem value="hotel" className="text-[#1F3D2A]">{t('reservation.hotel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.name')}</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.email')}</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14"
                  data-testid="input-email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.phone')}</Label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14"
                data-testid="input-phone"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-14 px-4 flex items-center justify-between bg-white border border-[#E5E5E0] text-[#1F3D2A] rounded-md"
                      data-testid="date-picker-trigger"
                    >
                      <span className={date ? 'text-[#1F3D2A]' : 'text-[#5A7D6A]'}>
                        {date ? format(date, 'PPP', { locale }) : (language === 'fr' ? 'Sélectionner une date' : language === 'de' ? 'Datum auswählen' : 'Select a date')}
                      </span>
                      <CalendarIcon className="w-5 h-5 text-[#5A7D6A]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-[#E5E5E0]" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date()}
                      locale={locale}
                      className="text-[#1F3D2A]"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.time')}</Label>
                <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                  <SelectTrigger className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14" data-testid="select-time">
                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner une heure' : language === 'de' ? 'Uhrzeit auswählen' : 'Select time'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E0]">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="text-[#1F3D2A]">{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.guests')}</Label>
              <Select value={formData.guests} onValueChange={(v) => setFormData({ ...formData, guests: v })}>
                <SelectTrigger className="bg-white border-[#E5E5E0] text-[#1F3D2A] h-14" data-testid="select-guests">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E0]">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <SelectItem key={n} value={n.toString()} className="text-[#1F3D2A]">{n} {n === 1 ? 'personne' : 'personnes'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-[#1F3D2A] uppercase tracking-wider text-sm">{t('reservation.message')}</Label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="bg-white border-[#E5E5E0] text-[#1F3D2A] resize-none"
                data-testid="input-message"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold disabled:opacity-50"
              data-testid="submit-reservation"
            >
              {loading ? t('common.loading') : t('reservation.submit')}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
};
