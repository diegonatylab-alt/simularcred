import type { AmortizationRow } from './amortization';
import { formatCurrency } from './formatters';

const HEADERS = ['Mes', 'Fecha', 'Cuota', 'Capital', 'Interés', 'Saldo', 'Interés Acum.', 'Capital Acum.'];

// ─── CSV ────────────────────────────────────────────────────────────────────────

export function exportCSV(schedule: AmortizationRow[], currency: string, system: string) {
  const fmt = (n: number) => n.toFixed(2);
  const lines = [
    HEADERS.join(','),
    ...schedule.map((r) =>
      [r.month, r.date, fmt(r.payment), fmt(r.principalPart), fmt(r.interestPart), fmt(r.balance), fmt(r.cumulativeInterest), fmt(r.cumulativePrincipal)].join(','),
    ),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `amortizacion-${system}-${currency}.csv`);
}

// ─── PDF ────────────────────────────────────────────────────────────────────────

export async function exportPDF(
  schedule: AmortizationRow[],
  currency: string,
  system: string,
  summary: { amount: number; rate: number; years: number; monthlyPayment: number; totalPayment: number; totalInterest: number },
) {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const fmt = (n: number) => formatCurrency(n, currency);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('SimularCred.com', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(`Tabla de Amortización — Sistema ${system === 'french' ? 'Francés' : 'Alemán'}`, 14, 24);

  // Summary
  doc.setFontSize(9);
  const summaryText = [
    `Monto: ${fmt(summary.amount)}`,
    `Tasa: ${summary.rate}%`,
    `Plazo: ${summary.years} año${summary.years !== 1 ? 's' : ''}`,
    `Cuota: ${fmt(summary.monthlyPayment)}`,
    `Total: ${fmt(summary.totalPayment)}`,
    `Intereses: ${fmt(summary.totalInterest)}`,
  ].join('   |   ');
  doc.text(summaryText, 14, 31);

  // Table
  (autoTable.default || autoTable)(doc, {
    startY: 36,
    head: [HEADERS],
    body: schedule.map((r) => [
      r.month,
      r.date,
      fmt(r.payment),
      fmt(r.principalPart),
      fmt(r.interestPart),
      fmt(r.balance),
      fmt(r.cumulativeInterest),
      fmt(r.cumulativePrincipal),
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    didDrawPage: (data: { pageNumber: number }) => {
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `SimularCred.com — Generado el ${new Date().toLocaleDateString('es-MX')} — Página ${data.pageNumber}`,
        14,
        doc.internal.pageSize.height - 8,
      );
    },
  });

  doc.save(`amortizacion-${system}-${currency}.pdf`);
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
