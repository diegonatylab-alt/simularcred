import { useState, useMemo } from 'preact/hooks';
import { calculateFrench, calculateGerman } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';
import LoanChart from './Chart';
import AmortizationTable from './AmortizationTable';

interface Props {
  defaultAmount?: number;
  defaultRate?: number;
  defaultYears?: number;
  currency?: string;
}

const CURRENCIES = ['MXN', 'COP', 'CLP', 'PEN', 'ARS', 'USD'];

export default function SimulatorApp({
  defaultAmount = 100000,
  defaultRate = 12,
  defaultYears = 5,
  currency: defaultCurrency = 'MXN',
}: Props) {
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [tableSystem, setTableSystem] = useState<'french' | 'german'>('french');

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
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-10">
        <h2 class="text-xl font-bold text-primary-800 mb-6">Configura tu Préstamo</h2>

        {/* Currency */}
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select
            value={currency}
            onChange={(e) => setCurrency((e.target as HTMLSelectElement).value)}
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Monto del Préstamo: <span class="font-bold text-primary-700">{fmt(amount)}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={10000000}
            step={1000}
            value={amount}
            onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            value={amount}
            onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Rate */}
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tasa Anual: <span class="font-bold text-primary-700">{rate}%</span>
          </label>
          <input
            type="range"
            min={1}
            max={120}
            step={0.5}
            value={rate}
            onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            value={rate}
            step={0.1}
            onInput={(e) => setRate(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Years */}
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Plazo: <span class="font-bold text-primary-700">{years} año{years !== 1 ? 's' : ''}</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-700"
          />
          <input
            type="number"
            value={years}
            onInput={(e) => setYears(Number((e.target as HTMLInputElement).value))}
            class="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Results Comparison */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 class="font-bold text-primary-800 mb-3 text-sm">Sistema Francés (cuota fija)</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Cuota mensual:</span>
                <span class="font-bold text-primary-800">{fmt(french.monthlyPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total a pagar:</span>
                <span class="font-bold">{fmt(french.totalPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total intereses:</span>
                <span class="font-bold text-red-600">{fmt(french.totalInterest)}</span>
              </div>
            </div>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 class="font-bold text-green-800 mb-3 text-sm">Sistema Alemán (capital fijo)</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Primera cuota:</span>
                <span class="font-bold text-green-800">{fmt(german.monthlyPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total a pagar:</span>
                <span class="font-bold">{fmt(german.totalPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total intereses:</span>
                <span class="font-bold text-red-600">{fmt(german.totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-10">
        <h2 class="text-xl font-bold text-primary-800 mb-4">Evolución del Préstamo</h2>
        <LoanChart
          frenchSchedule={french.schedule}
          germanSchedule={german.schedule}
          currency={currency}
        />
      </div>

      {/* Amortization Table */}
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-primary-800">Tabla de Amortización</h2>
          <div class="flex gap-2">
            <button
              onClick={() => setTableSystem('french')}
              class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tableSystem === 'french'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Francés
            </button>
            <button
              onClick={() => setTableSystem('german')}
              class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tableSystem === 'german'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
