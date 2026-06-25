import React, { useState } from 'react';
import { OperatingExpense } from '../types';
import { Plus, Trash2, ShieldAlert, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpensesTabProps {
  expenses: OperatingExpense[];
  onChange: (expenses: OperatingExpense[]) => void;
}

export function ExpensesTab({ expenses, onChange }: ExpensesTabProps) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState<'Administración' | 'Ventas' | 'Marketing' | 'Otros'>('Administración');
  const [increase, setIncrease] = useState('3'); // default 3% annual inflation increase

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || parseFloat(cost) <= 0) return;

    const newExpense: OperatingExpense = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      monthlyCost: parseFloat(cost),
      annualIncrease: parseFloat(increase) / 100,
    };

    onChange([...expenses, newExpense]);
    setName('');
    setCost('');
    setIncrease('3');
  };

  const handleDeleteExpense = (id: string) => {
    onChange(expenses.filter(e => e.id !== id));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  // Aggregated Category Data for Chart
  const categories = ['Administración', 'Ventas', 'Marketing', 'Otros'];
  const categoryColors = {
    Administración: '#6366f1',
    Ventas: '#3b82f6',
    Marketing: '#ec4899',
    Otros: '#10b981',
  };

  const chartData = categories.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.monthlyCost * 12, 0),
  })).filter(item => item.value > 0);

  const totalMonthlyOpex = expenses.reduce((sum, e) => sum + e.monthlyCost, 0);
  const totalAnnualOpex = totalMonthlyOpex * 12;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gastos Mensuales (Año 1)</p>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{formatCurrency(totalMonthlyOpex)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Costos fijos recurrentes mensuales</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-indigo-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gastos Anuales (Año 1)</p>
          <p className="text-2xl font-black text-indigo-600 mt-1.5">{formatCurrency(totalAnnualOpex)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Sueldos, alquileres, marketing, etc.</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-emerald-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Categoría Más Costosa</p>
          <p className="text-2xl font-black text-rose-600 mt-1.5">
            {chartData.length > 0 
              ? chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name
              : 'N/A'}
          </p>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">Requiere monitoreo continuo de eficiencia</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-rose-500"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Expense Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Añadir Costo o Gasto de Operación
            </h4>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre / Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Alquiler de Oficinas, Google Ads, Sueldo Líder..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Costo Mensual ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej. 1200"
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Administración">Administración</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ajuste de Inflación Anual (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={increase}
                    onChange={(e) => setIncrease(e.target.value)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 w-12 text-right bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">{increase}%</span>
                </div>
              </div>
            </form>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">Listado de Gastos Recurrentes</h4>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{expenses.length} conceptos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                    <th className="py-3 px-6">Nombre / Concepto</th>
                    <th className="py-3 px-6">Categoría</th>
                    <th className="py-3 px-6 text-right">Mensual</th>
                    <th className="py-3 px-6 text-right">Anualizado (Y1)</th>
                    <th className="py-3 px-6 text-right">Ajuste de Inflación</th>
                    <th className="py-3 px-6 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/30 group transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{e.name}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          e.category === 'Administración' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : e.category === 'Ventas' 
                              ? 'bg-blue-50 text-blue-700' 
                              : e.category === 'Marketing' 
                                ? 'bg-pink-50 text-pink-700' 
                                : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(e.monthlyCost)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-500">
                        {formatCurrency(e.monthlyCost * 12)}
                      </td>
                      <td className="py-3.5 px-6 text-right text-indigo-600 font-bold">
                        {(e.annualIncrease * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No hay gastos de operación registrados. Agregue algunos arriba.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts & Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Gastos por Categoría (Y1)
            </h4>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={categoryColors[entry.name as keyof typeof categoryColors] || '#64748b'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                  Sin datos de gastos para graficar
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-700">Gastos de Operación vs. Costos Directos</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                Los **Gastos de Operación (OPEX)** son independientes de las ventas (por ejemplo, alquiler, salarios administrativos). Los **Costos Directos (COGS)** varían en proporción directa al volumen de ventas. ¡Optimizar costos fijos reduce considerablemente el punto de equilibrio de tu negocio!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
