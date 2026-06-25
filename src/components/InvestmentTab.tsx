import React, { useState } from 'react';
import { InvestmentItem } from '../types';
import { Plus, Trash2, ShieldAlert, PieChart as ChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface InvestmentTabProps {
  investments: InvestmentItem[];
  onChange: (items: InvestmentItem[]) => void;
  debtAmount: number;
}

export function InvestmentTab({ investments, onChange, debtAmount }: InvestmentTabProps) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState<'Activo Fijo' | 'Activo Intangible' | 'Capital de Trabajo'>('Activo Fijo');
  const [source, setSource] = useState<'Propio' | 'Financiado'>('Propio');

  const totalInvestment = investments.reduce((sum, item) => sum + item.cost, 0);
  const ownCapital = Math.max(0, totalInvestment - debtAmount);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || parseFloat(cost) <= 0) return;

    const newItem: InvestmentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      cost: parseFloat(cost),
      source,
    };

    onChange([...investments, newItem]);
    setName('');
    setCost('');
  };

  const handleDeleteItem = (id: string) => {
    onChange(investments.filter(item => item.id !== id));
  };

  // Chart Data preparation
  const categoryData = [
    { name: 'Activo Fijo', value: investments.filter(i => i.category === 'Activo Fijo').reduce((sum, i) => sum + i.cost, 0) },
    { name: 'Activo Intangible', value: investments.filter(i => i.category === 'Activo Intangible').reduce((sum, i) => sum + i.cost, 0) },
    { name: 'Capital de Trabajo', value: investments.filter(i => i.category === 'Capital de Trabajo').reduce((sum, i) => sum + i.cost, 0) },
  ].filter(item => item.value > 0);

  const sourceData = [
    { name: 'Capital Propio', value: ownCapital },
    { name: 'Financiación Bancaria', value: debtAmount },
  ].filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#06b6d4', '#10b981'];
  const SOURCE_COLORS = ['#3b82f6', '#f59e0b'];

  const formatCurrency = (val: number) => {
    const sign = val < 0 ? '-' : '';
    return `${sign}C$ ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.abs(val))}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Inversión Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{formatCurrency(totalInvestment)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Suma total requerida para iniciar</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-full h-full bg-indigo-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Aporte Propio</p>
          <p className="text-2xl font-black text-indigo-600 mt-1.5">{formatCurrency(ownCapital)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {totalInvestment > 0 ? `${((ownCapital / totalInvestment) * 100).toFixed(0)}%` : '0%'} del capital total
          </p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: totalInvestment > 0 ? `${(ownCapital / totalInvestment) * 100}%` : '0%' }}></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Financiación Externa</p>
          <p className="text-2xl font-black text-amber-600 mt-1.5">{formatCurrency(debtAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {totalInvestment > 0 ? `${((debtAmount / totalInvestment) * 100).toFixed(0)}%` : '0%'} préstamo bancario
          </p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: totalInvestment > 0 ? `${(debtAmount / totalInvestment) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Item Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Añadir Activo o Requerimiento de Inversión
            </h4>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre / Concepto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Servidores, Registro de Marca..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monto (C$)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej. 5000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg py-3 transition-colors cursor-pointer flex justify-center items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Activo</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Activo Fijo">Activo Fijo</option>
                  <option value="Activo Intangible">Activo Intangible</option>
                  <option value="Capital de Trabajo">Capital de Trabajo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fuente de Fondos</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Propio">Aporte Propio</option>
                  <option value="Financiado">Financiación</option>
                </select>
              </div>
            </form>
          </div>

          {/* List of Investments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">Desglose de Conceptos de Inversión</h4>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{investments.length} Registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                    <th className="py-3 px-6">Concepto</th>
                    <th className="py-3 px-6">Categoría</th>
                    <th className="py-3 px-6">Fuente</th>
                    <th className="py-3 px-6 text-right">Monto</th>
                    <th className="py-3 px-6 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {investments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 group transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'Activo Fijo' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : item.category === 'Activo Intangible' 
                              ? 'bg-cyan-50 text-cyan-700' 
                              : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                          item.source === 'Propio' ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.source === 'Propio' ? 'bg-blue-600' : 'bg-amber-500'}`}></span>
                          {item.source === 'Propio' ? 'Aporte Propio' : 'Financiado'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {investments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No hay conceptos de inversión registrados. Agregue algunos arriba.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts and Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-indigo-600" />
              Distribución de Inversión
            </h4>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Sin datos para graficar
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-indigo-600" />
              Estructura de Capital
            </h4>
            <div className="h-64">
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Sin datos para graficar
                </div>
              )}
            </div>
          </div>

          {/* Educational box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-700">Inversión y Capital de Trabajo</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                El **Capital de Trabajo** es el fondo necesario para cubrir los primeros meses de costos operativos antes de que las ventas generen suficiente flujo de efectivo positivo. ¡Un plan sólido siempre considera este colchón!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
