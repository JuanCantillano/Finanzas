import React, { useState } from 'react';
import { ProductProjection } from '../types';
import { Plus, Trash2, HelpCircle, BarChart as ChartIcon, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesTabProps {
  products: ProductProjection[];
  onChange: (products: ProductProjection[]) => void;
}

export function SalesTab({ products, onChange }: SalesTabProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [cogs, setCogs] = useState('');
  const [growth, setGrowth] = useState('15'); // default 15% growth

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !volume || !cogs) return;

    const newProduct: ProductProjection = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      monthlyVolume: parseInt(volume),
      cogs: parseFloat(cogs),
      annualGrowth: parseFloat(growth) / 100,
    };

    onChange([...products, newProduct]);
    setName('');
    setPrice('');
    setVolume('');
    setCogs('');
    setGrowth('15');
  };

  const handleDeleteProduct = (id: string) => {
    onChange(products.filter(p => p.id !== id));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  // Calculate year-by-year projections for chart
  const yearsData = [1, 2, 3, 4, 5].map(year => {
    const dataPoint: any = { name: `Año ${year}` };
    products.forEach(p => {
      const annualVolume = p.monthlyVolume * 12;
      const growthFactor = Math.pow(1 + p.annualGrowth, year - 1);
      const projectedRevenue = annualVolume * growthFactor * p.price;
      dataPoint[p.name] = Math.round(projectedRevenue);
    });
    return dataPoint;
  });

  const chartColors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

  // Summary Metrics
  const totalVolumeYear1 = products.reduce((sum, p) => sum + (p.monthlyVolume * 12), 0);
  const totalRevenueYear1 = products.reduce((sum, p) => sum + (p.monthlyVolume * 12 * p.price), 0);
  const totalCogsYear1 = products.reduce((sum, p) => sum + (p.monthlyVolume * 12 * p.cogs), 0);
  const grossProfitYear1 = totalRevenueYear1 - totalCogsYear1;
  const marginYear1 = totalRevenueYear1 > 0 ? (grossProfitYear1 / totalRevenueYear1) * 100 : 0;
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Unidades Vendidas (Año 1)</p>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{totalVolumeYear1.toLocaleString('es-MX')} u.</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Ventas mensuales promedio de {(totalVolumeYear1 / 12).toFixed(0)} u.</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-indigo-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ingresos Proyectados (Año 1)</p>
          <p className="text-2xl font-black text-indigo-600 mt-1.5">{formatCurrency(totalRevenueYear1)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Bruto antes de costos de venta</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-emerald-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Costo de Venta (COGS Año 1)</p>
          <p className="text-2xl font-black text-amber-600 mt-1.5">{formatCurrency(totalCogsYear1)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Costos directos de producción/servicio</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-amber-500"></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Margen Bruto Promedio</p>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">{marginYear1.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Utilidad Bruta de {formatCurrency(grossProfitYear1)}</p>
          <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Product Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Definir Nuevo Producto, Servicio o Unidad de Negocio
            </h4>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre de Producto / Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Suscripción Premium SaaS, Consultoría Corporativa..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Precio de Venta ($)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="Ej. 49"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Costo Unitario / COGS ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="Ej. 10"
                  value={cogs}
                  onChange={(e) => setCogs(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Volumen Mensual Inicial (u.)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej. 100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tasa de Crecimiento Anual (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={growth}
                    onChange={(e) => setGrowth(e.target.value)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 w-12 text-right bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">{growth}%</span>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg py-3 transition-colors cursor-pointer flex justify-center items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Registrar
                </button>
              </div>
            </form>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">Portafolio de Productos y Servicios</h4>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{products.length} productos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                    <th className="py-3 px-6">Nombre</th>
                    <th className="py-3 px-6 text-right">Precio Unitario</th>
                    <th className="py-3 px-6 text-right">Costo Unitario</th>
                    <th className="py-3 px-6 text-right">Volumen Mensual</th>
                    <th className="py-3 px-6 text-right">Crecimiento Anual</th>
                    <th className="py-3 px-6 text-right">Margen Bruto</th>
                    <th className="py-3 px-6 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {products.map((p) => {
                    const margin = p.price > 0 ? ((p.price - p.cogs) / p.price) * 100 : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/30 group transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800">{formatCurrency(p.price)}</td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-500">{formatCurrency(p.cogs)}</td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-800">{p.monthlyVolume.toLocaleString('es-MX')} u.</td>
                        <td className="py-3.5 px-6 text-right text-indigo-600 font-bold">{(p.annualGrowth * 100).toFixed(0)}%</td>
                        <td className="py-3.5 px-6 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            margin >= 50 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : margin >= 20 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-rose-50 text-rose-700'
                          }`}>
                            {margin.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No hay productos registrados. Use el formulario para añadir nuevos canales de venta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts & Projections */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-indigo-600" />
              Proyección de Ventas (5 Años)
            </h4>
            <div className="h-72">
              {products.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    {products.map((p, index) => (
                      <Bar 
                        key={p.id} 
                        dataKey={p.name} 
                        stackId="a" 
                        fill={chartColors[index % chartColors.length]} 
                        radius={index === products.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                  Añada un producto para visualizar sus proyecciones
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-xs">
            <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-700">Tasa de Crecimiento Compuesto</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                La tasa de crecimiento anual determina la progresión geométrica del volumen. Por ejemplo, un crecimiento del **15%** anual duplica las ventas en aproximadamente 5 años gracias al efecto multiplicador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
