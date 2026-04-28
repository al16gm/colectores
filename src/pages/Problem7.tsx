import { useState, useMemo } from 'react';
import { Calculator, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProblemSolution } from '../components/ProblemSolution';
import { interpolateThormannFrankeByQ, calculateCircularManning } from '../lib/hydraulics';
import HydraulicChart from '../components/HydraulicChart';

export default function Problem7() {
  const [zoneA, setZoneA] = useState({
      width: 300,
      length: 1500,
      density: 150,
      ca: 0.3
  });

  const [zoneB, setZoneB] = useState({
      width: 300,
      length: 2500,
      density: 300,
      ca: 0.8
  });

  const [common, setCommon] = useState({
      dotation: 200,
      cp: 2.2,
      c_retorno: 0.85,
      intensity: 75, // l/s/Ha
      diameter_mm: 1500,
      n: 0.014,
      j: 0.004
  });

  const solution = useMemo(() => {
    // Superficicies
    const sa_ha = (zoneA.width * zoneA.length) / 10000;
    const sb_ha = (zoneB.width * zoneB.length) / 10000;

    // Poblaciones
    const pa = sa_ha * zoneA.density;
    const pb = sb_ha * zoneB.density;

    // Caudales Medios
    const qa_med = (pa * common.dotation * common.c_retorno) / (24 * 3600);
    const qb_med = (pb * common.dotation * common.c_retorno) / (24 * 3600);
    const q_med_total = qa_med + qb_med;

    // Caudales Punta
    const qa_p = qa_med * common.cp;
    const qb_p = qb_med * common.cp;
    const q_p_total = qa_p + qb_p;

    // Caudales Min
    const q_min_total = q_med_total * 0.45;

    // Pluviales
    const qpl_a = 1 * zoneA.ca * common.intensity * sa_ha;
    const qpl_b = 1 * zoneB.ca * common.intensity * sb_ha;
    const qpl_total = qpl_a + qpl_b;

    // Totales en punto C (Total A + Total B)
    const q_total_seco = q_p_total / 1000;
    const q_total_lluvia = q_total_seco + qpl_total / 1000;

    // Hydraulic checks
    const d = common.diameter_mm / 1000;
    const full = calculateCircularManning({ n: common.n, j: common.j, d });

    // Scenario 1: Qmin
    const ratioMin = (q_min_total / 1000) / (full.qFull || 1);
    const tfMin = interpolateThormannFrankeByQ(ratioMin);
    const vMin = tfMin.vOverVllu * full.vFull;

    // Scenario 2: Qp Residual
    const ratioP = q_total_seco / (full.qFull || 1);
    const tfP = interpolateThormannFrankeByQ(ratioP);
    const vP = tfP.vOverVllu * full.vFull;

    // Scenario 3: Qtotal
    const ratioTotal = q_total_lluvia / (full.qFull || 1);
    const tfTotal = interpolateThormannFrankeByQ(ratioTotal);
    const vMax = tfTotal.vOverVllu * full.vFull;
    const yOverDTotal = tfTotal.yOverD;

    return {
        sa_ha, sb_ha,
        pa, pb,
        qa_p, qb_p,
        qpl_a, qpl_b,
        q_total_seco,
        q_total_lluvia,
        vMin,
        vP,
        vMax,
        yOverDTotal,
        isValid: vMin >= 0.3 && vMax <= 5 && yOverDTotal <= 0.8
    };
  }, [zoneA, zoneB, common]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          Módulo práctico
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dimensionamiento zonal de red de saneamiento</h1>
        <p className="text-slate-600 mt-2">Agregación de aportaciones por zonas urbanas y verificación del colector resultante.</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          Qué se pretende en este módulo
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          Agregar aportaciones por zonas o subcuencas urbanas y verificar el comportamiento hidráulico del colector resultante.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Datos de entrada: Zona A
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Longitud (m)</label>
                    <input type="number" value={zoneA.length} onChange={e => setZoneA({...zoneA, length: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ancho (m)</label>
                    <input type="number" value={zoneA.width} onChange={e => setZoneA({...zoneA, width: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Densidad (hab/Ha)</label>
                    <input type="number" value={zoneA.density} onChange={e => setZoneA({...zoneA, density: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">C. Escorrentía (Ca)</label>
                    <input type="number" step="0.1" value={zoneA.ca} onChange={e => setZoneA({...zoneA, ca: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Datos de entrada: Zona B
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Longitud (m)</label>
                    <input type="number" value={zoneB.length} onChange={e => setZoneB({...zoneB, length: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ancho (m)</label>
                    <input type="number" value={zoneB.width} onChange={e => setZoneB({...zoneB, width: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Densidad (hab/Ha)</label>
                    <input type="number" value={zoneB.density} onChange={e => setZoneB({...zoneB, density: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">C. Escorrentía (Ca)</label>
                    <input type="number" step="0.1" value={zoneB.ca} onChange={e => setZoneB({...zoneB, ca: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-slate-500" />
                 Datos de entrada: Colector Final
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Diámetro (mm)</label>
                     <input type="number" value={common.diameter_mm} onChange={e => setCommon({...common, diameter_mm: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Pendiente (j)</label>
                     <input type="number" step="0.001" value={common.j} onChange={e => setCommon({...common, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                 Datos de entrada: Parámetros Globales
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Dotación (l/h/d)</label>
                     <input type="number" value={common.dotation} onChange={e => setCommon({...common, dotation: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">C. Punta (Cp)</label>
                     <input type="number" step="0.1" value={common.cp} onChange={e => setCommon({...common, cp: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">C. Retorno</label>
                     <input type="number" step="0.1" value={common.c_retorno} onChange={e => setCommon({...common, c_retorno: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Intensidad Pluvial</label>
                     <input type="number" value={common.intensity} onChange={e => setCommon({...common, intensity: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
               </div>
            </div>
        </section>

        <section className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-4">Resultados y gráficas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter tracking-widest">Resumen Zona A (Alta)</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex justify-between">Habitantes: <span className="font-bold text-slate-900">{(solution.pa || 0).toFixed(0)}</span></p>
                        <p className="text-xs text-slate-600 flex justify-between">Área: <span className="font-bold text-slate-900">{(solution.sa_ha || 0).toFixed(1)} Ha</span></p>
                        <p className="text-[11px] text-blue-600 font-black mt-2 pt-2 border-t border-blue-100">{(solution.qa_p || 0).toFixed(2)} l/s punta</p>
                      </div>
                   </div>
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter tracking-widest">Resumen Zona B (Media)</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex justify-between">Habitantes: <span className="font-bold text-slate-900">{(solution.pb || 0).toFixed(0)}</span></p>
                        <p className="text-xs text-slate-600 flex justify-between">Área: <span className="font-bold text-slate-900">{(solution.sb_ha || 0).toFixed(1)} Ha</span></p>
                        <p className="text-[11px] text-indigo-600 font-black mt-2 pt-2 border-t border-indigo-100">{(solution.qb_p || 0).toFixed(2)} l/s punta</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex justify-between items-center shadow-lg shadow-blue-200">
                        <div>
                             <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Total Tiempo Seco (Residual)</p>
                             <div className="flex items-baseline gap-2">
                               <p className="text-4xl font-black">{(solution.q_total_seco || 0).toFixed(3)}</p>
                               <span className="text-lg opacity-50">m³/s</span>
                             </div>
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl flex justify-between items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="relative z-10">
                             <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Capacidad Hidráulica de Diseño</p>
                             <div className="flex items-baseline gap-2">
                               <p className="text-4xl font-black">{(solution.q_total_lluvia || 0).toFixed(3)}</p>
                               <span className="text-lg opacity-50 text-indigo-300">m³/s</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border-t-4 shadow-sm bg-slate-50 ${solution.isValid ? 'border-t-green-500' : 'border-t-orange-500'}`}>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verificaciones hidráulicas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">v_min (Residual)</p>
                      <p className={`text-sm font-black ${solution.vMin >= 0.3 ? 'text-green-600' : 'text-orange-600'}`}>{(solution.vMin || 0).toFixed(2)} / 0.30 m/s</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">v_max (Pluvial)</p>
                      <p className={`text-sm font-black ${solution.vMax <= 5.0 ? 'text-blue-600' : 'text-orange-600'}`}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 col-span-2">
                       <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 text-center">Llenado (y/D)</p>
                       <p className={`text-xl font-black text-center ${solution.yOverDTotal <= 0.8 ? 'text-blue-600' : 'text-slate-900'}`}>{(solution.yOverDTotal || 0).toFixed(3)}</p>
                    </div>
                  </div>
               </div>

               <HydraulicChart 
                  currentYOverD={solution.yOverDTotal}
                  currentQOverQllu={solution.q_total_lluvia / (calculateCircularManning({n: common.n, j: common.j, d: common.diameter_mm/1000}).qFull || 1)}
               />
           </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Esquema de Convergencia</h4>
                <div className="flex items-center gap-4 relative">
                   <div className="flex flex-col gap-12">
                      <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white shadow-sm font-black text-blue-600 text-xs">Z-A</div>
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-500 flex items-center justify-center bg-white shadow-sm font-black text-indigo-600 text-xs">Z-B</div>
                   </div>
                   <div className="flex flex-col gap-12 h-24 justify-center">
                      <div className="w-12 h-1 border-t-2 border-slate-200 border-dashed transform rotate-45"></div>
                      <div className="w-12 h-1 border-t-2 border-slate-200 border-dashed transform -rotate-45"></div>
                   </div>
                   <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center shadow-xl z-10">
                      <span className="text-white font-black text-xl">C</span>
                   </div>
                   <div className="w-20 h-3 bg-gradient-to-r from-slate-900 to-transparent rounded-full shadow-inner"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-8 italic text-center px-8">
                    El colector final aguas abajo de <b>Punto C</b> debe dimensionarse para <b>{solution.q_total_lluvia.toFixed(3)} m³/s</b>.
                </p>
           </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: "1. Cuantificación de Superficies y Población",
          description: "Calculamos la superficie bruta de cada zona de vertido y su población asociada mediante la densidad habitacional definida para cada sector.",
          calcLabel: "Balance Zonal",
          calculation: `Z-A: ${zoneA.width}x${zoneA.length} / 10k = ${(solution.sa_ha || 0).toFixed(1)} Ha | Z-B: ${zoneB.width}x${zoneB.length} / 10k = ${(solution.sb_ha || 0).toFixed(1)} Ha`,
          result: `Pob. Total: ${(solution.pa + solution.pb).toFixed(0)} habitantes`
        },
        {
          title: "2. Producción de Aguas Negras (Tiempo Seco)",
          description: "Determinamos el caudal punta total esperado en el punto de encuentro considerando las aportaciones de dotación y retorno punta de ambos sectores.",
          formula: "Q_p = (Pop_tot · Dot · Cret / 86400) · C_p",
          calcLabel: "Demanda Residual Agregada",
          calculation: `(${(solution.pa || 0).toFixed(0)} + ${(solution.pb || 0).toFixed(0)}) · ${common.dotation || 0} · ${common.c_retorno || 0} / 86400 · ${common.cp || 0}`,
          result: `${(solution.q_total_seco * 1000 || 0).toFixed(2)} l/s (Aguas Negras)`
        },
        {
          title: "3. Respuesta Hidrológica (Tiempo de Lluvia)",
          description: "Aplicamos el método racional por zonas ante un aguacero de intensidad uniforme en toda la cuenca.",
          formula: "Q_pl = (Ca_a · A_a + Ca_b · A_b) · I",
          calcLabel: "Escorrentía Convergente",
          calculation: `(${zoneA.ca || 0} · ${(solution.sa_ha || 0).toFixed(1)}) + (${zoneB.ca || 0} · ${(solution.sb_ha || 0).toFixed(1)}) · ${common.intensity || 0}`,
          result: `${((solution.qpl_a + solution.qpl_b) || 0).toFixed(2)} l/s (Caudal Pluvial)`
        },
        {
          title: "4. Definición del Nodo de Salida (Punto C)",
          description: "El colector resultante aguas abajo del punto de unión C se dimensiona para la envolvente de ambos caudales (tiempo seco + lluvia).",
          calcLabel: "Caudal de Cálculo Final",
          calculation: `${(solution.q_total_seco || 0).toFixed(3)} + ${(((solution.qpl_a + solution.qpl_b) / 1000) || 0).toFixed(3)}`,
          result: `${(solution.q_total_lluvia || 0).toFixed(3)} m³/s (Capacidad Necesaria)`
        }
      ]} />
    </div>

  );
}
