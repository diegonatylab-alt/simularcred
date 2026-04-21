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
  ],
  // Add more currencies as affiliates become available:
  // COP: [ { name: '...', description: '...', url: '...', badge: '...' } ],
  // CLP: [],
  // PEN: [],
  // ARS: [],
  // USD: [],
};
