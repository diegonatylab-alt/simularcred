/**
 * Affiliate offers indexed by currency.
 * To add a new affiliate, just push an entry to the corresponding currency array.
 */

export interface AffiliateOffer {
  /** Display name of the lender / product */
  name: string;
  /** Short value proposition (one line) */
  description: string;
  /** Affiliate tracking URL */
  url: string;
  /** Optional badge text, e.g. "Recomendado", "Rápido" */
  badge?: string;
}

export const affiliatesByCurrency: Record<string, AffiliateOffer[]> = {
  MXN: [
    {
      name: 'Sol Crédito MX',
      description: 'Créditos en línea rápidos y seguros en México. Solicita hasta $150,000 MXN.',
      url: 'https://dkfrh.com/g/wqiksqr21j9bc27b6f98bd6fe4c78f/',
      badge: 'Recomendado',
    },
    {
      name: 'Fidea',
      description: 'Encuentra el préstamo que se adapta a tus necesidades fácilmente en México. Flexibilidad. Confianza. Rápido y conveniente. Intereses Bajos.',
      url: 'https://bednari.com/g/zooimzunir9bc27b6f98dd97e777e7/',
      badge: 'Recomendado',
    },
    {
      name: 'Fiesta Credito',
      description: 'Obtén tu primer préstamo al 0% de interés. Respuesta inmediata.',
      url: 'https://ntzgd.com/g/o8imz4ub7p9bc27b6f984abe4b8882/',
      badge: '',
    },  
  ],
  COP: [
    {
      name: 'Sol Crédito CO',
      description: 'Créditos en línea rápidos y seguros en Colombia. Extra $1.500.000 desde 0% para eventos especiales.',
      url: 'https://lowest-prices.eu/a/PNoWDU5KmHjG7r',
      badge: 'Recomendado',
    },
  ],
  // Add more currencies as affiliates become available:
  // COP: [ { name: '...', description: '...', url: '...', badge: '...' } ],
  // CLP: [],
  // PEN: [],
  // ARS: [],
  // USD: [],
};
