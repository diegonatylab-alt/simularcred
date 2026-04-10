import { useEffect, useRef, useState } from 'preact/hooks';
import type { AmortizationRow } from '../lib/amortization';
import { formatCurrency } from '../lib/formatters';

interface Props {
  frenchSchedule: AmortizationRow[];
  germanSchedule: AmortizationRow[];
  currency: string;
}

export default function LoanChart({ frenchSchedule, germanSchedule, currency }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [showGerman, setShowGerman] = useState(false);
  const fmt = (n: number) => formatCurrency(n, currency);

  useEffect(() => {
    let destroyed = false;

    async function initChart() {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (destroyed || !canvasRef.current) return;

      const schedule = showGerman ? germanSchedule : frenchSchedule;
      const labels = schedule.map((r) => `Mes ${r.month}`);
      const balanceData = schedule.map((r) => r.balance);
      const cumInterestData = schedule.map((r) => r.cumulativeInterest);
      const cumPrincipalData = schedule.map((r) => r.cumulativePrincipal);

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Saldo Restante',
              data: balanceData,
              borderColor: '#1e40af',
              backgroundColor: 'rgba(30,64,175,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'Interés Acumulado',
              data: cumInterestData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.06)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: 'Capital Amortizado',
              data: cumPrincipalData,
              borderColor: '#16a34a',
              backgroundColor: 'rgba(22,163,74,0.06)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (value) => fmt(Number(value)),
              },
            },
          },
        },
      });
    }

    initChart();

    return () => {
      destroyed = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [showGerman, frenchSchedule, germanSchedule, currency]);

  return (
    <div>
      <div class="flex items-center gap-3 mb-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sistema:</span>
        <button
          onClick={() => setShowGerman(false)}
          class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !showGerman ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Francés
        </button>
        <button
          onClick={() => setShowGerman(true)}
          class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            showGerman ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Alemán
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
