import { SensitivityConfig, FinancialIndicators } from '../types';
import { Sliders, HelpCircle, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SensitivityTabProps {
  config: SensitivityConfig;
  onChange: (config: SensitivityConfig) => void;
  baseIndicators: FinancialIndicators;
  simulatedIndicators: FinancialIndicators;
  baseOwnInvestment: number;
}

export function SensitivityTab({
  config,
  onChange,
  baseIndicators,
  simulatedIndicators,
  baseOwnInvestment,
}: SensitivityTabProps) {

  const formatPercent = (val: number) => {
    if (isNaN(val)) return 'N/A';
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  const handleReset = () => {
    onChange({ priceFactor: 1.0, volumeFactor: 1.0, expenseFactor: 1.0 });
  };

  // Indicators performance checks
  const getIndicatorStatus = (val: number, isTir: boolean = false) => {
    if (isTir) {
      if (isNaN(val)) return { text: 'No Viable', bg: 'bg-rose-100 text-rose-800', icon: <ShieldAlert className="w-4 h-4" /> };
      return val >= 0.12 
        ? { text: 'Viabilidad Excelente', bg: 'bg-emerald-100 text-emerald-800', icon: <ShieldCheck className="w-4 h-4" /> }
        : val >= 0 
          ? { text: 'Viabilidad Moderada', bg: 'bg-amber-100 text-amber-800', icon: <ShieldAlert className="w-4 h-4" /> }
          : { text: 'No Viable', bg: 'bg-rose-100 text-rose-800', icon: <ShieldAlert className="w-4 h-4" /> };
    } else {
      return val >= 0 
        ? { text: 'Rentable (VAN > 0)', bg: 'bg-emerald-100 text-emerald-800', icon: <ShieldCheck className="w-4 h-4" /> }
        : { text: 'No Rentable (VAN < 0)', bg: 'bg-rose-100 text-rose-800', icon: <ShieldAlert className="w-4 h-4" /> };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Configuration Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Simulador de Escenarios
            </h4>
            <button 
              onClick={handleReset}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-850 cursor-pointer transition-colors"
            >
              Restablecer Base
            </button>
          </div>

          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Ajusta los multiplicadores para simular variaciones del mercado (ej. inflación, recesión, subidas de precios) y observa el impacto financiero de inmediato.
          </p>

          <div className="space-y-6">
            {/* Price factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wide">Multiplicador de Precios</span>
                <span className={`font-extrabold text-xs ${config.priceFactor >= 1.0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {config.priceFactor >= 1.0 ? '+' : ''}{((config.priceFactor - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.30"
                step="0.05"
                value={config.priceFactor}
                onChange={(e) => onChange({ ...config, priceFactor: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>-30%</span>
                <span>Normal</span>
                <span>+30%</span>
              </div>
            </div>

            {/* Volume factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wide">Multiplicador de Demanda/Volumen</span>
                <span className={`font-extrabold text-xs ${config.volumeFactor >= 1.0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {config.volumeFactor >= 1.0 ? '+' : ''}{((config.volumeFactor - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.30"
                step="0.05"
                value={config.volumeFactor}
                onChange={(e) => onChange({ ...config, volumeFactor: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>-30%</span>
                <span>Normal</span>
                <span>+30%</span>
              </div>
            </div>

            {/* Expenses factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wide">Multiplicador de Costos Fijos</span>
                <span className={`font-extrabold text-xs ${config.expenseFactor <= 1.0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {config.expenseFactor >= 1.0 ? '+' : ''}{((config.expenseFactor - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.20"
                step="0.05"
                value={config.expenseFactor}
                onChange={(e) => onChange({ ...config, expenseFactor: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>-20% (Eficiencia)</span>
                <span>Normal</span>
                <span>+20% (Costos altos)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Impact Display Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-5">Impacto en Viabilidad del Plan de Negocio</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NPV CARD */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Actual Neto (VAN)</h5>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getIndicatorStatus(simulatedIndicators.van).bg}`}>
                    {getIndicatorStatus(simulatedIndicators.van).icon}
                    {getIndicatorStatus(simulatedIndicators.van).text}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Escenario Base</span>
                    <span className="text-sm font-bold text-slate-400 line-through">{formatCurrency(baseIndicators.van)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div>
                    <span className="block text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Simulado</span>
                    <span className={`text-xl font-black ${simulatedIndicators.van >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(simulatedIndicators.van)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  El VAN mide la riqueza neta generada por el proyecto hoy. Si el VAN es **mayor a cero**, el proyecto rinde por encima de la tasa de descuento exigida ({formatPercent(0.12)}).
                </p>
              </div>

              {/* IRR CARD */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa Interna de Retorno (TIR)</h5>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getIndicatorStatus(simulatedIndicators.tir, true).bg}`}>
                    {getIndicatorStatus(simulatedIndicators.tir, true).icon}
                    {getIndicatorStatus(simulatedIndicators.tir, true).text}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Escenario Base</span>
                    <span className="text-sm font-bold text-slate-400 line-through">{formatPercent(baseIndicators.tir)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div>
                    <span className="block text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Simulado</span>
                    <span className={`text-xl font-black ${simulatedIndicators.tir >= 0.12 ? 'text-emerald-600' : simulatedIndicators.tir >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {formatPercent(simulatedIndicators.tir)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  La TIR es la tasa intrínseca de rendimiento anual del dinero invertido. Debe superar el costo de oportunidad o tasa de corte mínima para justificar la inversión ({formatPercent(0.12)}).
                </p>
              </div>

              {/* BREAKEVEN POINT */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 md:col-span-2 shadow-xs">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punto de Equilibrio Requerido (Ventas Año 1)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Monto de Equilibrio</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-400 line-through">{formatCurrency(baseIndicators.breakEvenRevenue)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-base font-black text-slate-800">{formatCurrency(simulatedIndicators.breakEvenRevenue)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Equivalente en Unidades</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-400 line-through">{baseIndicators.breakEvenUnits.toFixed(0)} u.</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-base font-black text-slate-800">{simulatedIndicators.breakEvenUnits.toFixed(0)} u.</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  El Punto de Equilibrio es el nivel de ventas donde los ingresos igualan exactamente a la suma de costos variables y fijos. Por debajo de este umbral el negocio incurre en pérdidas; por encima, genera utilidades netas.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-xs">
            <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-700">¿Cómo reacciona el VAN y la TIR a las variaciones?</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                Típicamente, el **precio** es la variable de mayor sensibilidad en un negocio. Pequeñas fluctuaciones de precio impactan el margen bruto directo de manera inmediata. Los costos de OPEX fijos, en cambio, tienen un impacto lineal predecible sobre el Punto de Equilibrio sin alterar la rentabilidad marginal unitaria de las ventas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
