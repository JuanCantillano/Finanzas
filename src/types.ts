export interface ProductProjection {
  id: string;
  name: string;
  price: number;
  monthlyVolume: number; // Volume in year 1, month 1
  cogs: number;          // Cost of Goods Sold per unit
  annualGrowth: number;  // Growth rate of volume per year (e.g., 0.1 for 10%)
}

export interface OperatingExpense {
  id: string;
  name: string;
  category: 'Administración' | 'Ventas' | 'Marketing' | 'Otros';
  monthlyCost: number;
  annualIncrease: number; // Annual increase rate (inflation)
}

export interface InvestmentItem {
  id: string;
  name: string;
  category: 'Activo Fijo' | 'Activo Intangible' | 'Capital de Trabajo';
  cost: number;
  source: 'Propio' | 'Financiado';
}

export interface FinancingConfig {
  debtAmount: number;
  interestRate: number; // Annual interest rate (e.g., 0.12 for 12%)
  termYears: number;
}

export interface FinancialYear {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  taxes: number; // e.g., 30% of EBIT - Interest if > 0
  netIncome: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  discountedCashFlow: number;
}

export interface FinancialIndicators {
  van: number; // Valor Actual Neto (NPV)
  tir: number; // Tasa Interna de Retorno (IRR)
  roi: number; // Retorno de Inversión
  paybackPeriod: number; // Years to recover investment
  breakEvenUnits: number; // Breakeven point in units for year 1
  breakEvenRevenue: number; // Breakeven point in currency for year 1
}

export interface SensitivityConfig {
  priceFactor: number;   // default 1.0 (multiplier)
  volumeFactor: number;  // default 1.0
  expenseFactor: number; // default 1.0
}
