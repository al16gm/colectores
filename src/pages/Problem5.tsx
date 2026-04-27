import { useState, useMemo } from 'react';
import { Calculator, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateCircularManning, interpolateThormannFrankeByQ } from '../lib/hydraulics';
import { ProblemSolution } from '../components/ProblemSolution';
import HydraulicChart from '../components/HydraulicChart';

export default function Problem5() {
  const [data, setData] = useState({
    q_max: 3.86,
    q_punta_negras: 0.185,
    q_min_negras: 0.015,
    dilution_coef: 5,
    n: 0.015,
    j: 0.007
  });

  const solution = useMemo(() => {
    // a. Q que recoge la tubería tras la dilución
    const qs = data.dilution_coef * data.q_punta_negras;
    const q_aliviado = data.q_max - qs;
    
    // Dimensioning downstream pipe for Qs
    const d_required = Math.pow(qs * data.n / (0.3117 * Math.sqrt(data.j)), 3/8);
    const d_comercial = [0.4, 0.5, 0.6, 0.8, 1.0, 1.2].find(d => d >= d_required) || 0.8;
    
    // Hydraulic check for Qs (Max design for EDAR pipe) and Qmin (Autolimpieza)
    const full = calculateCircularManning({ n: data.n, j: data.j, d: d_comercial });
    
    const ratioS = qs / (full.qFull || 1);
    const tfS = interpolateThormannFrankeByQ(ratioS);
    const vS = tfS.vOverVllu * full.vFull;
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
      vS,
      vMin,
      yOverDS,
      isValid: vMin >= 0.3 && vS <= 3 && yOverDS <= 0.8
    };
  }, [data]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          Ejercicio 5
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diseño de Aliviadero</h1>
        <p className="text-slate-600 mt-2">Cálculo de dilución, caudal vertido y dimensionamiento de vertedero lateral.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Caudales de Entrada</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Q Máximo (m³/s)</label>
                <input type="number" step="0.01" value={data.q_max} onChange={e => setData({...data, q_max: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Q Punta Negras (m³/s)</label>
                <input type="number" step="0.001" value={data.q_punta_negras} onChange={e => setData({...data, q_punta_negras: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Coef. Dilución</label>
                <input type="number" value={data.dilution_coef} onChange={e => setData({...data, dilution_coef: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Pendiente J</label>
                <input type="number" step="0.001" value={data.j} onChange={e => setData({...data, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
             <div className="flex items-center gap-3 text-blue-700 mb-4">
                <Info className="w-5 h-5" />
                <h3 className="font-bold uppercase text-xs tracking-wider">Criterio de Dilución</h3>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Se establece que el caudal que continúa hacia la EDAR (Q<sub>s</sub>) debe ser {data.dilution_coef} veces el caudal punta de aguas negras, limitando el vertido de contaminantes al medio receptor.
             </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">Dimensionamiento</h3>
            
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase text-white/40 font-bold mb-2">Q Salida (EDAR)</p>
                    <p className="text-2xl font-black">{(solution.qs || 0).toFixed(3)} <span className="text-xs font-normal opacity-50">m³/s</span></p>
                  </div>
                  <div className="bg-indigo-500/20 p-4 rounded-2xl border border-indigo-500/30">
                    <p className="text-[10px] uppercase text-indigo-300 font-bold mb-2">Q Vertido (Medio)</p>
                    <p className="text-2xl font-black">{(solution.q_aliviado || 0).toFixed(3)} <span className="text-xs font-normal opacity-50">m³/s</span></p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-xs font-bold text-white/60 uppercase">Estructura del Vertedero</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] uppercase font-bold text-white/30">Longitud L</p>
                       <p className="text-xl font-bold text-blue-400">{(solution.L || 0).toFixed(2)} m</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] uppercase font-bold text-white/30">Carga h</p>
                       <p className="text-xl font-bold text-blue-400">{(solution.h || 0).toFixed(2)} m</p>
                    </div>
                  </div>
               </div>
               
               <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-tighter">Colector Recogida Recomendado</p>
                  <p className="text-lg font-black italic">D = {(solution.d_comercial * 1000).toFixed(0)} mm</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <p className="text-white/40">v_min (Residual)</p>
                      <p className={solution.vMin >= 0.3 ? "text-green-400 font-bold" : "text-orange-400 font-bold"}>{(solution.vMin || 0).toFixed(2)} m/s</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <p className="text-white/40">v_max (Q_salida)</p>
                      <p className={solution.vS <= 3.0 ? "text-blue-400 font-bold" : "text-orange-400 font-bold"}>{(solution.vS || 0).toFixed(2)} m/s</p>
                    </div>
                  </div>
               </div>

               <HydraulicChart 
                  currentYOverD={solution.yOverDS}
                  currentQOverQllu={solution.qs / (calculateCircularManning({n: data.n, j: data.j, d: solution.d_comercial}).qFull || 1)}
               />
            </div>
          </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: "1. Caudal de Salida (Dilución)",
          description: "Calculamos el caudal máximo que puede continuar aguas abajo tras la dilución por lluvia.",
          formula: "Qs = n_dil · Q_punta",
          calcLabel: "Control de Carga EDAR",
          calculation: `${data.dilution_coef || 0} · ${data.q_punta_negras || 0}`,
          result: `${(solution.qs || 0).toFixed(3)} m³/s`
        },
        {
          title: "2. Caudal de Alivio (Vertido)",
          description: "La diferencia entre el caudal de llegada total y el de salida es la que debe ser evacuada por el vertedero lateral.",
          formula: "Qv = Q_llegada - Q_salida",
          calcLabel: "Carga de Alivio",
          calculation: `${data.q_max || 0} - ${(solution.qs || 0).toFixed(3)}`,
          result: `${(solution.q_aliviado || 0).toFixed(3)} m³/s`
        },
        {
          title: "3. Longitud del Vertedero Lateral",
          description: "Dimensionamos la longitud de la cresta del vertedero bajo una carga de diseño h.",
          formula: "L = Qv / (0.4 · sqrt(2g) · h^1.5)",
          calcLabel: "Geometría Hidráulica",
          calculation: `${(solution.q_aliviado || 0).toFixed(3)} / (0.4 · 4.43 · ${(solution.h || 0).toFixed(2)}^1.5)`,
          result: `L = ${(solution.L || 0).toFixed(2)} m`
        },
        {
          title: "4. Diámetro del Colector de Salida",
          description: "Seleccionamos el diámetro comercial necesario para evacuar el caudal diluido a sección llena.",
          formula: "D = (Qll · n / (0.312 · J^0.5))^0.375",
          calcLabel: "Selección de Tubería",
          calculation: `Calculado para Qs = ${(solution.qs || 0).toFixed(3)} m³/s`,
          result: `D >= ${(solution.d_required * 1000 || 0).toFixed(0)} mm -> Seleccionado: ${(solution.d_comercial * 1000).toFixed(0)} mm`
        }
      ]} />
    </div>

  );
}
