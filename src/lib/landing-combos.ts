export interface LandingCombo {
  slug: string;
  amount: number;
  years: number;
  rate: number;
  currency: string;
  country: string;
  title: string;
  description: string;
}

// MAX_COMBOS: Set to ~150 for dev builds. For production with ~5000 combos,
// set MAX_COMBOS = Infinity or remove the limit.
export const MAX_COMBOS = 150;

interface CurrencyConfig {
  currency: string;
  country: string;
  amounts: number[];
  rates: number[];
  smallThreshold: number;
  largeThreshold: number;
}

const CONFIGS: CurrencyConfig[] = [
  {
    currency: 'MXN',
    country: 'México',
    amounts: [50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 5000000],
    rates: [9, 12, 15, 18],
    smallThreshold: 100000,
    largeThreshold: 1000000,
  },
  {
    currency: 'COP',
    country: 'Colombia',
    amounts: [5000000, 10000000, 20000000, 50000000, 100000000, 200000000],
    rates: [10, 14, 18, 24],
    smallThreshold: 10000000,
    largeThreshold: 100000000,
  },
  {
    currency: 'CLP',
    country: 'Chile',
    amounts: [5000000, 10000000, 20000000, 50000000, 100000000],
    rates: [6, 8, 10, 14],
    smallThreshold: 10000000,
    largeThreshold: 50000000,
  },
  {
    currency: 'PEN',
    country: 'Perú',
    amounts: [10000, 20000, 50000, 100000, 200000, 500000],
    rates: [8, 12, 15, 18],
    smallThreshold: 20000,
    largeThreshold: 200000,
  },
  {
    currency: 'ARS',
    country: 'Argentina',
    amounts: [1000000, 5000000, 10000000, 50000000, 100000000],
    rates: [40, 60, 80, 100],
    smallThreshold: 5000000,
    largeThreshold: 50000000,
  },
  {
    currency: 'USD',
    country: 'Estados Unidos',
    amounts: [5000, 10000, 20000, 50000, 100000, 200000, 500000],
    rates: [6, 8, 10, 12],
    smallThreshold: 10000,
    largeThreshold: 100000,
  },
];

const TERMS = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

function makeSlug(amount: number, currency: string, years: number, rate: number): string {
  return `${amount}-${currency.toLowerCase()}-${years}-anos-${rate}-porciento`;
}

function makeTitle(amount: number, currency: string, years: number, rate: number, country: string): string {
  return `Crédito ${currency} ${amount.toLocaleString('es-MX')} a ${years} año${years > 1 ? 's' : ''} al ${rate}% — ${country}`;
}

function makeDescription(amount: number, currency: string, years: number, rate: number, country: string): string {
  return `Simula un préstamo de ${currency} ${amount.toLocaleString('es-MX')} a ${years} año${years > 1 ? 's' : ''} con tasa del ${rate}% anual en ${country}. Tabla de amortización francesa y alemana.`;
}

export function generateCombos(): LandingCombo[] {
  const combos: LandingCombo[] = [];

  for (const config of CONFIGS) {
    for (const amount of config.amounts) {
      for (const rate of config.rates) {
        for (const years of TERMS) {
          // No terms >10 years for small amounts
          if (amount <= config.smallThreshold && years > 10) continue;
          // No terms <3 years for large amounts
          if (amount >= config.largeThreshold && years < 3) continue;

          combos.push({
            slug: makeSlug(amount, config.currency, years, rate),
            amount,
            years,
            rate,
            currency: config.currency,
            country: config.country,
            title: makeTitle(amount, config.currency, years, rate, config.country),
            description: makeDescription(amount, config.currency, years, rate, config.country),
          });
        }
      }
    }
  }

  if (MAX_COMBOS !== Infinity && combos.length > MAX_COMBOS) {
    return combos.slice(0, MAX_COMBOS);
  }
  return combos;
}
