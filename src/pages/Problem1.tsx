import { useState, useMemo } from 'react';
import { Calculator, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { calculateCircularManning, interpolateThormannFrankeByQ } from '../lib/hydraulics';
import HydraulicChart from '../components/HydraulicChart';
import { ProblemSolution } from '../components/ProblemSolution';
import { useLanguage } from '../context/LanguageContext';

export default function Problem1() {
  const { t } = useLanguage();
  const [params, setParams] = useState({
    diameter_mm: 800,
    n: 0.014,
    j_per_mille: 6,
    population: 5000,
    dotation: 200,
    c_retorno: 0.8,
    cp: 2.2,
    q_pluviales_ls: 500
  });

  const solution = useMemo(() => {
    const d = params.diameter_mm / 1000;
    const j = params.j_per_mille / 1000;
    
    const q_med_ls = (params.population * params.dotation * params.c_retorno) / (24 * 3600);
    const q_p_ls = q_med_ls * params.cp;
    const q_min_ls = q_med_ls * 0.45;
    const q_total_ls = q_p_ls + params.q_pluviales_ls;

    const fullInfo = calculateCircularManning({ n: params.n, j, d });
    
    // Scenario 1: Qmin
    const ratioMin = (q_min_ls / 1000) / fullInfo.qFull;
    const tfMin = interpolateThormannFrankeByQ(ratioMin);
    const vMin = tfMin.vOverVllu * fullInfo.vFull;

    // Scenario 2: Qp
    const ratioP = (q_p_ls / 1000) / fullInfo.qFull;
    const tfP = interpolateThormannFrankeByQ(ratioP);
    const vP = tfP.vOverVllu * fullInfo.vFull;

    // Scenario 3: Qtotal
    const ratioTotal = (q_total_ls / 1000) / fullInfo.qFull;
    const tfTotal = interpolateThormannFrankeByQ(ratioTotal);
    const vMax = tfTotal.vOverVllu * fullInfo.vFull;
    const yOverDTotal = tfTotal.yOverD;

    return {
      full: fullInfo,
      q_min_ls,
      q_p_ls,
      q_total_ls,
      vMin,
      vP,
      vMax,
      yOverD: yOverDTotal,
      vOverVllu: vMax / (fullInfo.vFull || 1),
      qRatio: ratioTotal,
      isValid: vMin >= 0.3 && vMax <= 5 && yOverDTotal <= 0.8
    };
  }, [params]);

  return (
    <div className="space-y-8 py-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
          <Calculator className="w-3 h-3" />
          {t.common.practicalModule}
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
          {t.nav.p1}
        </h1>
        <p className="text-sm text-slate-500 font-medium">Aplicación de Manning y relaciones de llenado parcial para una sección circular.</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          {t.common.moduleAim}
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          {t.aims.p1}
        </p>
      </section>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Panel */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              {t.common.inputData}: Geometría y Pendiente
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diámetro Colector</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={params.diameter_mm || ''} 
                    onChange={e => setParams({...params, diameter_mm: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-bold">mm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendiente (j)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={params.j_per_mille || ''} 
                    onChange={e => setParams({...params, j_per_mille: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-[10px] font-bold">‰</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rugosidad (n)</label>
                <input 
                  type="number" 
                  step="0.001"
                  value={params.n || ''} 
                  onChange={e => setParams({...params, n: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              {t.common.inputData}: Población y Dotación
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Población (hab)</label>
                <input type="number" value={params.population} onChange={e => setParams({...params, population: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dotación (l/h/d)</label>
                <input type="number" value={params.dotation} onChange={e => setParams({...params, dotation: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">C. Punta (Cp)</label>
                <input type="number" step="0.1" value={params.cp} onChange={e => setParams({...params, cp: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              {t.common.inputData}: Pluviales
            </h3>
            <div className="space-y-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Q Pluviales (l/s)</label>
                <input type="number" value={params.q_pluviales_ls} onChange={e => setParams({...params, q_pluviales_ls: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm" />
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-center gap-1">
                 <p className="text-[9px] font-black text-blue-900 uppercase">Resumen Caudales</p>
                 <p className="text-xs text-blue-800">Q_min: <b>{(solution.q_min_ls || 0).toFixed(1)} l/s</b></p>
                 <p className="text-xs text-blue-800">Q_punta: <b>{(solution.q_p_ls || 0).toFixed(1)} l/s</b></p>
                 <p className="text-sm font-black text-blue-900 mt-2 pt-2 border-t border-blue-200">Q_TOTAL: {(solution.q_total_ls || 0).toFixed(1)} l/s</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Results Panel */}
        <section className="lg:col-span-12 space-y-6">
          <div className={`p-6 rounded-xl border-t-4 shadow-sm ${solution.isValid ? 'bg-white border-t-green-500' : 'bg-white border-t-orange-500'}`}>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">{t.common.hydraulicChecks}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Autolimpieza</span>
                    <span className={solution.vMin >= 0.3 ? 'text-green-600' : 'text-orange-600'}>{(solution.vMin || 0).toFixed(2)} / 0.30 m/s</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${solution.vMin >= 0.3 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vMin || 0) / 0.6) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Velocidad punta (Residual)</span>
                    <span className={solution.vP >= 0.6 ? 'text-blue-600' : 'text-orange-600'}>{(solution.vP || 0).toFixed(2)} / 0.60 m/s</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${solution.vP >= 0.6 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vP || 0) / 1) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Velocidad máxima (Pluviales)</span>
                    <span className={solution.vMax <= 5.0 ? 'text-blue-600' : 'text-orange-600'}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${solution.vMax <= 5.0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vMax || 0) / 6) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Llenado Máximo</span>
                    <span className={solution.yOverD <= 0.8 ? 'text-blue-600' : 'text-orange-600'}>{(solution.yOverD || 0).toFixed(3)} / 0.80</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${solution.yOverD <= 0.8 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${(solution.yOverD || 0) * 100}%` }}></div>
                  </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${solution.isValid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {solution.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase tracking-tight">
                  {solution.isValid 
                    ? "El caso cumple los criterios hidráulicos considerados en el módulo." 
                    : "Se recomienda revisar los parámetros de diseño."}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.common.resultsCharts}</h3>
            <HydraulicChart 
              currentYOverD={solution.yOverD}
              currentVOverVllu={solution.vOverVllu}
              currentQOverQllu={solution.qRatio}
            />
          </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: "1. Parámetros Geométricos de la Sección",
          description: "Primero calculamos las propiedades de la tubería a sección completa (100% llena). El área (A_ll) y el radio hidráulico (R_ll) dependen únicamente del diámetro.",
          formula: "A_ll = π · D² / 4 | R_ll = D / 4",
          calcLabel: "Cálculo de Área y Radio",
          calculation: `A = π · ${(params.diameter_mm/1000 || 0).toFixed(2)}² / 4 | Rh = ${(params.diameter_mm/1000 || 0).toFixed(2)} / 4`,
          result: `${(solution.full?.areaFull || 0).toFixed(3)} m² | ${(solution.full?.radiusHydraulicFull || 0).toFixed(3)} m`
        },
        {
          title: "2. Velocidad a Sección Llena (Vll)",
          description: "Utilizando la fórmula de Manning, determinamos la velocidad teórica del agua si el colector estuviera totalmente lleno, considerando su rugosidad y pendiente.",
          formula: "v_ll = (1/n) · R_ll^(2/3) · J^(1/2)",
          calcLabel: "Cálculo de Velocidad Llena",
          calculation: `(1/${params.n}) · ${(solution.full?.radiusHydraulicFull || 0).toFixed(3)}^(2/3) · ${(params.j_per_mille/1000 || 0).toFixed(4)}^(1/2)`,
          result: `${(solution.full?.vFull || 0).toFixed(2)} m/s`
        },
        {
          title: "3. Capacidad Máxima (Qll)",
          description: "Multiplicando el área por la velocidad, obtenemos el caudal máximo que puede transportar la sección.",
          formula: "Q_ll = A_ll · v_ll",
          calcLabel: "Cálculo de Caudal Máximo",
          calculation: `${(solution.full?.areaFull || 0).toFixed(3)} · ${(solution.full?.vFull || 0).toFixed(2)}`,
          result: `${(solution.full?.qFull || 0).toFixed(3)} m³/s`
        },
        {
          title: "4. Escenarios de Caudal",
          description: "Calculamos los caudales mínimo, punta residual y total pluvial para verificar el comportamiento en todas las fases de carga.",
          calcLabel: "Caudales Derivados",
          calculation: `Qmin: ${(solution.q_min_ls || 0).toFixed(1)} l/s | Qp: ${(solution.q_p_ls || 0).toFixed(1)} l/s | Qtot: ${(solution.q_total_ls || 0).toFixed(1)} l/s`,
          result: `Q_total: ${(solution.q_total_ls || 0).toFixed(1)} l/s`
        },
        {
          title: "5. Interpolación en Tablas de Thormann-Franke",
          description: "Con las razones Q/Qll para cada escenario, interpolamos en las tablas para hallar la relación de velocidades and calado.",
          calcLabel: "Búsqueda en Tablas",
          calculation: `Lookup(Qtotal/Qll = ${(solution.qRatio || 0).toFixed(3)})`,
          result: `v/vll: ${(solution.vOverVllu || 0).toFixed(3)} | y/D: ${(solution.yOverD || 0).toFixed(3)}`
        },
        {
          title: "6. Resultados y Verificación",
          description: "Se verifican las condiciones de autolimpieza (v_min > 0.3 m/s), velocidad punta (v_p < 3 m/s) y capacidad máxima (y/D < 0.8).",
          formula: "v = (v/v_ll) · v_ll | y = (y/D) · D",
          calcLabel: "Cálculo de Velocidades Real",
          calculation: `v_min = ${(solution.vMin || 0).toFixed(2)} | v_p = ${(solution.vP || 0).toFixed(2)} | v_max = ${(solution.vMax || 0).toFixed(2)}`,
          result: `${(solution.vMax || 0).toFixed(2)} m/s (pico) | ${((solution.yOverD || 0)*params.diameter_mm).toFixed(1)} mm calado`
        }
      ]} />
    </div>

  );
}
