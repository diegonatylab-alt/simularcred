import { useState, useMemo, useRef, useEffect } from 'preact/hooks';
import type { ComponentType } from 'preact';
import { calculateFrench, calculateGerman } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';
import AmortizationTable from './AmortizationTable';

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
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [tableSystem, setTableSystem] = useState<'french' | 'german'>('french');

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
      </div>

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
      </div>
    </div>
  );
}
