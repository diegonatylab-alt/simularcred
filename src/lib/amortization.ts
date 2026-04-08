export interface LoanInput {
  principal: number;
  annualRate: number;
  termMonths: number;
  startDate?: Date;
}

export interface AmortizationRow {
  month: number;
  date: string;
  payment: number;
  principalPart: number;
  interestPart: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanResult {
  system: 'french' | 'german';
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  interestToCapitalRatio: number;
  schedule: AmortizationRow[];
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateFrench(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const start = input.startDate ?? new Date();
  const r = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment =
      (principal * r * Math.pow(1 + r, termMonths)) /
      (Math.pow(1 + r, termMonths) - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPart = balance * r;
    let principalPart = monthlyPayment - interestPart;

    if (month === termMonths) {
      principalPart = balance;
    }

    balance = Math.max(0, balance - principalPart);
    cumulativeInterest += interestPart;
    cumulativePrincipal += principalPart;

    schedule.push({
      month,
      date: formatDate(addMonths(start, month)),
      payment: principalPart + interestPart,
      principalPart: round2(principalPart),
      interestPart: round2(interestPart),
      balance: round2(balance),
      cumulativeInterest: round2(cumulativeInterest),
      cumulativePrincipal: round2(cumulativePrincipal),
    });
  }

  const totalPayment = schedule.reduce((s, r) => s + r.payment, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interestPart, 0);

  return {
    system: 'french',
    monthlyPayment: round2(monthlyPayment),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    totalPrincipal: principal,
    interestToCapitalRatio: round2(totalInterest / principal),
    schedule,
  };
}

export function calculateGerman(input: LoanInput): LoanResult {
  const { principal, annualRate, termMonths } = input;
  const start = input.startDate ?? new Date();
  const r = annualRate / 100 / 12;
  const fixedCapital = principal / termMonths;

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPart = balance * r;
    const principalPart = month === termMonths ? balance : fixedCapital;
    const payment = principalPart + interestPart;

    balance = Math.max(0, balance - principalPart);
    cumulativeInterest += interestPart;
    cumulativePrincipal += principalPart;

    schedule.push({
      month,
      date: formatDate(addMonths(start, month)),
      payment: round2(payment),
      principalPart: round2(principalPart),
      interestPart: round2(interestPart),
      balance: round2(balance),
      cumulativeInterest: round2(cumulativeInterest),
      cumulativePrincipal: round2(cumulativePrincipal),
    });
  }

  const totalPayment = schedule.reduce((s, r) => s + r.payment, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interestPart, 0);
  const firstPayment = schedule[0]?.payment ?? 0;

  return {
    system: 'german',
    monthlyPayment: round2(firstPayment),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    totalPrincipal: principal,
    interestToCapitalRatio: round2(totalInterest / principal),
    schedule,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
