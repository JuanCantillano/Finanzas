import { ProductProjection, OperatingExpense, InvestmentItem, FinancingConfig, FinancialYear, FinancialIndicators, SensitivityConfig } from './types';

// Calculate NPV (VAN - Valor Actual Neto)
export function calculateNPV(initialInvestment: number, cashFlows: number[], discountRate: number): number {
  let npv = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
  }
  return npv;
}

// Calculate IRR (TIR - Tasa Interna de Retorno)
export function calculateIRR(initialInvestment: number, cashFlows: number[]): number {
  const flows = [-initialInvestment, ...cashFlows];
  
  // Basic secant method solver for IRR
  let r0 = 0.1; // initial guess 1
  let r1 = 0.2; // initial guess 2
  let maxIteration = 100;
  let precision = 1e-6;

  function npv(rate: number): number {
    let sum = 0;
    for (let i = 0; i < flows.length; i++) {
      sum += flows[i] / Math.pow(1 + rate, i);
    }
    return sum;
  }

  for (let i = 0; i < maxIteration; i++) {
    const npv0 = npv(r0);
    const npv1 = npv(r1);

    if (Math.abs(npv1 - npv0) < 1e-12) {
      break;
    }

    const rNew = r1 - (npv1 * (r1 - r0)) / (npv1 - npv0);

    if (Math.abs(rNew - r1) < precision) {
      // If result is valid (within reasonable bounds), return it
      if (!isNaN(rNew) && isFinite(rNew)) {
        return rNew;
      }
    }

    r0 = r1;
    r1 = rNew;
  }

  // Fallback to bisection method if secant method failed or produced unrealistic rates
  let low = -0.99;
  let high = 5.0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const midNpv = npv(mid);

    if (Math.abs(midNpv) < precision) {
      return mid;
    }

    const lowNpv = npv(low);
    if (lowNpv * midNpv < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return NaN;
}

// Generate French Amortization Debt Schedule (annual payments)
export interface DebtPayment {
  year: number;
  payment: number;
  interest: number;
  principal: number;
  remainingDebt: number;
}

export function calculateDebtSchedule(config: FinancingConfig): DebtPayment[] {
  const schedule: DebtPayment[] = [];
  const rate = config.interestRate;
  const term = config.termYears;
  let remainingDebt = config.debtAmount;

  if (remainingDebt <= 0) {
    return Array.from({ length: 5 }, (_, i) => ({
      year: i + 1,
      payment: 0,
      interest: 0,
      principal: 0,
      remainingDebt: 0,
    }));
  }

  // Annual payment formula: A = P * (r * (1+r)^n) / ((1+r)^n - 1)
  const annualPayment = rate > 0
    ? (remainingDebt * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    : remainingDebt / term;

  for (let y = 1; y <= 5; y++) {
    if (y <= term) {
      const interest = remainingDebt * rate;
      const principal = annualPayment - interest;
      remainingDebt = Math.max(0, remainingDebt - principal);

      schedule.push({
        year: y,
        payment: annualPayment,
        interest,
        principal,
        remainingDebt,
      });
    } else {
      schedule.push({
        year: y,
        payment: 0,
        interest: 0,
        principal: 0,
        remainingDebt: 0,
      });
    }
  }

  return schedule;
}

// Generate Financial Projections for 5 Years
export function projectFinancials(
  products: ProductProjection[],
  expenses: OperatingExpense[],
  investments: InvestmentItem[],
  financing: FinancingConfig,
  sensitivity: SensitivityConfig,
  taxRate: number = 0.25, // 25% corporate tax rate
  discountRate: number = 0.12 // 12% discount rate for NPV
): { years: FinancialYear[]; indicators: FinancialIndicators; totalInvestment: number; ownInvestment: number; debtInvestment: number } {
  
  const totalInvestment = investments.reduce((sum, item) => sum + item.cost, 0);
  const debtInvestment = financing.debtAmount;
  const ownInvestment = Math.max(0, totalInvestment - debtInvestment);

  // Calculate annual debt payment schedule
  const debtSchedule = calculateDebtSchedule(financing);

  // Asset values for straight-line depreciation (excluding intangible & working capital)
  const depreciableAssets = investments
    .filter(item => item.category === 'Activo Fijo')
    .reduce((sum, item) => sum + item.cost, 0);
  
  // Assume standard 10% straight-line annual depreciation for simplicity
  const annualDepreciation = depreciableAssets * 0.10;

  const years: FinancialYear[] = [];
  let cumulativeCashFlow = 0;

  for (let y = 1; y <= 5; y++) {
    const yearIndex = y - 1;

    // 1. Calculate Revenue (Ventas) and COGS (Costos Directos)
    let revenue = 0;
    let cogs = 0;

    products.forEach(p => {
      // Scale price & volume based on sensitivity configuration
      const basePrice = p.price * sensitivity.priceFactor;
      const baseVolume = p.monthlyVolume * 12 * sensitivity.volumeFactor; // annualized year 1

      // Volume grows over years (growth applies starting year 2)
      const yearVolume = baseVolume * Math.pow(1 + p.annualGrowth, yearIndex);
      
      revenue += yearVolume * basePrice;
      cogs += yearVolume * p.cogs;
    });

    // 2. Calculate Operating Expenses (Opex - Gastos Operativos)
    let opex = 0;
    expenses.forEach(e => {
      // Apply sensitivity factor to opex and grow with annual increase rate
      const baseMonthly = e.monthlyCost * sensitivity.expenseFactor;
      const annualized = baseMonthly * 12;
      opex += annualized * Math.pow(1 + e.annualIncrease, yearIndex);
    });

    // 3. EBITDA
    const ebitda = revenue - cogs - opex;

    // 4. Depreciation
    const depreciation = annualDepreciation;

    // 5. EBIT (Operating Income)
    const ebit = ebitda - depreciation;

    // 6. Interest expenses from debt schedule
    const interest = debtSchedule[yearIndex]?.interest || 0;

    // 7. Earnings Before Taxes (EBT)
    const ebt = ebit - interest;

    // 8. Taxes (Impuestos - only if EBT is positive)
    const taxes = ebt > 0 ? ebt * taxRate : 0;

    // 9. Net Income (Utilidad Neta)
    const netIncome = ebt - taxes;

    // 10. Cash Flow (Flujo de Caja Libre)
    // Formula: Net Income + Depreciation - Debt Principal Repayment (if any)
    const principalRepayment = debtSchedule[yearIndex]?.principal || 0;
    
    // Simplification: In Flow of Cash, we add back non-cash expenses like depreciation
    // and subtract principal debt repayments.
    const cashFlow = netIncome + depreciation - principalRepayment;

    cumulativeCashFlow += cashFlow;

    // Discounted Cash Flow for NPV (VAN)
    const discountedCashFlow = cashFlow / Math.pow(1 + discountRate, y);

    years.push({
      year: y,
      revenue,
      cogs,
      grossProfit: revenue - cogs,
      opex,
      ebitda,
      depreciation,
      ebit,
      interest,
      taxes,
      netIncome,
      cashFlow,
      cumulativeCashFlow,
      discountedCashFlow,
    });
  }

  // Calculate Viability Indicators
  const cashFlowsList = years.map(y => y.cashFlow);
  
  // NPV (VAN): Invest own capital (initial outflow) and get cashflows
  const van = calculateNPV(ownInvestment, cashFlowsList, discountRate);
  
  // IRR (TIR): Based on own investment as year 0, and net cash flows
  const tir = calculateIRR(ownInvestment, cashFlowsList);

  // ROI (Retorno de Inversión) = Total cumulative net income / initial investment
  const totalNetIncome = years.reduce((sum, y) => sum + y.netIncome, 0);
  const roi = totalInvestment > 0 ? (totalNetIncome / totalInvestment) : 0;

  // Payback Period (Periodo de Recuperación de Inversión)
  let paybackPeriod = 0;
  let remainingInvestment = ownInvestment;
  for (let i = 0; i < cashFlowsList.length; i++) {
    if (remainingInvestment > 0) {
      if (cashFlowsList[i] >= remainingInvestment) {
        paybackPeriod += remainingInvestment / cashFlowsList[i];
        remainingInvestment = 0;
      } else {
        paybackPeriod += 1;
        remainingInvestment -= cashFlowsList[i];
      }
    } else {
      break;
    }
  }
  if (remainingInvestment > 0) {
    paybackPeriod = 5.0; // did not recover within 5 years
  }

  // Breakeven Point in Year 1
  // Formula: Fixed Costs / (Weighted Margin %)
  // In our multi-product case:
  // Break-even revenue = Fixed Costs / Gross Profit Margin Ratio
  const year1FixedCosts = expenses.reduce((sum, e) => sum + e.monthlyCost * 12, 0) * sensitivity.expenseFactor + annualDepreciation;
  const year1TotalRevenue = products.reduce((sum, p) => sum + (p.monthlyVolume * 12 * p.price * sensitivity.priceFactor * sensitivity.volumeFactor), 0);
  const year1TotalCogs = products.reduce((sum, p) => sum + (p.monthlyVolume * 12 * p.cogs * sensitivity.volumeFactor), 0);
  const grossProfitMargin = year1TotalRevenue > 0 ? (year1TotalRevenue - year1TotalCogs) / year1TotalRevenue : 0;

  const breakEvenRevenue = grossProfitMargin > 0 ? year1FixedCosts / grossProfitMargin : 0;
  
  // Simple average price for breakeven units
  const totalUnitsYear1 = products.reduce((sum, p) => sum + (p.monthlyVolume * 12 * sensitivity.volumeFactor), 0);
  const avgPrice = totalUnitsYear1 > 0 ? year1TotalRevenue / totalUnitsYear1 : 0;
  const breakEvenUnits = avgPrice > 0 ? breakEvenRevenue / avgPrice : 0;

  return {
    years,
    indicators: {
      van,
      tir,
      roi,
      paybackPeriod,
      breakEvenUnits,
      breakEvenRevenue,
    },
    totalInvestment,
    ownInvestment,
    debtInvestment,
  };
}

// Pre-populate realistic mockup data for a startup
export const defaultProducts: ProductProjection[] = [
  { id: '1', name: 'Software SaaS Pro', price: 49.00, monthlyVolume: 120, cogs: 8.00, annualGrowth: 0.35 },
  { id: '2', name: 'Consultoría e Integración', price: 1500.00, monthlyVolume: 4, cogs: 300.00, annualGrowth: 0.15 },
];

export const defaultExpenses: OperatingExpense[] = [
  { id: '1', name: 'Sueldos del Equipo', category: 'Administración', monthlyCost: 4500, annualIncrease: 0.04 },
  { id: '2', name: 'Alquiler y Servicios', category: 'Administración', monthlyCost: 1200, annualIncrease: 0.03 },
  { id: '3', name: 'Campañas de Marketing', category: 'Marketing', monthlyCost: 1500, annualIncrease: 0.05 },
  { id: '4', name: 'Soporte y Herramientas Cloud', category: 'Otros', monthlyCost: 500, annualIncrease: 0.05 },
];

export const defaultInvestments: InvestmentItem[] = [
  { id: '1', name: 'Laptops y Equipos de Oficina', category: 'Activo Fijo', cost: 8000, source: 'Propio' },
  { id: '2', name: 'Mobiliario y Oficina', category: 'Activo Fijo', cost: 5000, source: 'Propio' },
  { id: '3', name: 'Licencias y Desarrollo de Software', category: 'Activo Intangible', cost: 12000, source: 'Financiado' },
  { id: '4', name: 'Fondo de Caja (Capital de Trabajo)', category: 'Capital de Trabajo', cost: 15000, source: 'Propio' },
];

export const defaultFinancing: FinancingConfig = {
  debtAmount: 12000,
  interestRate: 0.10, // 10% interest rate
  termYears: 3,       // 3-year term
};
