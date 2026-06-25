import { useState } from 'react';
import { FinancialYear } from '../types';
import { FileText, Download, TrendingUp } from 'lucide-react';

interface ReportsTabProps {
  years: FinancialYear[];
  taxRate: number;
}

export function ReportsTab({ years, taxRate }: ReportsTabProps) {
  const [reportType, setReportType] = useState<'pAndL' | 'cashFlow'>('pAndL');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    // Basic CSV generator
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'pAndL') {
      csvContent += "Concepto,Año 1,Año 2,Año 3,Año 4,Año 5\r\n";
      csvContent += `Ingresos por Ventas,${years.map(y => Math.round(y.revenue)).join(',')}\r\n`;
      csvContent += `Costo de Ventas (COGS),${years.map(y => Math.round(y.cogs)).join(',')}\r\n`;
      csvContent += `Utilidad Bruta,${years.map(y => Math.round(y.grossProfit)).join(',')}\r\n`;
      csvContent += `Gastos Operativos (OPEX),${years.map(y => Math.round(y.opex)).join(',')}\r\n`;
      csvContent += `EBITDA,${years.map(y => Math.round(y.ebitda)).join(',')}\r\n`;
      csvContent += `Depreciación,${years.map(y => Math.round(y.depreciation)).join(',')}\r\n`;
      csvContent += `EBIT (Utilidad Operativa),${years.map(y => Math.round(y.ebit)).join(',')}\r\n`;
      csvContent += `Intereses de Deuda,${years.map(y => Math.round(y.interest)).join(',')}\r\n`;
      csvContent += `Impuestos (${taxRate * 100}%),${years.map(y => Math.round(y.taxes)).join(',')}\r\n`;
      csvContent += `Utilidad Neta,${years.map(y => Math.round(y.netIncome)).join(',')}\r\n`;
    } else {
      csvContent += "Concepto,Año 1,Año 2,Año 3,Año 4,Año 5\r\n";
      csvContent += `Utilidad Neta,${years.map(y => Math.round(y.netIncome)).join(',')}\r\n`;
      csvContent += `(+) Depreciación,${years.map(y => Math.round(y.depreciation)).join(',')}\r\n`;
      csvContent += `(-) Pago de Principal de Crédito,${years.map(y => Math.round(y.cashFlow - y.netIncome - y.depreciation)).join(',')}\r\n`; // Backwards derive principal
      csvContent += `Flujo de Caja del Período,${years.map(y => Math.round(y.cashFlow)).join(',')}\r\n`;
      csvContent += `Flujo de Caja Acumulado,${years.map(y => Math.round(y.cumulativeCashFlow)).join(',')}\r\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Plan_Financiero_${reportType === 'pAndL' ? 'Estado_Resultados' : 'Flujo_Caja'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Switches */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setReportType('pAndL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              reportType === 'pAndL' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Estado de Resultados (P&L)
          </button>
          <button
            onClick={() => setReportType('cashFlow')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              reportType === 'cashFlow' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Flujo de Caja Libre
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Exportar a Excel (CSV)
        </button>
      </div>

      {/* Reports Table rendering */}
      {reportType === 'pAndL' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800">Estado de Resultados Proyectado (5 Años)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                  <th className="py-3.5 px-6">Línea de Reporte</th>
                  {years.map(y => (
                    <th key={y.year} className="py-3.5 px-6 text-right font-bold text-slate-700">Año {y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700">
                {/* Income */}
                <tr className="hover:bg-indigo-50/10 transition-colors">
                  <td className="py-3.5 px-6 font-bold font-sans text-slate-800">Ingresos Operativos (Ventas)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right font-bold text-slate-900">{formatCurrency(y.revenue)}</td>
                  ))}
                </tr>
                {/* COGS */}
                <tr className="hover:bg-slate-50/40 text-slate-500 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Costo de Ventas (COGS)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.cogs)}</td>
                  ))}
                </tr>
                {/* Gross Profit */}
                <tr className="bg-emerald-50/40 text-emerald-800 font-bold border-y border-emerald-100">
                  <td className="py-3.5 px-6 font-sans">(=) Utilidad Bruta</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.grossProfit)}</td>
                  ))}
                </tr>
                {/* Operating Expenses */}
                <tr className="hover:bg-slate-50/40 text-slate-500 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Gastos Operativos (OPEX)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.opex)}</td>
                  ))}
                </tr>
                {/* EBITDA */}
                <tr className="bg-slate-50/70 text-slate-800 font-bold border-y border-slate-200">
                  <td className="py-3.5 px-6 font-sans">(=) EBITDA</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.ebitda)}</td>
                  ))}
                </tr>
                {/* Depreciation */}
                <tr className="hover:bg-slate-50/40 text-slate-400 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Depreciación de Activos</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.depreciation)}</td>
                  ))}
                </tr>
                {/* EBIT */}
                <tr className="hover:bg-indigo-50/20 font-bold text-indigo-950 border-y border-indigo-100/30">
                  <td className="py-3.5 px-6 font-sans text-indigo-900">(=) EBIT (Utilidad de Operación)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right text-indigo-600">{formatCurrency(y.ebit)}</td>
                  ))}
                </tr>
                {/* Interest Expense */}
                <tr className="hover:bg-slate-50/40 text-rose-500 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Gastos Financieros (Intereses)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.interest)}</td>
                  ))}
                </tr>
                {/* EBT */}
                <tr className="hover:bg-slate-50/30 text-slate-800 font-medium transition-colors">
                  <td className="py-3.5 px-6 font-semibold font-sans">(=) Utilidad antes de Impuestos (EBT)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.ebit - y.interest)}</td>
                  ))}
                </tr>
                {/* Taxes */}
                <tr className="hover:bg-slate-50/40 text-slate-400 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Impuestos Corporativos ({(taxRate * 100).toFixed(0)}%)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.taxes)}</td>
                  ))}
                </tr>
                {/* Net Income */}
                <tr className="bg-slate-900 text-white font-extrabold text-sm border-t border-slate-950">
                  <td className="py-4.5 px-6 font-sans">(=) Utilidad Neta</td>
                  {years.map(y => (
                    <td key={y.year} className="py-4.5 px-6 text-right font-extrabold text-emerald-400">{formatCurrency(y.netIncome)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Estado de Flujo de Caja Libre Proyectado (5 Años)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150">
                  <th className="py-3.5 px-6">Concepto de Caja</th>
                  {years.map(y => (
                    <th key={y.year} className="py-3.5 px-6 text-right font-bold text-slate-700">Año {y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700">
                {/* Net Income */}
                <tr className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-6 font-sans">Utilidad Neta</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">{formatCurrency(y.netIncome)}</td>
                  ))}
                </tr>
                {/* Plus Depreciation */}
                <tr className="hover:bg-slate-50/40 text-emerald-600 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(+) Ajuste Depreciación (No salida de caja)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right">+{formatCurrency(y.depreciation)}</td>
                  ))}
                </tr>
                {/* Minus Debt Repayment */}
                <tr className="hover:bg-slate-50/40 text-rose-500 transition-colors">
                  <td className="py-3.5 px-6 font-sans">(-) Amortización de Principal (Préstamo)</td>
                  {years.map(y => {
                    // Derive principal: debt repayment = CF - NetIncome - Dep
                    const principal = y.cashFlow - y.netIncome - y.depreciation;
                    return (
                      <td key={y.year} className="py-3.5 px-6 text-right">
                        {principal < 0 ? formatCurrency(Math.abs(principal)) : `-$0`}
                      </td>
                    );
                  })}
                </tr>
                {/* Period Cash Flow */}
                <tr className="bg-emerald-50/40 text-emerald-950 font-extrabold border-y border-emerald-100/80">
                  <td className="py-3.5 px-6 font-sans text-emerald-900">(=) Flujo de Caja Neto del Año</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right text-emerald-700 font-bold">{formatCurrency(y.cashFlow)}</td>
                  ))}
                </tr>
                {/* Cumulative Cash Flow */}
                <tr className="hover:bg-slate-50/20 text-slate-700 transition-colors">
                  <td className="py-3.5 px-6 font-bold font-sans">(=) Flujo de Caja Acumulado</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right font-bold text-slate-900">{formatCurrency(y.cumulativeCashFlow)}</td>
                  ))}
                </tr>
                {/* Discounted Cash Flow */}
                <tr className="text-slate-400 text-xs transition-colors">
                  <td className="py-3.5 px-6 font-sans italic">Flujo Descontado (para cálculo VAN)</td>
                  {years.map(y => (
                    <td key={y.year} className="py-3.5 px-6 text-right italic">{formatCurrency(y.discountedCashFlow)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
