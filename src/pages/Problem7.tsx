import { useState, useMemo } from 'react';
import { Calculator, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProblemSolution } from '../components/ProblemSolution';
import { interpolateThormannFrankeByQ, calculateCircularManning } from '../lib/hydraulics';
import HydraulicChart from '../components/HydraulicChart';
import { useLanguage } from '../context/LanguageContext';

export default function Problem7() {
  const { t, language } = useLanguage();
  const isEnglish = language === 'en';
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
    // Surfaces
    const sa_ha = (zoneA.width * zoneA.length) / 10000;
    const sb_ha = (zoneB.width * zoneB.length) / 10000;

    // Populations
    const pa = sa_ha * zoneA.density;
    const pb = sb_ha * zoneB.density;

    // Mean Flows
    const qa_med = (pa * common.dotation * common.c_retorno) / (24 * 3600);
    const qb_med = (pb * common.dotation * common.c_retorno) / (24 * 3600);
    const q_med_total = qa_med + qb_med;

    // Peak Flows
    const qa_p = qa_med * common.cp;
    const qb_p = qb_med * common.cp;
    const q_p_total = qa_p + qb_p;

    // Min Flows
    const q_min_total = q_med_total * 0.45;

    // Rainfall
    const qpl_a = 1 * zoneA.ca * common.intensity * sa_ha;
    const qpl_b = 1 * zoneB.ca * common.intensity * sb_ha;
    const qpl_total = qpl_a + qpl_b;

    // Totals at point C (Total A + Total B)
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
          {t.common.practicalModule}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.nav.p7}</h1>
        <p className="text-slate-600 mt-2">{isEnglish ? 'Aggregation of contributions by urban zones and verification of the resulting collector.' : 'Agregación de aportaciones por zonas urbanas y verificación del colector resultante.'}</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          {t.common.moduleAim}
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          {t.aims.p7}
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                {t.common.inputData}: Zona A
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Length (m)' : 'Longitud (m)'}</label>
                    <input type="number" value={zoneA.length} onChange={e => setZoneA({...zoneA, length: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Width (m)' : 'Ancho (m)'}</label>
                    <input type="number" value={zoneA.width} onChange={e => setZoneA({...zoneA, width: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Density (inh/Ha)' : 'Densidad (hab/Ha)'}</label>
                    <input type="number" value={zoneA.density} onChange={e => setZoneA({...zoneA, density: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Runoff Coeff. (Ca)' : 'C. Escorrentía (Ca)'}</label>
                    <input type="number" step="0.1" value={zoneA.ca} onChange={e => setZoneA({...zoneA, ca: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                {t.common.inputData}: Zona B
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Length (m)' : 'Longitud (m)'}</label>
                    <input type="number" value={zoneB.length} onChange={e => setZoneB({...zoneB, length: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Width (m)' : 'Ancho (m)'}</label>
                    <input type="number" value={zoneB.width} onChange={e => setZoneB({...zoneB, width: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Density (inh/Ha)' : 'Densidad (hab/Ha)'}</label>
                    <input type="number" value={zoneB.density} onChange={e => setZoneB({...zoneB, density: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Runoff Coeff. (Ca)' : 'C. Escorrentía (Ca)'}</label>
                    <input type="number" step="0.1" value={zoneB.ca} onChange={e => setZoneB({...zoneB, ca: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-slate-500" />
                 {t.common.inputData}: {isEnglish ? 'Final Pipe' : 'Colector Final'}
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Diameter (mm)' : 'Diámetro (mm)'}</label>
                     <input type="number" value={common.diameter_mm} onChange={e => setCommon({...common, diameter_mm: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Slope (j)' : 'Pendiente (j)'}</label>
                     <input type="number" step="0.001" value={common.j} onChange={e => setCommon({...common, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                 {isEnglish ? 'Global Parameters' : 'Datos de entrada: Parámetros Globales'}
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Demand (L/inh·day)' : 'Dotación (l/inh·día)'}</label>
                     <input type="number" value={common.dotation} onChange={e => setCommon({...common, dotation: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Peak Coeff.' : 'C. Punta (Cp)'}</label>
                     <input type="number" step="0.1" value={common.cp} onChange={e => setCommon({...common, cp: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Return Coeff.' : 'C. Retorno'}</label>
                     <input type="number" step="0.1" value={common.c_retorno} onChange={e => setCommon({...common, c_retorno: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Rain Intensity' : 'Intensidad Pluvial'}</label>
                     <input type="number" value={common.intensity} onChange={e => setCommon({...common, intensity: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
                 </div>
               </div>
            </div>
        </section>

        <section className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-4">{t.common.resultsCharts}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter tracking-widest">{isEnglish ? 'Zone A Summary (High)' : 'Resumen Zona A (Alta)'}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex justify-between">{isEnglish ? 'Inhabitants' : 'Habitantes'}: <span className="font-bold text-slate-900">{(solution.pa || 0).toFixed(0)}</span></p>
                        <p className="text-xs text-slate-600 flex justify-between">{isEnglish ? 'Area' : 'Área'}: <span className="font-bold text-slate-900">{(solution.sa_ha || 0).toFixed(1)} Ha</span></p>
                        <p className="text-[11px] text-blue-600 font-black mt-2 pt-2 border-t border-blue-100">{(solution.qa_p || 0).toFixed(2)} l/s {isEnglish ? 'peak' : 'punta'}</p>
                      </div>
                   </div>
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-tighter tracking-widest">{isEnglish ? 'Zone B Summary (Medium)' : 'Resumen Zona B (Media)'}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex justify-between">{isEnglish ? 'Inhabitants' : 'Habitantes'}: <span className="font-bold text-slate-900">{(solution.pb || 0).toFixed(0)}</span></p>
                        <p className="text-xs text-slate-600 flex justify-between">{isEnglish ? 'Area' : 'Área'}: <span className="font-bold text-slate-900">{(solution.sb_ha || 0).toFixed(1)} Ha</span></p>
                        <p className="text-[11px] text-indigo-600 font-black mt-2 pt-2 border-t border-indigo-100">{(solution.qb_p || 0).toFixed(2)} l/s {isEnglish ? 'peak' : 'punta'}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex justify-between items-center shadow-lg shadow-blue-200">
                        <div>
                             <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">{isEnglish ? 'Total Dry Weather (Wastewater)' : 'Total Tiempo Seco (Residual)'}</p>
                             <div className="flex items-baseline gap-2">
                               <p className="text-4xl font-black">{(solution.q_total_seco || 0).toFixed(3)}</p>
                               <span className="text-lg opacity-50">m³/s</span>
                             </div>
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl flex justify-between items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="relative z-10">
                             <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">{isEnglish ? 'Hydraulic Design Capacity' : 'Capacidad Hidráulica de Diseño'}</p>
                             <div className="flex items-baseline gap-2">
                               <p className="text-4xl font-black">{(solution.q_total_lluvia || 0).toFixed(3)}</p>
                               <span className="text-lg opacity-50 text-indigo-300">m³/s</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border-t-4 shadow-sm bg-slate-50 ${solution.isValid ? 'border-t-green-500' : 'border-t-orange-500'}`}>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.common.hydraulicChecks}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">{isEnglish ? 'v_min (Residual)' : 'v_min (Residual)'}</p>
                      <p className={`text-sm font-black ${solution.vMin >= 0.3 ? 'text-green-600' : 'text-orange-600'}`}>{(solution.vMin || 0).toFixed(2)} / 0.30 m/s</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">{isEnglish ? 'v_max (Pluvial)' : 'v_max (Pluvial)'}</p>
                      <p className={`text-sm font-black ${solution.vMax <= 5.0 ? 'text-blue-600' : 'text-orange-600'}`}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 col-span-2">
                       <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 text-center">{isEnglish ? 'Filling Degree (y/D)' : 'Llenado (y/D)'}</p>
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
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{isEnglish ? 'Convergence Scheme' : 'Esquema de Convergencia'}</h4>
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
                    {isEnglish 
                      ? <>The final collector downstream of <b>Point C</b> must be sized for <b>{solution.q_total_lluvia.toFixed(3)} m³/s</b>.</>
                      : <>El colector final aguas abajo de <b>Punto C</b> debe dimensionarse para <b>{solution.q_total_lluvia.toFixed(3)} m³/s</b>.</>}
                </p>
           </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: isEnglish ? "1. Surfaces and Population Quantification" : "1. Cuantificación de Superficies y Población",
          description: isEnglish
            ? "We calculate the gross surface area of each discharge zone and its associated population through the residential density defined for each sector."
            : "Calculamos la superficie bruta de cada zona de vertido y su población asociada mediante la densidad habitacional definida para cada sector.",
          calcLabel: isEnglish ? "Zonal Balance" : "Balance Zonal",
          calculation: `Z-A: ${zoneA.width}x${zoneA.length} / 10k = ${(solution.sa_ha || 0).toFixed(1)} Ha | Z-B: ${zoneB.width}x${zoneB.length} / 10k = ${(solution.sb_ha || 0).toFixed(1)} Ha`,
          result: `${isEnglish ? 'Total Pop' : 'Pob. Total'}: ${(solution.pa + solution.pb).toFixed(0)} ${isEnglish ? 'inhabitants' : 'habitantes'}`
        },
        {
          title: isEnglish ? "2. Wastewater Production (Dry Weather)" : "2. Producción de Aguas Negras (Tiempo Seco)",
          description: isEnglish
            ? "We determine the total peak flow expected at the meeting point considering the water demand and peak return contributions from both sectors."
            : "Determinamos el caudal punta total esperado en el punto de encuentro considerando las aportaciones de dotación y retorno punta de ambos sectores.",
          formula: "Q_p = (Pop_tot · Dot · Cret / 86400) · C_p",
          calcLabel: isEnglish ? "Aggregated Residual Demand" : "Demanda Residual Agregada",
          calculation: `(${(solution.pa || 0).toFixed(0)} + ${(solution.pb || 0).toFixed(0)}) · ${common.dotation || 0} · ${common.c_retorno || 0} / 86400 · ${common.cp || 0}`,
          result: `${(solution.q_total_seco * 1000 || 0).toFixed(2)} l/s (${isEnglish ? 'Wastewater' : 'Aguas Negras'})`
        },
        {
          title: isEnglish ? "3. Hydrological Response (Rainy Weather)" : "3. Respuesta Hidrológica (Tiempo de Lluvia)",
          description: isEnglish
            ? "We apply the rational method by zones given a uniform intensity storm throughout the basin."
            : "Utilizamos el método racional por zonas ante un aguacero de intensidad uniforme en toda la cuenca.",
          formula: "Q_pl = (Ca_a · A_a + Ca_b · A_b) · I",
          calcLabel: isEnglish ? "Converging Runoff" : "Escorrentía Convergente",
          calculation: `(${zoneA.ca || 0} · ${(solution.sa_ha || 0).toFixed(1)}) + (${zoneB.ca || 0} · ${(solution.sb_ha || 0).toFixed(1)}) · ${common.intensity || 0}`,
          result: `${((solution.qpl_a + solution.qpl_b) || 0).toFixed(2)} l/s (${isEnglish ? 'Rain Flow' : 'Caudal Pluvial'})`
        },
        {
          title: isEnglish ? "4. Outlet Node Definition (Point C)" : "4. Definición del Nodo de Salida (Punto C)",
          description: isEnglish
            ? "The resulting collector downstream of the junction point C is sized for the envelope of both flows (dry weather + rain)."
            : "El colector resultante aguas abajo del punto de unión C se dimensiona para la envolvente de ambos caudales (tiempo seco + lluvia).",
          calcLabel: isEnglish ? "Final Design Flow" : "Caudal de Cálculo Final",
          calculation: `${(solution.q_total_seco || 0).toFixed(3)} + ${(((solution.qpl_a + solution.qpl_b) / 1000) || 0).toFixed(3)}`,
          result: `${(solution.q_total_lluvia || 0).toFixed(3)} m³/s (${isEnglish ? 'Required Capacity' : 'Capacidad Necesaria'})`
        }
      ]} />
    </div>
  );
}
