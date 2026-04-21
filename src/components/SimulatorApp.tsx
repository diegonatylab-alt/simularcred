import { useState, useMemo, useRef, useEffect, useCallback } from 'preact/hooks';
import type { ComponentType } from 'preact';
import { calculateFrench, calculateGerman } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';
import { exportCSV, exportPDF } from '../lib/export';
import { affiliatesByCurrency } from '../lib/affiliates';
import type { AffiliateOffer } from '../lib/affiliates';
import AmortizationTable from './AmortizationTable';

function readParamsFromURL(defaults: { amount: number; rate: number; years: number; currency: string }) {
  if (typeof window === 'undefined') return defaults;
  const p = new URLSearchParams(window.location.search);
  const a = Number(p.get('a'));
  const r = Number(p.get('r'));
  const t = Number(p.get('t'));
  const c = p.get('c');
  return {
    amount: a > 0 ? a : defaults.amount,
    rate: r > 0 ? r : defaults.rate,
    years: t > 0 ? t : defaults.years,
    currency: c && ['MXN','COP','CLP','PEN','ARS','USD'].includes(c.toUpperCase()) ? c.toUpperCase() : defaults.currency,
  };
}

function buildShareURL(amount: number, rate: number, years: number, currency: string) {
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${base}?a=${amount}&r=${rate}&t=${years}&c=${currency}`;
}

function useLazyComponent<P>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  rootMargin = '200px',
) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          importFn().then((mod) => setComponent(() => mod.default));
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { Component, sentinelRef };
}

interface Props {
  defaultAmount?: number;
  defaultRate?: number;
  defaultYears?: number;
  currency?: string;
  maxAmount?: number;
}

const CURRENCIES = ['MXN', 'COP', 'CLP', 'PEN', 'ARS', 'USD'];

export default function SimulatorApp({
  defaultAmount = 100000,
  defaultRate = 12,
  defaultYears = 5,
  currency: defaultCurrency = 'MXN',
  maxAmount = 10000000,
}: Props) {
  const initial = useMemo(() => readParamsFromURL({
    amount: defaultAmount, rate: defaultRate, years: defaultYears, currency: defaultCurrency,
  }), []);

  const [amount, setAmount] = useState(initial.amount);
  const [rate, setRate] = useState(initial.rate);
  const [years, setYears] = useState(initial.years);
  const [currency, setCurrency] = useState(initial.currency);
  const [tableSystem, setTableSystem] = useState<'french' | 'german'>('french');
  const [copied, setCopied] = useState(false);
  const isFirstRender = useRef(true);

  // Sync state → URL (skip first render to avoid forced reflow)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const url = buildShareURL(amount, rate, years, currency);
    window.history.replaceState(null, '', url);
  }, [amount, rate, years, currency]);

  const shareURL = buildShareURL(amount, rate, years, currency);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareURL]);

  const { Component: LoanChart, sentinelRef: chartSentinel } = useLazyComponent(
    () => import('./Chart'),
  );

  const french = useMemo(
    () => calculateFrench({ principal: amount, annualRate: rate, termMonths: years * 12 }),
    [amount, rate, years],
  );

  const german = useMemo(
    () => calculateGerman({ principal: amount, annualRate: rate, termMonths: years * 12 }),
    [amount, rate, years],
  );

  const fmt = (n: number) => formatCurrency(n, currency);

  const handleWhatsApp = useCallback(() => {
    const text = `Mira esta simulación de crédito: ${formatCurrency(amount, currency)} a ${rate}% en ${years} año${years !== 1 ? 's' : ''} (${currency})\n${shareURL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }, [shareURL, amount, rate, years, currency]);
  const activeSchedule = tableSystem === 'french' ? french.schedule : german.schedule;

  return (
    <div>
      {/* Calculator Inputs */}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8 mb-10">
        <h2 class="text-xl font-bold text-primary-800 dark:text-primary-400 mb-6">Configura tu Préstamo</h2>

        {/* Currency */}
        <div class="mb-5">
          <label htmlFor="sim-currency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
          <select
            id="sim-currency"
            value={currency}
            onChange={(e) => setCurrency((e.target as HTMLSelectElement).value)}
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div class="mb-5">
          <label htmlFor="sim-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto del Préstamo: <span class="font-bold text-primary-700 dark:text-primary-400">{fmt(amount)}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={maxAmount}
            step={1000}
            value={amount}
            aria-label="Monto del préstamo (deslizador)"
            onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            id="sim-amount"
            value={amount}
            onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Rate */}
        <div class="mb-5">
          <label htmlFor="sim-rate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tasa Anual: <span class="font-bold text-primary-700 dark:text-primary-400">{rate}%</span>
          </label>
          <input
            type="range"
            min={1}
            max={120}
            step={0.5}
            value={rate}
            aria-label="Tasa anual (deslizador)"
            onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            id="sim-rate"
            value={rate}
            step={0.1}
            onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Years */}
        <div class="mb-6">
          <label htmlFor="sim-years" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plazo: <span class="font-bold text-primary-700 dark:text-primary-400">{years} año{years !== 1 ? 's' : ''}</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            aria-label="Plazo en años (deslizador)"
            onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            id="sim-years"
            value={years}
            onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Results Comparison */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h3 class="font-bold text-primary-800 dark:text-primary-400 mb-3 text-sm">Sistema Francés (cuota fija)</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Cuota mensual:</span>
                <span class="font-bold text-primary-800 dark:text-primary-400">{fmt(french.monthlyPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total a pagar:</span>
                <span class="font-bold dark:text-gray-200">{fmt(french.totalPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total intereses:</span>
                <span class="font-bold text-red-700 dark:text-red-400">{fmt(french.totalInterest)}</span>
              </div>
            </div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <h3 class="font-bold text-green-800 dark:text-green-300 mb-3 text-sm">Sistema Alemán (capital fijo)</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Primera cuota:</span>
                <span class="font-bold text-green-800 dark:text-green-300">{fmt(german.monthlyPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total a pagar:</span>
                <span class="font-bold dark:text-gray-200">{fmt(german.totalPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total intereses:</span>
                <span class="font-bold text-red-700 dark:text-red-400">{fmt(german.totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Share bar */}
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopy}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
          </button>
          <button
            onClick={handleWhatsApp}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Compartir por WhatsApp
          </button>
        </div>
      </div>

      {/* Affiliate CTA — only when offers exist for the selected currency */}
      {(affiliatesByCurrency[currency] ?? []).length > 0 && (
        <div class="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl p-6 md:p-8 mb-10">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-3">
            Ofertas de crédito disponibles
          </p>
          <div class="space-y-4">
            {(affiliatesByCurrency[currency] as AffiliateOffer[]).map((offer) => (
              <div key={offer.url} class="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{offer.name}</span>
                    {offer.badge && (
                      <span class="inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                        {offer.badge}
                      </span>
                    )}
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{offer.description}</p>
                </div>
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors whitespace-nowrap"
                >
                  Solicitar ahora
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            ))}
          </div>
          <p class="mt-3 text-[11px] text-gray-500 dark:text-gray-500">
            Publicidad · SimularCred puede recibir una comisión si solicitas un crédito a través de estos enlaces.
          </p>
        </div>
      )}

      {/* Chart */}
      <div ref={chartSentinel} class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8 mb-10">
        <h2 class="text-xl font-bold text-primary-800 dark:text-primary-400 mb-4">Evolución del Préstamo</h2>
        {LoanChart ? (
          <LoanChart
            frenchSchedule={french.schedule}
            germanSchedule={german.schedule}
            currency={currency}
          />
        ) : (
          <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Cargando gráfico…
          </div>
        )}
      </div>

      {/* Amortization Table */}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8 mb-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-primary-800 dark:text-primary-400">Tabla de Amortización</h2>
          <div class="flex gap-2">
            <button
              onClick={() => setTableSystem('french')}
              class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tableSystem === 'french'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Francés
            </button>
            <button
              onClick={() => setTableSystem('german')}
              class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tableSystem === 'german'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Alemán
            </button>
          </div>
        </div>
        <AmortizationTable schedule={activeSchedule} currency={currency} />

        {/* Export buttons */}
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => exportCSV(activeSchedule, currency, tableSystem)}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Descargar CSV
          </button>
          <button
            onClick={() => {
              const active = tableSystem === 'french' ? french : german;
              exportPDF(activeSchedule, currency, tableSystem, {
                amount, rate, years,
                monthlyPayment: active.monthlyPayment,
                totalPayment: active.totalPayment,
                totalInterest: active.totalInterest,
              });
            }}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
