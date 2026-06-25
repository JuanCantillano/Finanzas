import { FinancialYear, FinancialIndicators } from '../types';
import { MetricCard } from './MetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Award, DollarSign, Activity, Percent, ArrowUpRight, TrendingUp, Compass, AlertCircle } from 'lucide-react';

interface DashboardTabProps {
  years: FinancialYear[];
  indicators: FinancialIndicators;
  totalInvestment: number;
  ownInvestment: number;
  debtInvestment: number;
}

export function DashboardTab({
  years,
  indicators,
  totalInvestment,
  ownInvestment,
  debtInvestment,
}: DashboardTabProps) {

  const formatCurrency = (val: number) => {
    const sign = val < 0 ? '-' : '';
    return `${sign}C$ ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.abs(val))}`;
  };

  const formatPercent = (val: number) => {
    if (isNaN(val)) return '0.0%';
    return `${(val * 100).toFixed(1)}%`;
  };

  // Preparation of composite performance data
  const performanceData = years.map(y => ({
    name: `Año ${y.year}`,
    Ventas: Math.round(y.revenue),
    EBITDA: Math.round(y.ebitda),
    'Utilidad Neta': Math.round(y.netIncome),
  }));

  // Preparation of cash flow data
  const cashFlowData = years.map(y => ({
    name: `Año ${y.year}`,
    'Flujo Anual': Math.round(y.cashFlow),
    'Caja Acumulada': Math.round(y.cumulativeCashFlow),
  }));

  // Analysis status indicators
  const isViable = indicators.van > 0 && indicators.tir >= 0.12;

  return (
    <div className="space-y-6">
      {/* Dynamic viability advisory notice */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
        isViable 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
          : indicators.van > 0 
            ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
            : 'bg-rose-50/60 border-rose-200 text-rose-900'
      }`}>
        <div className="flex gap-3">
          <div className="mt-0.5">
            {isViable ? (
              <Compass className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {isViable 
                ? '¡Dictamen Financiero: Plan de Negocio Viable!' 
                : indicators.van > 0 
                  ? 'Dictamen Financiero: Rentabilidad Moderada' 
                  : 'Dictamen Financiero: Plan de Negocio No Viable en el Escenario Actual'}
            </h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              {isViable 
                ? 'El proyecto genera riqueza neta hoy (VAN positivo) y ofrece un rendimiento interno superior a la tasa de corte mínima esperada del 12% anual. Es un excelente prospecto.' 
                : indicators.van > 0 
                  ? 'El proyecto tiene un valor presente neto positivo, pero la tasa de rentabilidad interna está rozando el límite de corte del 12%. Revisa gastos administrativos.' 
                  : 'El Valor Actual Neto (VAN) es negativo. El flujo de efectivo proyectado no alcanza a cubrir la inversión inicial requerida y la tasa de descuento exigida. Se recomienda ajustar precios o reducir costos fijos.'}
            </p>
          </div>
        </div>
        <div className="text-xs font-bold whitespace-nowrap bg-white/80 border border-slate-200/50 px-3.5 py-1.5 rounded-lg shadow-2xs text-slate-800">
          Tasa Descuento: 12.0%
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Valor Actual Neto (VAN)"
          value={formatCurrency(indicators.van)}
          description="Riqueza real generada en valor de hoy"
          trend={indicators.van >= 0 ? { type: 'positive', text: 'Rentable' } : { type: 'negative', text: 'No Rentable' }}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          title="Tasa Interna Retorno (TIR)"
          value={formatPercent(indicators.tir)}
          description="Rendimiento anual del dinero invertido"
          trend={indicators.tir >= 0.12 ? { type: 'positive', text: 'Viabilidad Excelente' } : { type: 'neutral', text: 'Moderada' }}
          icon={<Percent className="w-4 h-4" />}
        />
        <MetricCard
          title="Inversión Inicial"
          value={formatCurrency(totalInvestment)}
          description={`Aporte propio: ${formatPercent(totalInvestment > 0 ? ownInvestment / totalInvestment : 0)}`}
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard
          title="Retorno Inversión (ROI)"
          value={`${(indicators.roi * 100).toFixed(0)}%`}
          description={`Recuperación en: ${indicators.paybackPeriod.toFixed(1)} años`}
          trend={indicators.paybackPeriod <= 3 ? { type: 'positive', text: 'Recuperación Rápida' } : { type: 'neutral', text: 'Recuperación Media' }}
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Visual Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Income progression */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Evolución de Estados de Resultados</h4>
              <p className="text-slate-400 text-xs mt-0.5">Progreso proyectado de ventas, EBITDA y utilidad neta</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `C$ ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Ventas" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="EBITDA" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Utilidad Neta" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Free Cash Flow Curve */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Evolución de Flujo de Caja</h4>
              <p className="text-slate-400 text-xs mt-0.5">Curva acumulada de liquidez libre y saldo de caja anual</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCaja" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `C$ ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Caja Acumulada" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCaja)" />
                <Line type="monotone" dataKey="Flujo Anual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
