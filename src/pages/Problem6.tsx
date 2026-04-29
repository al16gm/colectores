import { useState, useMemo } from 'react';
import { Users, CloudRain, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { interpolateThormannFrankeByQ, calculateCircularManning } from '../lib/hydraulics';
import { ProblemSolution } from '../components/ProblemSolution';
import HydraulicChart from '../components/HydraulicChart';
import { useLanguage } from '../context/LanguageContext';

export default function Problem6() {
  const { t, language } = useLanguage();
  const isEnglish = language === 'en';
  const [params, setParams] = useState({
    population: 250000,
    dotation: 200,
    c_retorno: 0.85,
    cp: 1.5,
    c_min: 0.45,
    intensity_ls_ha: 60,
    area_km2: 1,
    c_runoff: 0.8,
    kt: 1,
    diameter_mm: 1200,
    n: 0.013,
    j: 0.005
  });

  const solution = useMemo(() => {
    // a. Caudales aguas negras
    const q_potable_ls = (params.population * params.dotation) / (24 * 3600);
    const q_med_n = q_potable_ls * params.c_retorno;
    const q_max_n = q_med_n * params.cp;
    const q_min_n = q_med_n * params.c_min;

    // b. Caudales pluviales
    const area_ha = params.area_km2 * 100;
    const q_plu = params.kt * params.c_runoff * params.intensity_ls_ha * area_ha;

    // c. Total Unitario
    const q_total_max_ls = q_max_n + q_plu;
    const q_total_max = q_total_max_ls / 1000; // m3/s

    // Hydraulic checks
    const d = params.diameter_mm / 1000;
    const full = calculateCircularManning({ n: params.n, j: params.j, d });

    // Scenario 1: Qmin
    const ratioMin = (q_min_n / 1000) / (full.qFull || 1);
    const tfMin = interpolateThormannFrankeByQ(ratioMin);
    const vMin = tfMin.vOverVllu * full.vFull;

    // Scenario 2: Qp Residual
    const ratioP = (q_max_n / 1000) / (full.qFull || 1);
    const tfP = interpolateThormannFrankeByQ(ratioP);
    const vP = tfP.vOverVllu * full.vFull;

    // Scenario 3: Qtotal
    const ratioTotal = q_total_max / (full.qFull || 1);
    const tfTotal = interpolateThormannFrankeByQ(ratioTotal);
    const vMax = tfTotal.vOverVllu * full.vFull;
    const yOverDTotal = tfTotal.yOverD;

    return {
      q_med_n,
      q_max_n,
      q_min_n,
      q_plu,
      q_total_max,
      area_ha,
      vMin,
      vP,
      vMax,
      yOverDTotal,
      isValid: vMin >= 0.3 && vMax <= 5 && yOverDTotal <= 0.8
    };
  }, [params]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          {t.common.practicalModule}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.nav.p6}</h1>
        <p className="text-slate-600 mt-2">{isEnglish ? 'Hydraulic check of a unit collector carrying residual and stormwater runoff.' : 'Comprobación de un colector unitario que transporta caudal residual y escorrentía pluvial.'}</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          {t.common.moduleAim}
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          {t.aims.p6}
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              {t.common.inputData}: {isEnglish ? 'Population' : 'Población'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Population (inh)' : 'Población (hab)'}</label>
                <input type="number" value={params.population} onChange={e => setParams({...params, population: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Demand (L/inh·day)' : 'Dotación (l/inh·día)'}</label>
                <input type="number" value={params.dotation} onChange={e => setParams({...params, dotation: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Return Coeff.' : 'Coeficiente Retorno'}</label>
                <input type="number" step="0.05" value={params.c_retorno} onChange={e => setParams({...params, c_retorno: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Peak Coeff.' : 'Coeficiente Punta'}</label>
                <input type="number" step="0.1" value={params.cp} onChange={e => setParams({...params, cp: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-indigo-500" />
              {t.common.inputData}: {isEnglish ? 'Basin' : 'Cuenca'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Intensity (l/s/Ha)' : 'Intensidad (l/s/Ha)'}</label>
                <input type="number" value={params.intensity_ls_ha} onChange={e => setParams({...params, intensity_ls_ha: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Total Area (km²)' : 'Área Total (km²)'}</label>
                <input type="number" step="0.1" value={params.area_km2} onChange={e => setParams({...params, area_km2: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Runoff Coeff.' : 'C. de Escorrentía'}</label>
                <input type="number" step="0.1" value={params.c_runoff} onChange={e => setParams({...params, c_runoff: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-slate-500" />
              {t.common.inputData}: {isEnglish ? 'Pipe Parameters' : 'Parámetros del Colector'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Diameter (mm)' : 'Diámetro (mm)'}</label>
                <input type="number" value={params.diameter_mm} onChange={e => setParams({...params, diameter_mm: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-500 outline-none transition-all" />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{isEnglish ? 'Slope (j)' : 'Pendiente (j)'}</label>
                <input type="number" step="0.001" value={params.j} onChange={e => setParams({...params, j: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-4">{t.common.resultsCharts}</h3>
            
            <div className="space-y-4">
               <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight">{isEnglish ? 'Wastewater Demands (Black)' : 'Demandas Residuales (Negras)'}</p>
                    <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">{isEnglish ? 'PEAK HOUR' : 'HORA PUNTA'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-left">
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{isEnglish ? 'Mean' : 'Medio'}</p>
                      <p className="text-lg font-black text-slate-800">{(solution.q_med_n || 0).toFixed(0)} <span className="text-[10px] font-normal opacity-40">l/s</span></p>
                    </div>
                    <div className="text-left border-l border-blue-200 pl-4">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{isEnglish ? 'Peak' : 'Punta'}</p>
                      <p className="text-lg font-black text-slate-800">{(solution.q_max_n || 0).toFixed(0)} <span className="text-[10px] font-normal opacity-40">l/s</span></p>
                    </div>
                    <div className="text-left border-l border-blue-200 pl-4">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{isEnglish ? 'Minimum' : 'Mínimo'}</p>
                      <p className="text-lg font-black text-slate-800">{(solution.q_min_n || 0).toFixed(0)} <span className="text-[10px] font-normal opacity-40">l/s</span></p>
                    </div>
                  </div>
               </div>

               <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight mb-3">{isEnglish ? 'Surface Runoff (Stormwater)' : 'Escorrentía Superficial (Pluviales)'}</p>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600">{isEnglish ? 'Rational Method (Direct)' : 'Método Racional Directo'}</p>
                      <p className="text-[10px] font-mono text-slate-400">Q = {params.c_runoff} · {params.intensity_ls_ha} · {solution.area_ha}</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{(solution.q_plu || 0).toFixed(0)} <span className="text-xs font-normal opacity-40">l/s</span></p>
                  </div>
               </div>

               <div className="p-6 bg-slate-950 text-white rounded-2xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{isEnglish ? 'Design Pipe Flow' : 'Caudal de Diseño del Colector'}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-blue-400">{(solution.q_total_max || 0).toFixed(3)}</p>
                    <p className="text-xl font-bold text-slate-500">m³/s</p>
                  </div>
                  
                  {/* Proportional distribution bar */}
                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>{isEnglish ? 'Wastewater' : 'Residuales'} {(solution.q_max_n / (solution.q_total_max * 1000) * 100).toFixed(1)}%</span>
                      <span>{isEnglish ? 'Stormwater' : 'Pluviales'} {(solution.q_plu / (solution.q_total_max * 1000) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full flex overflow-hidden border border-white/5">
                      <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(solution.q_max_n / (solution.q_total_max * 1000)) * 100}%` }}></div>
                      <div className="h-full bg-indigo-600" style={{ width: `${(solution.q_plu / (solution.q_total_max * 1000)) * 100}%` }}></div>
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
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">{isEnglish ? 'v_max (Stormwater)' : 'v_max (Pluvial)'}</p>
                      <p className={`text-sm font-black ${solution.vMax <= 5.0 ? 'text-blue-600' : 'text-orange-600'}`}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 col-span-2">
                       <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 text-center">{isEnglish ? 'Stormwater Filling Degree (y/D)' : 'Grado Llenado Lluvia (y/D)'}</p>
                       <p className={`text-xl font-black text-center ${solution.yOverDTotal <= 0.8 ? 'text-blue-600' : 'text-slate-900'}`}>{(solution.yOverDTotal || 0).toFixed(3)}</p>
                    </div>
                  </div>
               </div>

               <HydraulicChart 
                  currentYOverD={solution.yOverDTotal}
                  currentQOverQllu={solution.q_total_max / (calculateCircularManning({n: params.n, j: params.j, d: params.diameter_mm/1000}).qFull || 1)}
               />
            </div>
          </div>
        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: isEnglish ? "1. Wastewater Characterization" : "1. Caracterización de Aguas Negras",
          description: isEnglish
            ? "We calculate the mean and extreme (peak and minimum) demands of the population center considering a specific water dotation and the system return coefficient."
            : "Calculamos las demandas medias y extremas (punta y mínima) del núcleo de población considerando una dotación específica y el coeficiente de retorno del sistema de saneamiento.",
          formula: "Q_n = (Pop · Dot · Cret / 86400) · C_p",
          calcLabel: isEnglish ? "Wastewater Hydrograph" : "Hidrograma de Aguas Negras",
          calculation: `Q_punta = (${(params.population || 0)} · ${(params.dotation || 0)} · ${(params.c_retorno || 0)} / 86400) · ${(params.cp || 0)}`,
          result: `${(solution.q_max_n || 0).toFixed(2)} l/s (${isEnglish ? 'Peak Residuals' : 'Residuales Pico'})`
        },
        {
          title: isEnglish ? "2. Rainfall Flow Estimation" : "2. Estimación de Caudales Pluviales",
          description: isEnglish
            ? "We use the Rational Method to estimate the peak surface runoff of the contributing urban basin given the design storm defined by rainfall intensity."
            : "Utilizamos el Método Racional para estimar el pico de escorrentía superficial de la cuenca urbana aportante ante el aguacero de diseño definido por la intensidad pluviométrica.",
          formula: "Q_pl = C · I · A",
          calcLabel: isEnglish ? "Rain Basin Response" : "Respuesta de la Cuenca Pluvial",
          calculation: `${(params.c_runoff || 0)} · ${(params.intensity_ls_ha || 0)} · ${(solution.area_ha || 0)} ha`,
          result: `${(solution.q_plu || 0).toFixed(2)} l/s (${isEnglish ? 'Rain Load' : 'Carga Pluvial'})`
        },
        {
          title: isEnglish ? "3. Total Unitary Sizing" : "3. Dimensionamiento Unitario Total",
          description: isEnglish
            ? "The final unitary collector must be able to critically transport the sum of peak wastewater flow and maximum stormwater flow for the chosen return period."
            : "El colector unitario final debe ser capaz de transportar de forma crítica la suma del caudal punta de aguas negras y el caudal máximo de pluviales para el periodo de retorno elegido.",
          formula: "Q_total = Q_negras_punta + Q_pluviales",
          calcLabel: isEnglish ? "Converging Unitary Flow" : "Caudal Unitario Convergente",
          calculation: `${(solution.q_max_n || 0).toFixed(2)} l/s + ${(solution.q_plu || 0).toFixed(2)} l/s`,
          result: `${(solution.q_total_max || 0).toFixed(3)} m³/s (${isEnglish ? 'Required Capacity' : 'Capacidad Requerida'})`
        }
      ]} />
    </div>

  );
}
