import { useState, useMemo } from 'react';
import { Calculator, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { calculateCircularManning, interpolateThormannFrankeByQ } from '../lib/hydraulics';
import HydraulicChart from '../components/HydraulicChart';
import { ProblemSolution } from '../components/ProblemSolution';

export default function Problem2() {
  const [data, setData] = useState({
    q_med_actual: 0.05,
    q_min_actual: 0.02,
    q_p_actual: 0.12,
    q_pl_actual: 1.0,
    q_med_25: 0.15,
    q_min_25: 0.06,
    q_p_25: 0.30,
    q_pl_25: 1.5,
    j: 0.01,
    n: 0.0137,
    diameter_mm: 1000
  });

  const solution = useMemo(() => {
    const d = data.diameter_mm / 1000;
    const q_max_total = data.q_p_25 + data.q_pl_25; // As per PDF 2, page 8 calculation
    
    const full = calculateCircularManning({ n: data.n, j: data.j, d });
    const qRatioMax = q_max_total / full.qFull;
    const tfMax = interpolateThormannFrankeByQ(qRatioMax);
    const vMax = tfMax.vOverVllu * full.vFull;

    const qRatioP = data.q_p_25 / full.qFull;
    const tfP = interpolateThormannFrankeByQ(qRatioP);
    const vP = tfP.vOverVllu * full.vFull;

    const qRatioMin = data.q_min_actual / full.qFull; // Checks min status
    const tfMin = interpolateThormannFrankeByQ(qRatioMin);
    const vMin = tfMin.vOverVllu * full.vFull;

    return {
      q_max_total,
      full,
      qRatioMax,
      yOverDMax: tfMax.yOverD,
      vMax,
      vP,
      vMin,
      yOverDP: tfP.yOverD,
      isValid: vMax < 5 && vP < 3 && vMin > 0.6 // Simplified conditions based on PDF
    };
  }, [data]);

  return (
    <div className="space-y-8 py-6">
      <header>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
          <TrendingUp className="w-4 h-4" />
          Módulo práctico
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verificación hidráulica de colector urbano</h1>
        <p className="text-slate-600 mt-2">Evaluación de un colector urbano en situación actual y horizonte de diseño.</p>
      </header>

      <section className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">
          Qué se pretende en este módulo
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          Evaluar el comportamiento actual y futuro de un colector urbano considerando caudales residuales, caudales pluviales y horizonte de diseño.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-4">Datos de entrada: Caudales de Diseño (m³/s)</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-black text-blue-600 uppercase">Situación actual</p>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Q Medio</label>
                  <input type="number" step="0.01" value={data.q_med_actual} onChange={e => setData({...data, q_med_actual: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Q Mínimo</label>
                  <input type="number" step="0.01" value={data.q_min_actual} onChange={e => setData({...data, q_min_actual: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black text-indigo-600 uppercase">Horizonte de diseño (+25 años)</p>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Q Punta (Qp)</label>
                  <input type="number" step="0.01" value={data.q_p_25} onChange={e => setData({...data, q_p_25: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Q Pluviales (Qpl)</label>
                  <input type="number" step="0.01" value={data.q_pl_25} onChange={e => setData({...data, q_pl_25: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Datos de entrada: Parámetros del Colector</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Diámetro (mm)</label>
                <input type="number" value={data.diameter_mm} onChange={e => setData({...data, diameter_mm: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Pendiente (j)</label>
                <input type="number" step="0.001" value={data.j} onChange={e => setData({...data, j: Number(e.target.value)})} className="w-full text-sm font-bold p-2 bg-slate-50 border rounded" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className={`p-6 rounded-2xl border-t-4 shadow-sm ${solution.isValid ? 'bg-white border-t-blue-500' : 'bg-white border-t-orange-500'}`}>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">Verificaciones hidráulicas</h3>
            
            <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Caudal mínimo actual</span>
                    <span className={(solution.vMin || 0) >= 0.6 ? 'text-green-600' : 'text-orange-600'}>{(solution.vMin || 0).toFixed(2)} / 0.60 m/s</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${(solution.vMin || 0) >= 0.6 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vMin || 0) / 1.2) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Caudal punta futuro</span>
                    <span className={(solution.vP || 0) <= 3.0 ? 'text-blue-600' : 'text-orange-600'}>{(solution.vP || 0).toFixed(2)} / 3.00 m/s</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${(solution.vP || 0) <= 3.0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vP || 0) / 4) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Caudal total futuro</span>
                    <span className={(solution.vMax || 0) <= 5.0 ? 'text-blue-600' : 'text-orange-600'}>{(solution.vMax || 0).toFixed(2)} / 5.00 m/s</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${(solution.vMax || 0) <= 5.0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(((solution.vMax || 0) / 6) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Llenado máximo (Qtotal)</span>
                    <span className={(solution.yOverDMax || 0) <= 1.0 ? 'text-blue-600' : 'text-orange-600'}>{(solution.yOverDMax || 0).toFixed(3)} / 1.00</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${(solution.yOverDMax || 0) <= 1.0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${(solution.yOverDMax || 0) * 100}%` }}></div>
                  </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 italic text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                Resultados y gráficas
            </div>
          </div>
          
          <HydraulicChart 
            currentYOverD={solution.yOverDMax}
            currentQOverQllu={solution.qRatioMax}
          />

        </section>
      </div>

      <ProblemSolution steps={[
        {
          title: "1. Caudal de Diseño Total",
          description: "Se estima la carga máxima del sistema sumando el caudal punta de aguas negras en el horizonte de 25 años y el caudal de pluviales de diseño.",
          formula: "Q_max = Q_p(25) + Q_pl(25)",
          calcLabel: "Cálculo de Caudal Total",
          calculation: `${(data.q_p_25 || 0).toFixed(2)} + ${(data.q_pl_25 || 0).toFixed(2)}`,
          result: `${(solution.q_max_total || 0).toFixed(2)} m³/s`
        },
        {
          title: "2. Verificación de la Sección Llena",
          description: "Calculamos las capacidades del colector a sección completa (D=1000mm, n=0.0137) mediante la ecuación de Manning.",
          formula: "Q_ll = (1/n) · A · Rh^(2/3) · J^(1/2) | V_ll = Q_ll / A",
          calcLabel: "Cálculo de Capacidad Teórica",
          calculation: `Q_ll = (1/${data.n}) · 0.785 · 0.25^(2/3) · ${data.j}^(1/2)`,
          result: `${(solution.full?.qFull || 0).toFixed(3)} m³/s | ${(solution.full?.vFull || 0).toFixed(2)} m/s`
        },
        {
          title: "3. Razones Hidráulicas",
          description: "Determinamos las razones de caudal para buscar en las tablas de Thormann-Franke los coeficientes de velocidad (v/vll) y calado (y/D).",
          formula: "q = Q / Q_ll",
          calcLabel: "Búsqueda en Tablas",
          calculation: `q_max = ${(solution.q_max_total || 0).toFixed(3)} / ${(solution.full?.qFull || 0).toFixed(3)} = ${(solution.qRatioMax || 0).toFixed(3)}`,
          result: `y/D_max = ${(solution.yOverDMax || 0).toFixed(3)} | v/vll_max = ${(solution.vMax / (solution.full?.vFull || 1)).toFixed(3)}`
        },
        {
          title: "4. Evaluación de Velocidades y Calados",
          description: "Se verifican los condicionantes de diseño: Autolimpieza en tiempo seco mínimo (v > 0.6 m/s), velocidad máxima para evitar erosión (v < 5.0 m/s) y grado de llenado máximo (y/D < 0.8 en unitarios, aunque aquí se admite 1.0 en extremos pluviales).",
          calcLabel: "Chequeo Normativo",
          calculation: `v_min = ${(solution.vMin / (solution.full?.vFull || 1)).toFixed(3)} · ${(solution.full?.vFull || 0).toFixed(2)} | y/D_max = ${(solution.yOverDMax || 0).toFixed(3)}`,
          result: `v_min: ${(solution.vMin || 0).toFixed(2)} m/s | v_max: ${(solution.vMax || 0).toFixed(2)} m/s | y/D: ${(solution.yOverDMax || 0).toFixed(2)}`
        }
      ]} />
    </div>

  );
}
