import { useState } from 'react';
import HydraulicChart from './HydraulicChart';
import { interpolateThormannFrankeByY, interpolateOvoidByY } from '../lib/hydraulics';

interface HydraulicChartExplorerProps {
  type?: 'circular' | 'ovoid';
}

export default function HydraulicChartExplorer({ type = 'circular' }: HydraulicChartExplorerProps) {
  const [yd, setYd] = useState(0.5);
  const isCircular = type === 'circular';
  
  const { vOverVllu, qOverQllu } = isCircular 
    ? interpolateThormannFrankeByY(yd)
    : interpolateOvoidByY(yd);

  const labelPrefix = isCircular ? 'y/D' : 'y/H';

  return (
    <div className="space-y-6">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Simulador: {isCircular ? 'Tubería Circular' : 'Tubería Ovoidal'}
        </h4>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase">Grado de Llenado ({labelPrefix})</span>
            <span className="text-sm font-mono font-black text-blue-600">{(yd * 100).toFixed(1)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={yd} 
            onChange={(e) => setYd(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Velocidad v/vll</p>
            <p className="text-lg font-mono font-black text-blue-600">{vOverVllu.toFixed(3)}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Caudal Q/Qll</p>
            <p className="text-lg font-mono font-black text-red-600">{qOverQllu.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <HydraulicChart 
          type={type}
          currentYOverD={yd} 
          currentVOverVllu={vOverVllu} 
          currentQOverQllu={qOverQllu} 
        />
      </div>
      
      <div className="px-6 pb-6 pt-2">
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Observaciones Hidráulicas</p>
          <ul className="space-y-2 text-[11px] text-slate-300 font-medium">
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              {yd > 0.81 ? "La velocidad comienza a disminuir debido al rozamiento en la parte superior." : "La velocidad aumenta progresivamente con el calado."}
            </li>
            <li className="flex gap-2">
              <span className="text-red-400">•</span>
              {yd > (isCircular ? 0.94 : 0.96) ? "El caudal disminuye drásticamente. El colector está entrando en fase de saturación." : "El caudal aumenta de forma no lineal respecto al calado."}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
