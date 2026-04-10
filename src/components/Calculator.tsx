import { useState, useMemo } from 'preact/hooks';
import { calculateFrench, calculateGerman } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';

interface Props {
  defaultAmount?: number;
  defaultRate?: number;
  defaultYears?: number;
  currency?: string;
}

const CURRENCIES = ['MXN', 'COP', 'CLP', 'PEN', 'ARS', 'USD'];

export default function Calculator({
  defaultAmount = 100000,
  defaultRate = 12,
  defaultYears = 5,
  currency: defaultCurrency = 'MXN',
}: Props) {
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [system, setSystem] = useState<'french' | 'german'>('french');

  const result = useMemo(() => {
    const input = { principal: amount, annualRate: rate, termMonths: years * 12 };
    return system === 'french' ? calculateFrench(input) : calculateGerman(input);
  }, [amount, rate, years, system]);

  const fmt = (n: number) => formatCurrency(n, currency);

  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8">
      <h2 class="text-xl font-bold text-primary-800 dark:text-primary-400 mb-6">Configura tu Préstamo</h2>

      {/* Currency & System */}
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
          <select
            value={currency}
            onChange={(e) => setCurrency((e.target as HTMLSelectElement).value)}
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sistema</label>
          <select
            value={system}
            onChange={(e) => setSystem((e.target as HTMLSelectElement).value as 'french' | 'german')}
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="french">Francés (cuota fija)</option>
            <option value="german">Alemán (capital fijo)</option>
          </select>
        </div>
      </div>

      {/* Amount */}
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Monto del Préstamo: <span class="font-bold text-primary-700 dark:text-primary-400">{fmt(amount)}</span>
        </label>
        <input
          type="range"
          min={1000}
          max={10000000}
          step={1000}
          value={amount}
          onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
          class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
        />
        <input
          type="number"
          value={amount}
          onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
          class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Rate */}
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tasa Anual: <span class="font-bold text-primary-700 dark:text-primary-400">{rate}%</span>
        </label>
        <input
          type="range"
          min={1}
          max={120}
          step={0.5}
          value={rate}
          onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
          class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
        />
        <input
          type="number"
          value={rate}
          step={0.1}
          onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
          class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Years */}
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plazo: <span class="font-bold text-primary-700 dark:text-primary-400">{years} año{years !== 1 ? 's' : ''}</span>
        </label>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={years}
          onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
          class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
        />
        <input
          type="number"
          value={years}
          onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
          class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Results */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Cuota {system === 'german' ? 'inicial' : 'mensual'}</p>
          <p class="text-xl font-bold text-primary-800 dark:text-primary-400">{fmt(result.monthlyPayment)}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total a Pagar</p>
          <p class="text-xl font-bold text-primary-800 dark:text-primary-400">{fmt(result.totalPayment)}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Intereses</p>
          <p class="text-xl font-bold text-red-600 dark:text-red-400">{fmt(result.totalInterest)}</p>
        </div>
      </div>
    </div>
  );
}
