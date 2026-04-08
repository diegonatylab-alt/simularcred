import { useState } from 'preact/hooks';
import type { AmortizationRow } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';

interface Props {
  schedule: AmortizationRow[];
  currency: string;
}

const PAGE_SIZE = 60;

export default function AmortizationTable({ schedule, currency }: Props) {
  const [page, setPage] = useState(1);
  const fmt = (n: number) => formatCurrency(n, currency);
  const totalPages = Math.ceil(schedule.length / PAGE_SIZE);
  const rows = schedule.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border-collapse">
        <thead>
          <tr class="bg-primary-800 text-white">
            {['Mes', 'Fecha', 'Cuota', 'Capital', 'Interés', 'Saldo', 'Interés Acum.', 'Capital Acum.'].map((h) => (
              <th key={h} class="px-3 py-2 text-right first:text-left whitespace-nowrap font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.month}
              class="even:bg-gray-50 hover:bg-primary-50 transition-colors"
            >
              <td class="px-3 py-2 text-left font-medium">{row.month}</td>
              <td class="px-3 py-2 text-right whitespace-nowrap">{row.date}</td>
              <td class="px-3 py-2 text-right">{fmt(row.payment)}</td>
              <td class="px-3 py-2 text-right text-blue-700">{fmt(row.principalPart)}</td>
              <td class="px-3 py-2 text-right text-red-600">{fmt(row.interestPart)}</td>
              <td class="px-3 py-2 text-right">{fmt(row.balance)}</td>
              <td class="px-3 py-2 text-right text-red-500">{fmt(row.cumulativeInterest)}</td>
              <td class="px-3 py-2 text-right text-blue-500">{fmt(row.cumulativePrincipal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div class="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            class="px-3 py-1 rounded border disabled:opacity-40 hover:bg-primary-50"
          >
            ← Anterior
          </button>
          <span class="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            class="px-3 py-1 rounded border disabled:opacity-40 hover:bg-primary-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
