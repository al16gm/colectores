import { useState, useMemo } from 'react';
import { Calculator, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateCircularManning, interpolateThormannFrankeByQ } from '../lib/hydraulics';
import { ProblemSolution } from '../components/ProblemSolution';
import HydraulicChart from '../components/HydraulicChart';
import { useLanguage } from '../context/LanguageContext';

export default function Problem5() {
  const { t, language } = useLanguage();
  const isEnglish = language === 'en';
  const [data, setData] = useState({
    q_max: 3.86,
    q_punta_negras: 0.185,
    q_min_negras: 0.015,
    dilution_coef: 5,
    n: 0.015,
    j: 0.007
  });

  const solution = useMemo(() => {
    // Q that continues to WWTP after dilution
    const qs = data.dilution_coef * data.q_punta_negras;
    const q_aliviado = data.q_max - qs;
    
    // Dimensioning downstream pipe for Qs
    const d_required = Math.pow(qs * data.n / (0.3117 * Math.sqrt(data.j)), 3/8);
    const d_comercial = [0.4, 0.5, 0.6, 0.8, 1.0, 1.2].find(d => d >= d_required) || 0.8;
    
    // Hydraulic check for Qs (Max design for EDAR pipe) and Qmin (Autolimpieza)
    const full = calculateCircularManning({ n: data.n, j: data.j, d: d_comercial });
    
    const ratioS = qs / (full.qFull || 1);
    const tfS = interpolateThormannFrankeByQ(ratioS);
    const vMax = tfS.vOverVllu * full.vFull;
    const yOverDS = tfS.yOverD;

    const ratioMin = data.q_min_negras / (full.qFull || 1);
    const tfMin = interpolateThormannFrankeByQ(ratioMin);
    const vMin = tfMin.vOverVllu * full.vFull;

    // Lateral weir length L
    const h = 0.25;
    const L = q_aliviado / (0.4 * Math.sqrt(2 * 9.81) * Math.pow(h, 1.5));

    return {
      qs,
      q_aliviado,
      d_required,
      d_comercial,
      L,
      h,
      vMax,
      vMin,
      yOverDS,
      isValid: vMin >= 0.3 && vMax <= 3 && yOverDS <= 0.8
    };
  }, [data]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          {t.common.practicalModule}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.nav.p5}</h1>
        <p className="text-slate-600 mt-2">{isEnglish ? 'Hydraulic calculation of a weir or spillway in a sewer network.' : 'Cálculo hidráulico de un vertedero o aliviadero en una red de saneamiento.'}</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          {t.common.moduleAim}
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          {t.aims.p5}
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{t.common.inputData}: {isEnglish ? 'Inlet Flows' : 'Caudales de Entrada'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Max flow (m³/s)' : 'Q Máximo (m³/s)'}</label>
                <input type="number" step="0.01" value={data.q_max} onChange={e => setData({...data, q_max: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Peak wastewater flow (m³/s)' : 'Q Punta Negras (m³/s)'}</label>
                <input type="number" step="0.001" value={data.q_punta_negras} onChange={e => setData({...data, q_punta_negras: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Dilution Coeff.' : 'Coef. Dilución'}</label>
                <input type="number" value={data.dilution_coef} onChange={e => setData({...data, dilution_coef: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.labels.slopeJ}</label>
                <input type="number" step="0.001" value={data.j} onChange={e => setData({...data, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
             <div className="flex items-center gap-3 text-blue-700 mb-4">
                <Info className="w-5 h-5" />
                <h3 className="font-bold uppercase text-xs tracking-wider">{isEnglish ? 'Dilution Criteria' : 'Criterio de Dilución'}</h3>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {isEnglish 
                  ? `It is established that the flow continuing to the WWTP (Qs) must be ${data.dilution_coef} times the peak wastewater flow, limiting the discharge of pollutants to the receiving medium.`
                  : `Se establece que el caudal que continúa hacia la EDAR (Qs) debe ser ${data.dilution_coef} veces el caudal punta de aguas negras, limitando el vertido de contaminantes al medio receptor.`}
             </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">{t.common.hydraulicChecks}</h3>
            
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase text-white/40 font-bold mb-2">{isEnglish ? 'Outlet Flow (WWTP)' : 'Q Salida (EDAR)'}</p>
                    <p className="text-2xl font-black">{(solution.qs || 0).toFixed(3)} <span className="text-xs font-normal opacity-50">m³/s</span></p>
                  </div>
                  <div className="bg-indigo-500/20 p-4 rounded-2xl border border-indigo-500/30">
                    <p className="text-[10px] uppercase text-indigo-300 font-bold mb-2">{isEnglish ? 'Spillway Flow (Env)' : 'Q Vertido (Medio)'}</p>
                    <p className="text-2xl font-black">{(solution.q_aliviado || 0).toFixed(3)} <span className="text-xs font-normal opacity-50">m³/s</span></p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-xs font-bold text-white/60 uppercase">{isEnglish ? 'Weir Structure' : 'Estructura del Vertedero'}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] uppercase font-bold text-white/30">{isEnglish ? 'Length L' : 'Longitud L'}</p>
                       <p className="text-xl font-bold text-blue-400">{(solution.L || 0).toFixed(2)} m</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] uppercase font-bold text-white/30">{isEnglish ? 'Head h' : 'Carga h'}</p>
                       <p className="text-xl font-bold text-blue-400">{(solution.h || 0).toFixed(2)} m</p>
                    </div>
                  </div>
               </div>
               
               <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-tighter">{isEnglish ? 'Recommended Collection Pipe' : 'Colector Recogida Recomendado'}</p>
                  <p className="text-lg font-black italic">D = {(solution.d_comercial * 1000).toFixed(0)} mm</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <p className="text-white/40">{isEnglish ? 'v_min (Residual)' : 'v_min (Residual)'}</p>
                      <p className={solution.vMin >= 0.3 ? "text-green-400 font-bold" : "text-orange-400 font-bold"}>{(solution.vMin || 0).toFixed(2)} m/s</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <p className="text-white/40">{isEnglish ? 'v_max (Outlet)' : 'v_max (Q_salida)'}</p>
                      <p className={solution.vMax <= 3.0 ? "text-blue-400 font-bold" : "text-orange-400 font-bold"}>{(solution.vMax || 0).toFixed(2)} m/s</p>
                    </div>
                  </div>
               </div>

                <div className="space-y-4 border-t border-white/10 pt-6">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.common.resultsCharts}</p>
                  <HydraulicChart 
                     currentYOverD={solution.yOverDS}
                     currentQOverQllu={solution.qs / (calculateCircularManning({n: data.n, j: data.j, d: data.d_comercial}).qFull || 1)}
                  />
                </div>
            </div>
          </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: isEnglish ? "1. Outlet Flow (Dilution)" : "1. Caudal de Salida (Dilución)",
          description: isEnglish
            ? "We calculate the maximum flow that can continue downstream after dilution by rain."
            : "Calculamos el caudal máximo que puede continuar aguas abajo tras la dilución por lluvia.",
          formula: "Qs = n_dil · Q_punta",
          calcLabel: isEnglish ? "WWTP Load Control" : "Control de Carga EDAR",
          calculation: `${data.dilution_coef || 0} · ${data.q_punta_negras || 0}`,
          result: `${(solution.qs || 0).toFixed(3)} m³/s`
        },
        {
          title: isEnglish ? "2. Spillway Flow (Discharge)" : "2. Caudal de Alivio (Vertido)",
          description: isEnglish
            ? "The difference between total inlet flow and outlet flow must be evacuated by the lateral weir."
            : "La diferencia entre el caudal de llegada total y el de salida es la que debe ser evacuada por el vertedero lateral.",
          formula: "Qv = Q_llegada - Q_salida",
          calcLabel: isEnglish ? "Relief Load" : "Carga de Alivio",
          calculation: `${data.q_max || 0} - ${(solution.qs || 0).toFixed(3)}`,
          result: `${(solution.q_aliviado || 0).toFixed(3)} m³/s`
        },
        {
          title: isEnglish ? "3. Lateral Weir Length" : "3. Longitud del Vertedero Lateral",
          description: isEnglish
            ? "We dimension the length of the weir crest under a design head h."
            : "Dimensionamos la longitud de la cresta del vertedero bajo una carga de diseño h.",
          formula: "L = Qv / (0.4 · sqrt(2g) · h^1.5)",
          calcLabel: isEnglish ? "Hydraulic Geometry" : "Geometría Hidráulica",
          calculation: `${(solution.q_aliviado || 0).toFixed(3)} / (0.4 · 4.43 · ${(solution.h || 0).toFixed(2)}^1.5)`,
          result: `L = ${(solution.L || 0).toFixed(2)} m`
        },
        {
          title: isEnglish ? "4. Outlet Collector Diameter" : "4. Diámetro del Colector de Salida",
          description: isEnglish
            ? "We select the commercial diameter necessary to evacuate the diluted flow at full section."
            : "Seleccionamos el diámetro comercial necesario para evacuar el caudal diluido a sección llena.",
          formula: "D = (Qll · n / (0.312 · J^0.5))^0.375",
          calcLabel: isEnglish ? "Pipe Selection" : "Selección de Tubería",
          calculation: `Calculado for Qs = ${(solution.qs || 0).toFixed(3)} m³/s`,
          result: `D >= ${(solution.d_required * 1000 || 0).toFixed(0)} mm -> ${isEnglish ? 'Selected' : 'Seleccionado'}: ${(solution.d_comercial * 1000).toFixed(0)} mm`
        }
      ]} />
    </div>
  );
}
