import { FinancingConfig } from '../types';
import { calculateDebtSchedule } from '../utils';
import { Landmark, HelpCircle, ShieldAlert, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancingTabProps {
  config: FinancingConfig;
  onChange: (config: FinancingConfig) => void;
  totalInvestment: number;
}

export function FinancingTab({ config, onChange, totalInvestment }: FinancingTabProps) {
  const schedule = calculateDebtSchedule(config);

  const handleDebtChange = (val: number) => {
    // Prevent borrowing more than total investment
    const debtAmount = Math.min(totalInvestment, Math.max(0, val));
    onChange({ ...config, debtAmount });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  // Chart data: Principal vs Interest
  const chartData = schedule.map(s => ({
    name: `Año ${s.year}`,
    'Abono Capital': Math.round(s.principal),
    'Interés Pagado': Math.round(s.interest),
  }));

  const totalInterestPaid = schedule.reduce((sum, s) => sum + s.interest, 0);
  const totalDebtPaid = schedule.reduce((sum, s) => sum + s.payment, 0);  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Inversión Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{formatCurrency(totalInvestment)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Límite máximo de crédito</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-full h-full bg-indigo-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Monto del Préstamo</p>
          <p className="text-2xl font-black text-indigo-600 mt-1.5">{formatCurrency(config.debtAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {totalInvestment > 0 ? `${((config.debtAmount / totalInvestment) * 100).toFixed(0)}%` : '0%'} de la inversión inicial
          </p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: totalInvestment > 0 ? `${(config.debtAmount / totalInvestment) * 100}%` : '0%' }}></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Intereses a Pagar</p>
          <p className="text-2xl font-black text-rose-600 mt-1.5">{formatCurrency(totalInterestPaid)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Costo total del financiamiento bancario</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-rose-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Pagado al Banco</p>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">{formatCurrency(totalDebtPaid)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Suma de capital más intereses totales</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Settings and Chart */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600" />
              Parámetros de Crédito Bancario
            </h4>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Monto del Préstamo ($)
                </label>
                <input
                  type="range"
                  min="0"
                  max={totalInvestment}
                  step="500"
                  value={config.debtAmount}
                  onChange={(e) => handleDebtChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between items-center mt-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400">$0</span>
                  <span className="text-xs font-black text-indigo-600">{formatCurrency(config.debtAmount)}</span>
                  <span className="text-[10px] font-bold text-slate-400">{formatCurrency(totalInvestment)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tasa de Interés Anual (EA)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={config.interestRate * 100}
                    onChange={(e) => onChange({ ...config, interestRate: parseFloat(e.target.value) / 100 })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 w-16 text-right bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                    {(config.interestRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Plazo del Crédito (Años)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={config.termYears}
                    onChange={(e) => onChange({ ...config, termYears: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 w-16 text-right bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                    {config.termYears} Años
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-xs">
            <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-700">Sistema de Amortización Francés</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                La cuota periódica (anual en este caso) es constante durante todo el plazo de pago. Al inicio se pagan más intereses y menos capital, y hacia el final la relación se invierte, amortizando más capital por año.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Amortization Schedule Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">Tabla de Amortización Francesa Anual</h4>
              <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">Cuota Fija: {formatCurrency(schedule[0]?.payment || 0)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                    <th className="py-3 px-6">Período</th>
                    <th className="py-3 px-6 text-right">Saldo Inicial</th>
                    <th className="py-3 px-6 text-right">Cuota Anual</th>
                    <th className="py-3 px-6 text-right">Intereses</th>
                    <th className="py-3 px-6 text-right">Abono Capital</th>
                    <th className="py-3 px-6 text-right">Saldo Insoluto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {schedule.map((row) => {
                    const startBalance = row.remainingDebt + row.principal;
                    return (
                      <tr key={row.year} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-6 font-bold font-sans text-slate-700">Año {row.year}</td>
                        <td className="py-3.5 px-6 text-right text-slate-500">
                          {formatCurrency(startBalance)}
                        </td>
                        <td className="py-3.5 px-6 text-right text-slate-900 font-bold">
                          {formatCurrency(row.payment)}
                        </td>
                        <td className="py-3.5 px-6 text-right text-rose-500 font-semibold">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="py-3.5 px-6 text-right text-emerald-600 font-semibold">
                          {formatCurrency(row.principal)}
                        </td>
                        <td className="py-3.5 px-6 text-right text-slate-900 font-bold">
                          {formatCurrency(row.remainingDebt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-indigo-600" />
              Desglose Anual de Cuota (Capital vs. Intereses)
            </h4>
            <div className="h-64">
              {config.debtAmount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Abono Capital" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Interés Pagado" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                  Sin financiamiento bancario configurado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
