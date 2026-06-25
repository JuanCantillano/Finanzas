/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  defaultProducts, 
  defaultExpenses, 
  defaultInvestments, 
  defaultFinancing, 
  projectFinancials 
} from './utils';
import { 
  ProductProjection, 
  OperatingExpense, 
  InvestmentItem, 
  FinancingConfig, 
  SensitivityConfig 
} from './types';
import { 
  setupAuthListener, 
  loginAnonymously, 
  saveFinancialModel, 
  loadFinancialModels, 
  deleteFinancialModel, 
  SavedModel 
} from './lib/firebase';
import { DashboardTab } from './components/DashboardTab';
import { InvestmentTab } from './components/InvestmentTab';
import { SalesTab } from './components/SalesTab';
import { ExpensesTab } from './components/ExpensesTab';
import { FinancingTab } from './components/FinancingTab';
import { ReportsTab } from './components/ReportsTab';
import { SensitivityTab } from './components/SensitivityTab';
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Landmark, 
  FileSpreadsheet, 
  Sliders,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  Cloud,
  Database,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function App() {
  // Tab states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'investment' | 'sales' | 'expenses' | 'financing' | 'reports' | 'sensitivity'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Financial parameter states
  const [products, setProducts] = useState<ProductProjection[]>(defaultProducts);
  const [expenses, setExpenses] = useState<OperatingExpense[]>(defaultExpenses);
  const [investments, setInvestments] = useState<InvestmentItem[]>(defaultInvestments);
  const [financing, setFinancing] = useState<FinancingConfig>(defaultFinancing);
  const [sensitivity, setSensitivity] = useState<SensitivityConfig>({
    priceFactor: 1.0,
    volumeFactor: 1.0,
    expenseFactor: 1.0,
  });

  const taxRate = 0.25; // 25% corporate tax rate
  const discountRate = 0.12; // 12% discount rate

  // Firebase Integration states
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>('Modelo Local');
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = setupAuthListener(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
        fetchModels();
      } else {
        try {
          const anonUser = await loginAnonymously();
          setUser(anonUser);
          setAuthError(null);
        } catch (error: any) {
          console.error("Autenticación fallida", error);
          let userFriendlyMessage = "Error de conexión con la nube";
          if (error?.code === 'auth/operation-not-allowed') {
            userFriendlyMessage = "El proveedor de inicio de sesión Anónimo está desactivado en la consola de Firebase.";
          } else if (error?.code === 'auth/unauthorized-domain') {
            userFriendlyMessage = "Este dominio (juancantillano.github.io) no está en la lista de Dominios Autorizados en la consola de Firebase.";
          } else if (error?.message) {
            userFriendlyMessage = error.message;
          }
          setAuthError(userFriendlyMessage);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const models = await loadFinancialModels();
      setSavedModels(models);
    } catch (error) {
      console.error("Error cargando modelos de Firebase:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSaveModel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newModelName.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const modelId = activeModelId || 'model_' + Math.random().toString(36).substring(2, 11);
      const saved = await saveFinancialModel({
        id: modelId,
        name: newModelName.trim(),
        products,
        expenses,
        investments,
        financing,
        sensitivity
      });

      setActiveModelId(saved.id);
      setActiveModelName(saved.name);
      setShowSaveModal(false);
      setNewModelName('');
      await fetchModels();
    } catch (error: any) {
      console.error("Error guardando el modelo:", error);
      setSaveError(error?.message || "Error al guardar el escenario en Firebase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadModel = (model: SavedModel) => {
    setProducts(model.products);
    setExpenses(model.expenses);
    setInvestments(model.investments);
    setFinancing(model.financing);
    setSensitivity(model.sensitivity);
    setActiveModelId(model.id);
    setActiveModelName(model.name);
    setShowModelsDropdown(false);
  };

  const handleDeleteModel = async (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Está seguro de que desea eliminar este escenario?")) return;

    try {
      await deleteFinancialModel(modelId);
      if (activeModelId === modelId) {
        setActiveModelId(null);
        setActiveModelName('Modelo Local');
      }
      await fetchModels();
    } catch (error) {
      console.error("Error eliminando el modelo:", error);
    }
  };

  const handleNewModel = () => {
    if (confirm("¿Desea iniciar un nuevo modelo? Se restablecerán todos los valores locales.")) {
      setProducts(defaultProducts);
      setExpenses(defaultExpenses);
      setInvestments(defaultInvestments);
      setFinancing(defaultFinancing);
      setSensitivity({
        priceFactor: 1.0,
        volumeFactor: 1.0,
        expenseFactor: 1.0,
      });
      setActiveModelId(null);
      setActiveModelName('Modelo Local');
    }
  };

  // Calculate Base Case (always 1.0 multiplier factors)
  const baseCase = projectFinancials(
    products, 
    expenses, 
    investments, 
    financing, 
    { priceFactor: 1.0, volumeFactor: 1.0, expenseFactor: 1.0 }, 
    taxRate, 
    discountRate
  );

  // Calculate Simulated/Current Case (respects sensitivity sliders)
  const currentCase = projectFinancials(
    products, 
    expenses, 
    investments, 
    financing, 
    sensitivity, 
    taxRate, 
    discountRate
  );

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Resumen', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'investment', label: 'Inversión Inicial', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'sales', label: 'Proyección de Ventas', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'expenses', label: 'Gastos Operativos', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'financing', label: 'Financiamiento y Deuda', icon: <Landmark className="w-4 h-4" /> },
    { id: 'reports', label: 'Estados Financieros', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'sensitivity', label: 'Análisis de Sensibilidad', icon: <Sliders className="w-4 h-4 animate-pulse text-indigo-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-40 px-5 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight sm:text-base flex items-center gap-1.5">
                EXCEL PRO <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">SIMULATOR</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
                Evaluación Financiera & Dashboard Interactivo
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cloud Connection Status */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 font-semibold text-slate-600">
            {user ? (
              <>
                <Cloud className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-emerald-700 hidden xs:inline">Nube Conectada</span>
                <span className="text-emerald-700 xs:hidden">Conectado</span>
              </>
            ) : authError ? (
              <div className="group relative flex items-center gap-1.5 cursor-help">
                <Cloud className="w-4 h-4 text-rose-500 animate-bounce" />
                <span className="text-rose-600 hidden xs:inline">Error de Nube</span>
                <span className="text-rose-600 xs:hidden">Error</span>
                
                {/* Tooltip on hover */}
                <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-900 text-white rounded-xl shadow-xl text-[11px] font-medium leading-relaxed hidden group-hover:block z-50 transition-all duration-200">
                  <p className="font-bold text-rose-400 mb-1">Error de Firebase:</p>
                  <p className="text-slate-200 mb-2 font-mono text-[10px] bg-slate-950 p-2 rounded border border-slate-800">{authError}</p>
                  <div className="border-t border-slate-800 pt-2 text-slate-300">
                    <p className="font-bold text-indigo-400 mb-1">¿Cómo solucionarlo?</p>
                    <ol className="list-decimal pl-3.5 space-y-1">
                      <li>Ve a tu consola de Firebase</li>
                      <li>Habilita el proveedor <strong>Anónimo</strong> en <em>Authentication → Sign-in method</em></li>
                      <li>Añade <strong>juancantillano.github.io</strong> a la lista de <em>Dominios Autorizados</em> en la pestaña de configuración de <em>Authentication</em></li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                <span>Conectando...</span>
              </>
            )}
          </div>

          {/* Scenario Manager Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModelsDropdown(!showModelsDropdown)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Escenarios</span>
              <span className="bg-slate-700 text-white rounded-full px-1.5 py-0.5 text-[9px] font-extrabold">
                {savedModels.length}
              </span>
            </button>

            {showModelsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                <div className="p-3.5 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mis Escenarios Guardados</span>
                  <button 
                    onClick={handleNewModel}
                    title="Nuevo modelo en blanco"
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {loadingModels ? (
                    <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                      Cargando escenarios...
                    </div>
                  ) : savedModels.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No tienes escenarios guardados. ¡Crea uno nuevo!
                    </div>
                  ) : (
                    savedModels.map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => handleLoadModel(m)}
                        className={`p-3 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer ${
                          activeModelId === m.id ? 'bg-indigo-50/40 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Modificado: {new Date(m.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteModel(m.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Scenario Button */}
          <button
            onClick={() => {
              setNewModelName(activeModelId ? activeModelName : 'Mi Escenario Financiero');
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>

          {/* Active Model Indicator */}
          <div className="hidden md:flex flex-col text-right pl-2 border-l border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {activeModelId ? 'Escenario Cargado' : 'Modelo Activo'}
            </span>
            <span className="text-xs font-extrabold text-slate-800 max-w-32 truncate" title={activeModelName}>
              {activeModelName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 relative">
        {/* Sidebar Navigation Panel */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 pt-20 pb-6 px-4 flex flex-col justify-between transition-transform duration-350 ease-in-out lg:static lg:translate-x-0 lg:pt-6 flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Módulos del Plan</p>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Sidebar Footer Details */}
          <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/25">
            <h5 className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Sugerencia IA
            </h5>
            <p className="text-[10px] text-indigo-200/80 leading-relaxed mt-1">
              Modifica los valores en cada módulo para recalcular automáticamente la viabilidad financiera del proyecto en tiempo real.
            </p>
          </div>
        </aside>

        {/* Overlay background for mobile drawer sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          ></div>
        )}

        {/* Active Content Body */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              years={currentCase.years} 
              indicators={currentCase.indicators}
              totalInvestment={currentCase.totalInvestment}
              ownInvestment={currentCase.ownInvestment}
              debtInvestment={currentCase.debtInvestment}
            />
          )}

          {activeTab === 'investment' && (
            <InvestmentTab 
              investments={investments} 
              onChange={setInvestments}
              debtAmount={financing.debtAmount}
            />
          )}

          {activeTab === 'sales' && (
            <SalesTab 
              products={products} 
              onChange={setProducts}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab 
              expenses={expenses} 
              onChange={setExpenses}
            />
          )}

          {activeTab === 'financing' && (
            <FinancingTab 
              config={financing} 
              onChange={setFinancing}
              totalInvestment={baseCase.totalInvestment}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              years={currentCase.years}
              taxRate={taxRate}
            />
          )}

          {activeTab === 'sensitivity' && (
            <SensitivityTab 
              config={sensitivity}
              onChange={setSensitivity}
              baseIndicators={baseCase.indicators}
              simulatedIndicators={currentCase.indicators}
              baseOwnInvestment={baseCase.ownInvestment}
            />
          )}
        </main>
      </div>

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 animate-pulse" />
                {activeModelId ? 'Actualizar Escenario en la Nube' : 'Guardar Nuevo Escenario'}
              </h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSaveModel} className="space-y-4 mt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre del Escenario
                </label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="ej. Plan de Negocios Expandido"
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  maxLength={100}
                />
              </div>

              {saveError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700 font-medium leading-relaxed">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                    <Cloud className="w-3.5 h-3.5 text-rose-600" />
                    No se pudo guardar en la nube:
                  </p>
                  <p className="font-mono text-[10px] bg-white p-2 rounded border border-rose-150 mb-2">{saveError}</p>
                  <div className="text-slate-600 text-[10px] pt-1.5 border-t border-rose-200">
                    <p className="font-bold text-slate-700">Por favor, verifica en Firebase:</p>
                    <ol className="list-decimal pl-3.5 mt-0.5 space-y-0.5">
                      <li>Habilita el acceso <strong>Anónimo</strong> en Authentication → Sign-in method.</li>
                      <li>Añade <strong>juancantillano.github.io</strong> como Dominio Autorizado.</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed font-medium">
                Se guardará toda la configuración de precios, volumen de ventas, costos fijos, plan de inversiones e indicadores de crédito en la base de datos de Firebase.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{activeModelId ? 'Actualizar' : 'Guardar en la Nube'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
