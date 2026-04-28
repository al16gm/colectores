import { useState, useMemo } from 'react';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateOvoidFull, interpolateOvoidByQ } from '../lib/hydraulics';
import { OVOID_COMMERCIAL_SECTIONS } from '../lib/constants';
import HydraulicChart from '../components/HydraulicChart';
import { ProblemSolution } from '../components/ProblemSolution';

export default function Problem3() {
  const [params, setParams] = useState({
    population: 302400,
    dotation: 250,
    c_retorno: 0.8,
    cp: 1.4,
    q_pluviales_ls: 1344,
    n: 0.015,
    j: 0.005,
    selected_height_cm: 150
  });

  const solution = useMemo(() => {
    const q_med_ls = (params.population * params.dotation * params.c_retorno) / (24 * 3600);
    const q_p_ls = q_med_ls * params.cp;
    const q_min_ls = q_med_ls * 0.45; 
    const q_max_total_m3 = (q_p_ls + params.q_pluviales_ls) / 1000;
    
    // Ovoid calcs
    const H = params.selected_height_cm / 100;
    const full = calculateOvoidFull(params.n, params.j, H);
    
    // Scenario 1: Qmin (Autolimpieza)
    const qRatioMin = (q_min_ls / 1000) / full.qFull;
    const tfMin = interpolateOvoidByQ(qRatioMin);
    const vMin = tfMin.vOverVllu * full.vFull;

    // Scenario 2: Qp Residual (Dry peak)
    const qRatioP = (q_p_ls / 1000) / full.qFull;
    const tfP = interpolateOvoidByQ(qRatioP);
    const vP = tfP.vOverVllu * full.vFull;

    // Scenario 3: Qtotal (Max rainfall)
    const qRatioTotal = q_max_total_m3 / full.qFull;
    const tfTotal = interpolateOvoidByQ(qRatioTotal);
    const vMax = tfTotal.vOverVllu * full.vFull;
    const yOverHTotal = tfTotal.yOverH;

    return {
      q_med_ls,
      q_p_ls,
      q_min_ls,
      q_max_total_m3,
      full,
      qRatio: qRatioTotal,
      yOverD: yOverHTotal,
      vMin,
      vP,
      vMax,
      isValid: vMin >= 0.3 && vMax <= 5 && yOverHTotal <= 0.8
    };
  }, [params]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          Módulo práctico
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diseño de sección ovoide</h1>
        <p className="text-slate-600 mt-2">Selección y comprobación hidráulica de una sección ovoide para caudales variables.</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          Qué se pretende en este módulo
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          Seleccionar y comprobar una sección ovoide para transportar caudales variables, verificando autolimpieza, velocidad máxima y grado de llenado.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Datos de entrada: Cálculo de Caudales</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Población (hab)</label>
                <input type="number" value={params.population} onChange={e => setParams({...params, population: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Dotación (l/hab·día)</label>
                <input type="number" value={params.dotation} onChange={e => setParams({...params, dotation: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">C. Retorno (0-1)</label>
                <input type="number" step="0.1" value={params.c_retorno} onChange={e => setParams({...params, c_retorno: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">C. Punta (Cp)</label>
                <input type="number" step="0.1" value={params.cp} onChange={e => setParams({...params, cp: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                <p className="text-sm font-medium text-blue-800 flex justify-between">
                    <span>Q Min/Med/Punta:</span>
                    <span className="font-bold">{(solution.q_min_ls || 0).toFixed(1)} / {(solution.q_med_ls || 0).toFixed(1)} / {(solution.q_p_ls || 0).toFixed(1)} l/s</span>
                </p>
                <p className="text-sm font-bold text-blue-900 border-t border-blue-200 pt-2 flex justify-between">
                    <span>Q Diseño Total:</span>
                    <span>{(solution.q_max_total_m3 || 0).toFixed(3)} m³/s</span>
                </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Datos de entrada: Parámetros Hidráulicos</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sección Comercial</label>
                    <select 
                        value={params.selected_height_cm} 
                        onChange={e => setParams({...params, selected_height_cm: Number(e.target.value)})}
                        className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold"
                    >
                        {OVOID_COMMERCIAL_SECTIONS.map(s => (
                            <option key={s.height} value={s.height}>{s.width}x{s.height} cm</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Pendiente j</label>
                    <input type="number" step="0.001" value={params.j} onChange={e => setParams({...params, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
            <div className={`p-6 rounded-2xl border-t-4 shadow-sm ${solution.isValid ? 'bg-white border-t-indigo-500' : 'bg-white border-t-red-500'}`}>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">Verificaciones hidráulicas</h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Autolimpieza</span>
                            <span className={(solution.vMin || 0) >= 0.3 ? 'text-green-600' : 'text-red-600'}>{(solution.vMin || 0).toFixed(2)} / 0.30 m/s</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${(solution.vMin || 0) >= 0.3 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(((solution.vMin || 0) / 0.6) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Velocidad punta</span>
                            <span className={(solution.vP || 0) <= 3.0 ? 'text-indigo-600' : 'text-red-600'}>{(solution.vP || 0).toFixed(2)} / 3.00 m/s</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${(solution.vP || 0) <= 3.0 ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${Math.min(((solution.vP || 0) / 4) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Velocidad Máxima (Qtotal)</span>
                            <span className={(solution.vMax || 0) <= 5.0 ? 'text-blue-600' : 'text-red-600'}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${(solution.vMax || 0) <= 5.0 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.min(((solution.vMax || 0) / 6) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Llenado máximo (Qtotal)</span>
                            <span className={(solution.yOverD || 0) <= 0.8 ? 'text-blue-600' : 'text-red-600'}>{(solution.yOverD || 0).toFixed(3)} / 0.800</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${(solution.yOverD || 0) <= 0.8 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${(solution.yOverD || 0) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Capacidad Llena</p>
                            <p className="text-lg font-black text-slate-700">{(solution.full?.qFull || 0).toFixed(3)} <span className="text-xs font-normal">m³/s</span></p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Carga Actual</p>
                            <p className="text-lg font-black text-slate-700">{(solution.qRatio * 100 || 0).toFixed(1)} <span className="text-xs font-normal">%</span></p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${solution.isValid ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                            {solution.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase tracking-tight">
                            {solution.isValid 
                                ? "El caso cumple los criterios hidráulicos considerados en el módulo." 
                                : "Se recomienda revisar los parámetros de entrada."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest text-slate-400 border-b pb-2">Resultados y gráficas</h3>
                <div className="text-sm text-slate-600 space-y-2">
                    <p className="flex justify-between"><span>Radio Hidráulico (Rh,ll):</span> <span className="font-mono">{(solution.full?.RH || 0).toFixed(3)} m</span></p>
                    <p className="flex justify-between"><span>Área Lleno (S,ll):</span> <span className="font-mono">{(solution.full?.area || 0).toFixed(3)} m²</span></p>
                    <p className="flex justify-between"><span>Velocidad Llena (Vll):</span> <span className="font-mono">{(solution.full?.vFull || 0).toFixed(3)} m/s</span></p>
                </div>
            </div>
            <div className="md:col-span-12">
               <HydraulicChart 
                 type="ovoid"
                 currentYOverD={solution.yOverD}
                 currentVOverVllu={solution.vReal / (solution.full?.vFull || 1)}
                 currentQOverQllu={solution.qRatio}
               />
            </div>

        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: "1. Cálculo de Caudales",
          description: "Determinamos las demandas hidráulicas basándonos en la población servida, dotación de agua y aportación de pluviales.",
          formula: "Q_p = (Pop · Dot · Cret / 86400) · Cp",
          calcLabel: "Cálculo de Caudal de Diseño",
          calculation: `Q_p = (${params.population} · ${params.dotation} · ${params.c_retorno} / 86400) · ${params.cp} + ${params.q_pluviales_ls}/1000`,
          result: `${(solution.q_max_total_m3 || 0).toFixed(3)} m³/s (${(solution.q_p_ls || 0).toFixed(2)} l/s residuales)`
        },
        {
          title: "2. Parámetros de la Sección Ovoide",
          description: `Para un ovoide de altura H=${params.selected_height_cm}cm, calculamos sus propiedades geométricas y capacidad máxima mediante Manning.`,
          formula: "Q_ll = (1/n) · A · Rh^(2/3) · J^(1/2)",
          calcLabel: "Cálculo de Capacidad Máxima",
          calculation: `Q_ll = (1/${params.n}) · ${(solution.full?.area || 0).toFixed(3)} · ${(solution.full?.RH || 0).toFixed(3)}^(2/3) · ${params.j}^(1/2)`,
          result: `${(solution.full?.qFull || 0).toFixed(3)} m³/s | V_ll: ${(solution.full?.vFull || 0).toFixed(2)} m/s`
        },
        {
          title: "3. Obtención de Razones Hidráulicas",
          description: "La razón q = Q/Qll nos permite entrar en las gráficas o tablas de Thormann-Franke específicas para secciones ovoides.",
          formula: "q = Q_total / Q_ll",
          calcLabel: "Interpolación Ovoidal",
          calculation: `q = ${(solution.q_max_total_m3 || 0).toFixed(3)} / ${(solution.full?.qFull || 0).toFixed(3)} = ${(solution.qRatio || 0).toFixed(3)}`,
          result: `y/H = ${(solution.yOverD || 0).toFixed(3)} | v/vll = ${(solution.vReal / (solution.full?.vFull || 1)).toFixed(3)}`
        },
        {
          title: "4. Comprobación de Resultados",
          description: "Calculamos los valores reales de velocidad y calado para verificar el cumplimiento de la normativa vigente: Velocidad entre 0.6 y 5.0 m/s y grado de llenado y/H inferior a 0.8.",
          formula: "v = (v/vll) · vll | y = (y/H) · H",
          calcLabel: "Valores en Régimen Real",
          calculation: `v_min = ${(solution.vMin || 0).toFixed(2)} | v_punta = ${(solution.vP || 0).toFixed(2)} | v_max = ${(solution.vMax || 0).toFixed(2)}`,
          result: `v_max = ${(solution.vMax || 0).toFixed(2)} m/s | y/H = ${(solution.yOverD || 0).toFixed(3)}`
        }
      ]} />
    </div>

  );
}
