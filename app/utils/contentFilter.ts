// utils/contentFilter.ts

// Mots interdits pour les informations de contact
const CONTACT_KEYWORDS = [
  // Numéros de téléphone
  'téléphone', 'telephone', 'tel', 'phone', 'appel', 'appelle', 'numero', 'numéro',
  'whatsapp', 'whatsap', 'what\'s app', 'whatapp', 'wassap', 'watsap',
  'contact', 'contacte', 'contactez', 'joindre', 'joignable',
  'sms', 'texto', 'message', 'messenger','06', '05', '08', '09' ,'+242 ' , '0','6','1','2','3','4','5','7','8','9',
  
  // Email
  'email', 'e-mail', 'mail', 'gmail', 'yahoo', 'hotmail', 'outlook',
  'arobase', '@', 'at',
  
  // Réseaux sociaux
  'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'telegram',
  'fb', 'insta', 'snap',
  
  // Autres moyens de contact
  'skype', 'zoom', 'discord', 'signal',
  'appelle-moi', 'appel moi', 'contacte moi', 'écris moi', 'ecris moi',
];

// Mots interdits pour les localisations précises
const LOCATION_KEYWORDS = [
  // Directions précises
  'derrière', 'derriere', 'devant', 'à côté', 'a cote', 'en face',
  'face à', 'face a', 'près de', 'pres de', 'proche de',
  'après', 'apres', 'avant', 'juste après', 'juste avant',
  'tournez', 'tourner', 'direction', 'vers', 'côté',
  
  // Points de repère spécifiques
  'arrêt', 'arret', 'station', 'gare', 'marché', 'marche',
  'école', 'ecole', 'hôpital', 'hopital', 'pharmacie',
  'banque', 'atm', 'distributeur', 'magasin', 'boutique',
  'restaurant', 'bar', 'café', 'cafe', 'boulangerie',
  
  // Indications de rue
  'rue', 'avenue', 'boulevard', 'place', 'rond-point', 'carrefour',
  'intersection', 'croisement', 'passage', 'allée', 'allee',
  'impasse', 'route', 'chemin',
  
  // Numéros d'adresse
  'numéro', 'numero', 'n°', 'no', 'bis', 'ter',
  
  // Directions cardinales avec précision
  'exactement', 'précisément', 'precisement', 'pile',
  'mètres', 'metres', 'kilomètres', 'kilometres', 'km', 'mtre',
  'minutes à pied', 'min à pied', 'pas de',
];

// Patterns pour détecter les numéros de téléphone
const PHONE_PATTERNS = [
  /\b\d{2}[\s\-\.]*\d{2}[\s\-\.]*\d{2}[\s\-\.]*\d{2}[\s\-\.]*\d{2}\b/, // 06 05 04 03 02
  /\b\d{3}[\s\-\.]*\d{3}[\s\-\.]*\d{3}\b/, // 065 040 302
  /\b\+\d{1,3}[\s\-\.]*\d{8,12}\b/, // +33 ou +242 suivi de chiffres
  /\b00\d{1,3}[\s\-\.]*\d{8,12}\b/, // 0033 ou 00242
  /\b0[6-9]\d{8}\b/, // Format français 06/07/08/09
  /\b\d{9,12}\b/, // Séquences de 9-12 chiffres
];

// Patterns pour détecter les emails
const EMAIL_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  /\b[A-Za-z0-9._%+-]+[\s]*@[\s]*[A-Za-z0-9.-]+[\s]*\.[\s]*[A-Z|a-z]{2,}\b/,
  /\b[A-Za-z0-9._%+-]+[\s]*arobase[\s]*[A-Za-z0-9.-]+[\s]*point[\s]*[A-Z|a-z]{2,}\b/,
];

export interface FilterResult {
  isValid: boolean;
  errors: string[];
  cleanedText: string;
}

export function validateDescription(text: string): FilterResult {
  const errors: string[] = [];
  let cleanedText = text;
  
  if (!text || text.trim().length === 0) {
    return { isValid: true, errors: [], cleanedText: '' };
  }

  const lowerText = text.toLowerCase();
  
  // Vérifier les mots interdits de contact
  const foundContactWords = CONTACT_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  if (foundContactWords.length > 0) {
    errors.push(`❌ Informations de contact interdites: ${foundContactWords.join(', ')}`);
  }
  
  // Vérifier les mots interdits de localisation
  const foundLocationWords = LOCATION_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  if (foundLocationWords.length > 0) {
    errors.push(`📍 Localisation précise interdite: ${foundLocationWords.join(', ')}`);
  }
  
  // Vérifier les patterns de numéros de téléphone
  const phoneMatches = PHONE_PATTERNS.some(pattern => pattern.test(text));
  if (phoneMatches) {
    errors.push('📞 Numéro de téléphone détecté dans le texte');
  }
  
  // Vérifier les patterns d'email
  const emailMatches = EMAIL_PATTERNS.some(pattern => pattern.test(text));
  if (emailMatches) {
    errors.push('📧 Adresse email détectée dans le texte');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanedText
  };
}

// Fonction pour nettoyer automatiquement le texte (optionnel)
export function cleanDescription(text: string): string {
  let cleaned = text;
  
  // Supprimer les numéros de téléphone
  PHONE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '[NUMÉRO SUPPRIMÉ]');
  });
  
  // Supprimer les emails
  EMAIL_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '[EMAIL SUPPRIMÉ]');
  });
  
  return cleaned;
}