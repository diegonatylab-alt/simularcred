import { useState, useMemo, useCallback } from 'preact/hooks';
import { maxPrincipalFrench, maxPrincipalGerman, calculateFrench, calculateGerman } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';

const CURRENCIES = ['MXN', 'COP', 'CLP', 'PEN', 'ARS', 'USD'];

const SALARY_DEFAULTS: Record<string, number> = {
  MXN: 25000,
  COP: 3000000,
  CLP: 800000,
  PEN: 3000,
  ARS: 1500000,
  USD: 4000,
};

const SALARY_MAX: Record<string, number> = {
  MXN: 200000,
  COP: 30000000,
  CLP: 8000000,
  PEN: 30000,
  ARS: 15000000,
  USD: 30000,
};

const SALARY_STEP: Record<string, number> = {
  MXN: 1000,
  COP: 100000,
  CLP: 10000,
  PEN: 100,
  ARS: 50000,
  USD: 100,
};

const DEBT_RATIOS = [
  { value: 0.25, label: '25% — Conservador' },
  { value: 0.30, label: '30% — Recomendado' },
  { value: 0.35, label: '35% — Moderado' },
  { value: 0.40, label: '40% — Máximo' },
];

export default function SalaryCalculator({ currency: defaultCurrency = 'MXN' }: { currency?: string }) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [salary, setSalary] = useState(SALARY_DEFAULTS[defaultCurrency] ?? 25000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [debtRatio, setDebtRatio] = useState(0.30);

  // Reset salary when currency changes
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setCurrency(newCurrency);
    setSalary(SALARY_DEFAULTS[newCurrency] ?? 25000);
  }, []);

  const monthlyCapacity = useMemo(() => salary * debtRatio, [salary, debtRatio]);
  const termMonths = years * 12;

  const maxFrench = useMemo(
    () => maxPrincipalFrench(monthlyCapacity, rate, termMonths),
    [monthlyCapacity, rate, termMonths],
  );
  const maxGerman = useMemo(
    () => maxPrincipalGerman(monthlyCapacity, rate, termMonths),
    [monthlyCapacity, rate, termMonths],
  );

  const frenchResult = useMemo(
    () => calculateFrench({ principal: maxFrench, annualRate: rate, termMonths }),
    [maxFrench, rate, termMonths],
  );
  const germanResult = useMemo(
    () => calculateGerman({ principal: maxGerman, annualRate: rate, termMonths }),
    [maxGerman, rate, termMonths],
  );

  const fmt = (n: number) => formatCurrency(n, currency);

  return (
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8">
      <h2 class="text-xl font-bold text-primary-800 dark:text-primary-400 mb-2">
        ¿Cuánto me prestan con mi sueldo?
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Ingresa tu sueldo neto mensual y te mostramos el monto máximo de crédito que podrías solicitar.
      </p>

      {/* Inputs */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Currency */}
        <div>
          <label htmlFor="sal-currency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
          <select
            id="sal-currency"
            value={currency}
            onChange={(e) => handleCurrencyChange((e.target as HTMLSelectElement).value)}
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Debt ratio */}
        <div>
          <label htmlFor="sal-ratio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            % del sueldo para cuota
          </label>
          <select
            id="sal-ratio"
            value={debtRatio}
            onChange={(e) => setDebtRatio(Number((e.target as HTMLSelectElement).value))}
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {DEBT_RATIOS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Salary */}
      <div class="mb-5">
        <label htmlFor="sal-salary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sueldo neto mensual: <span class="font-bold text-primary-700 dark:text-primary-400">{fmt(salary)}</span>
        </label>
        <input
          type="range"
          min={SALARY_STEP[currency] ?? 1000}
          max={SALARY_MAX[currency] ?? 200000}
          step={SALARY_STEP[currency] ?? 1000}
          value={salary}
          aria-label="Sueldo neto mensual (deslizador)"
          onInput={(e) => setSalary(Number((e.target as HTMLInputElement).value))}
          class="w-full h-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg appearance-none cursor-pointer accent-primary-700"
        />
        <input
          type="number"
          id="sal-salary"
          value={salary}
          onInput={(e) => setSalary(Number((e.target as HTMLInputElement).value))}
          class="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Rate */}
      <div class="mb-5">
        <label htmlFor="sal-rate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tasa anual: <span class="font-bold text-primary-700 dark:text-primary-400">{rate}%</span>
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
      </div>

      {/* Years */}
      <div class="mb-6">
        <label htmlFor="sal-years" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
      </div>

      {/* Capacity indicator */}
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">Tu capacidad de pago mensual:</span>
          <span class="text-lg font-bold text-primary-700 dark:text-primary-400">{fmt(monthlyCapacity)}</span>
        </div>
        <div class="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(debtRatio / 0.40 * 100, 100)}%` }}
          />
        </div>
        <p class="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
          Se recomienda destinar máximo 30% del sueldo a cuotas de crédito.
        </p>
      </div>

      {/* Results */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <h3 class="font-bold text-primary-800 dark:text-primary-400 mb-3 text-sm">Sistema Francés (cuota fija)</h3>
          <p class="text-2xl font-extrabold text-primary-900 dark:text-primary-100 mb-3">{fmt(maxFrench)}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Cuota mensual:</span>
              <span class="font-bold dark:text-gray-200">{fmt(frenchResult.monthlyPayment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total a pagar:</span>
              <span class="font-bold dark:text-gray-200">{fmt(frenchResult.totalPayment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total intereses:</span>
              <span class="font-bold text-red-700 dark:text-red-400">{fmt(frenchResult.totalInterest)}</span>
            </div>
          </div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <h3 class="font-bold text-green-800 dark:text-green-300 mb-3 text-sm">Sistema Alemán (capital fijo)</h3>
          <p class="text-2xl font-extrabold text-green-900 dark:text-green-100 mb-3">{fmt(maxGerman)}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Primera cuota:</span>
              <span class="font-bold dark:text-gray-200">{fmt(germanResult.monthlyPayment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total a pagar:</span>
              <span class="font-bold dark:text-gray-200">{fmt(germanResult.totalPayment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total intereses:</span>
              <span class="font-bold text-red-700 dark:text-red-400">{fmt(germanResult.totalInterest)}</span>
            </div>
          </div>
        </div>
      </div>

      <p class="mt-4 text-[11px] text-gray-500 dark:text-gray-500">
        * Cálculo orientativo. El monto real depende de la evaluación crediticia de cada entidad financiera.
      </p>
    </div>
  );
}
