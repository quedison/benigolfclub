import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      story: 'Notre Histoire',
      menu: 'Carte',
      gallery: 'Galerie',
      golf: 'The Golf Club',
      hotel: 'Hôtel',
      reservations: 'Réservations',
      admin: 'Admin'
    },
    common: {
      discover: 'Découvrir',
      reserve: 'Réserver',
      viewMore: 'Voir Plus',
      send: 'Envoyer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      close: 'Fermer',
      back: 'Retour'
    },
    home: {
      heroTitle: 'Beni Golf & Hôtel',
      heroSubtitle: 'Une expérience gastronomique d\'exception',
      welcomeTitle: 'Bienvenue',
      featuredMenu: 'Notre Carte',
      discoverGolf: 'Découvrez le Golf',
      discoverHotel: 'Découvrez l\'Hôtel'
    },
    reservation: {
      title: 'Réservations',
      subtitle: 'Réservez votre table ou votre chambre',
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      date: 'Date',
      time: 'Heure',
      guests: 'Nombre de personnes',
      type: 'Type de réservation',
      restaurant: 'Restaurant',
      hotel: 'Hôtel',
      message: 'Message (optionnel)',
      submit: 'Envoyer la demande',
      successMessage: 'Votre demande de réservation a été envoyée avec succès. Nous vous contacterons bientôt.'
    },
    footer: {
      rights: 'Tous droits réservés',
      followUs: 'Suivez-nous'
    }
  },
  de: {
    nav: {
      home: 'Startseite',
      story: 'Unsere Geschichte',
      menu: 'Speisekarte',
      gallery: 'Galerie',
      golf: 'Der Golfclub',
      hotel: 'Hotel',
      reservations: 'Reservierungen',
      admin: 'Admin'
    },
    common: {
      discover: 'Entdecken',
      reserve: 'Reservieren',
      viewMore: 'Mehr Sehen',
      send: 'Senden',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      close: 'Schließen',
      back: 'Zurück'
    },
    home: {
      heroTitle: 'Beni Golf & Hotel',
      heroSubtitle: 'Ein außergewöhnliches gastronomisches Erlebnis',
      welcomeTitle: 'Willkommen',
      featuredMenu: 'Unsere Speisekarte',
      discoverGolf: 'Entdecken Sie den Golf',
      discoverHotel: 'Entdecken Sie das Hotel'
    },
    reservation: {
      title: 'Reservierungen',
      subtitle: 'Reservieren Sie Ihren Tisch oder Ihr Zimmer',
      name: 'Vollständiger Name',
      email: 'E-Mail',
      phone: 'Telefon',
      date: 'Datum',
      time: 'Uhrzeit',
      guests: 'Anzahl der Gäste',
      type: 'Reservierungstyp',
      restaurant: 'Restaurant',
      hotel: 'Hotel',
      message: 'Nachricht (optional)',
      submit: 'Anfrage senden',
      successMessage: 'Ihre Reservierungsanfrage wurde erfolgreich gesendet. Wir werden Sie bald kontaktieren.'
    },
    footer: {
      rights: 'Alle Rechte vorbehalten',
      followUs: 'Folgen Sie uns'
    }
  },
  en: {
    nav: {
      home: 'Home',
      story: 'Our Story',
      menu: 'Menu',
      gallery: 'Gallery',
      golf: 'The Golf Club',
      hotel: 'Hotel',
      reservations: 'Reservations',
      admin: 'Admin'
    },
    common: {
      discover: 'Discover',
      reserve: 'Reserve',
      viewMore: 'View More',
      send: 'Send',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      back: 'Back'
    },
    home: {
      heroTitle: 'Beni Golf & Hotel',
      heroSubtitle: 'An exceptional gastronomic experience',
      welcomeTitle: 'Welcome',
      featuredMenu: 'Our Menu',
      discoverGolf: 'Discover the Golf',
      discoverHotel: 'Discover the Hotel'
    },
    reservation: {
      title: 'Reservations',
      subtitle: 'Book your table or room',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      date: 'Date',
      time: 'Time',
      guests: 'Number of Guests',
      type: 'Reservation Type',
      restaurant: 'Restaurant',
      hotel: 'Hotel',
      message: 'Message (optional)',
      submit: 'Send Request',
      successMessage: 'Your reservation request has been sent successfully. We will contact you soon.'
    },
    footer: {
      rights: 'All rights reserved',
      followUs: 'Follow us'
    }
  },
  pt: {
    nav: {
      home: 'Início',
      story: 'Nossa História',
      menu: 'Cardápio',
      gallery: 'Galeria',
      golf: 'O Golf Club',
      hotel: 'Hotel',
      reservations: 'Reservas',
      admin: 'Admin'
    },
    common: {
      discover: 'Descobrir',
      reserve: 'Reservar',
      viewMore: 'Ver Mais',
      send: 'Enviar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      close: 'Fechar',
      back: 'Voltar'
    },
    home: {
      heroTitle: 'Beni Golf & Hotel',
      heroSubtitle: 'Uma experiência gastronômica excepcional',
      welcomeTitle: 'Bem-vindo',
      featuredMenu: 'Nosso Cardápio',
      discoverGolf: 'Descubra o Golf',
      discoverHotel: 'Descubra o Hotel'
    },
    reservation: {
      title: 'Reservas',
      subtitle: 'Reserve sua mesa ou quarto',
      name: 'Nome completo',
      email: 'Email',
      phone: 'Telefone',
      date: 'Data',
      time: 'Horário',
      guests: 'Número de pessoas',
      type: 'Tipo de reserva',
      restaurant: 'Restaurante',
      hotel: 'Hotel',
      message: 'Mensagem (opcional)',
      submit: 'Enviar solicitação',
      successMessage: 'Sua solicitação de reserva foi enviada com sucesso. Entraremos em contato em breve.'
    },
    footer: {
      rights: 'Todos os direitos reservados',
      followUs: 'Siga-nos'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('beni-language');
    return saved || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('beni-language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const getContent = (content) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[language] || content.fr || content.en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getContent }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languages = [
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'pt', name: 'Português', flag: 'PT' }
];
