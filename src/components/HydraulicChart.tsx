import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { THORMANN_FRANKE_TABLE, OVOID_HYDRAULIC_TABLE } from '../lib/constants';

interface HydraulicChartProps {
  currentYOverD?: number;
  currentVOverVllu?: number;
  currentQOverQllu?: number;
  type?: 'circular' | 'ovoid';
}

export default function HydraulicChart({ 
  currentYOverD, 
  currentVOverVllu, 
  currentQOverQllu,
  type = 'circular'
}: HydraulicChartProps) {
  
  const isCircular = type === 'circular';
  
  // Cast to any to avoid complex TS union issues with different keys (x vs y)
  const data = (isCircular 
    ? THORMANN_FRANKE_TABLE.map(([yd, vv, qq, rr, aa]) => ({
        yRatio: yd,
        vV: vv,
        qQ: qq,
        rR: rr,
        aA: aa
      }))
    : OVOID_HYDRAULIC_TABLE.map(([yh, vv, qq]) => ({
        yRatio: yh,
        vV: vv,
        qQ: qq
      }))) as any[];

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-8">
      {/* Chart at the top */}
      <div className="w-full min-w-0">
        <h3 className="text-[11px] font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">
          {isCircular ? 'Curvas de Thormann y Franke (Circular)' : 'Curvas de Funcionamiento Hidráulico (Ovoidal)'}
        </h3>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              layout={isCircular ? 'horizontal' : 'vertical'}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" />
              
              {isCircular ? (
                <>
                  <XAxis 
                    type="number" 
                    dataKey="yRatio"
                    domain={[0, 1]} 
                    stroke="#64748b" 
                    fontSize={10}
                    label={{ 
                      value: 'Grado de Llenado (y/D)', 
                      position: 'bottom', 
                      offset: 20, 
                      fontSize: 10, 
                      fill: '#94a3b8', 
                      fontWeight: 'bold' 
                    }}
                  />
                  <YAxis 
                    type="number" 
                    domain={[0, 1.3]} 
                    stroke="#64748b" 
                    fontSize={10}
                    label={{ 
                      value: 'Razones Hidráulicas (v/vll, Q/Qll, etc.)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fontSize: 10, 
                      fill: '#94a3b8', 
                      fontWeight: 'bold' 
                    }}
                  />
                </>
              ) : (
                <>
                  <XAxis 
                    type="number" 
                    domain={[0, 1.3]} 
                    stroke="#64748b" 
                    fontSize={10}
                    orientation="top"
                    ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3]}
                    label={{ 
                      value: 'Razón Hidráulica (v/vll, Q/Qll)', 
                      position: 'insideTopRight', 
                      offset: -5, 
                      fontSize: 10, 
                      fill: '#94a3b8', 
                      fontWeight: 'bold' 
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="yRatio"
                    domain={[0, 1]} 
                    reversed={true}
                    stroke="#64748b" 
                    fontSize={10}
                    ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                    label={{ 
                      value: 'Altura de Líquido (y/H)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fontSize: 10, 
                      fill: '#94a3b8', 
                      fontWeight: 'bold' 
                    }}
                  />
                </>
              )}

          <Tooltip 
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const yd = payload[0].payload.yRatio;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-[10px]">
                    <p className="font-bold border-b border-slate-700 pb-1 mb-1 uppercase tracking-wider">
                      POSICIÓN: y/{isCircular ? 'D' : 'H'} = {yd.toFixed(3)}
                    </p>
                    <div className="space-y-1 mt-2">
                      {payload.map((p, idx) => (
                        <div key={idx} className="flex justify-between gap-4">
                          <span style={{ color: p.color }} className="font-bold">{p.name}:</span>
                          <span className="font-mono">{Number(p.value).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Line 
            type="monotone" 
            dataKey="vV" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={false} 
            name="v/vll" 
            animationDuration={500}
          />
          <Line 
            type="monotone" 
            dataKey="qQ" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={false} 
            name="Q/Qll" 
            animationDuration={500}
          />
          
          {isCircular && (
            <>
              <Line 
                type="monotone" 
                dataKey="rR" 
                stroke="#10b981" 
                strokeWidth={1.5} 
                dot={false} 
                name="Rh/Rhll" 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="aA" 
                stroke="#f59e0b" 
                strokeWidth={1.5} 
                dot={false} 
                name="A/All" 
                animationDuration={500}
              />
            </>
          )}

          {/* Actual operation point */}
          {currentYOverD !== undefined && (
            isCircular 
              ? <ReferenceLine x={currentYOverD} stroke="#94a3b8" strokeDasharray="3 3" />
              : <ReferenceLine y={currentYOverD} stroke="#94a3b8" strokeDasharray="3 3" />
          )}
          
          {currentVOverVllu !== undefined && (
            isCircular
              ? <ReferenceLine y={currentVOverVllu} stroke="#3b82f6" strokeDasharray="2 2" strokeOpacity={0.5} />
              : <ReferenceLine x={currentVOverVllu} stroke="#3b82f6" strokeDasharray="2 2" strokeOpacity={0.5} />
          )}

          {currentQOverQllu !== undefined && (
            isCircular
              ? <ReferenceLine y={currentQOverQllu} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.5} />
              : <ReferenceLine x={currentQOverQllu} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.5} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center underline-offset-4">
          <LegendItem color="bg-blue-500" label="v/vll (Velocidad)" />
          <LegendItem color="bg-red-500" label="Q/Qll (Caudal)" />
          {isCircular && (
            <>
              <LegendItem color="bg-emerald-500" label="Rh/Rhll (Rad. Hidr.)" />
              <LegendItem color="bg-amber-500" label="A/All (Área)" />
            </>
          )}
        </div>
      </div>

      {/* Section preview at the bottom */}
      <div className="w-full flex flex-col items-center justify-center pt-8 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Sección Transversal</h4>
        <div className="flex items-center gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className={`relative ${isCircular ? 'w-24 h-24' : 'w-24 h-36'} bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex items-center justify-center`}>
             <svg viewBox={isCircular ? "0 0 100 100" : "0 0 100 150"} className="w-full h-full p-3">
               {isCircular ? (
                 <>
                   {/* Circular Shape */}
                   <circle cx="50" cy="50" r="40" fill="none" stroke="#64748b" strokeWidth="2.5" />
                   {/* Liquid fill */}
                   {currentYOverD !== undefined && (
                     <mask id="circleMask-bottom">
                       <rect x="0" y={100 - currentYOverD * 80 - 10} width="100" height="100" fill="white" />
                     </mask>
                   )}
                   <circle cx="50" cy="50" r="40" fill="#3b82f6" fillOpacity="0.2" mask="url(#circleMask-bottom)" />
                 </>
               ) : (
                 <>
                   {/* Ovoid Shape (drawn in 0-150 area, H=1.5*B) */}
                   <path 
                     d="M 50,10 A 40,40 0 0,0 10,50 A 100,100 0 0,0 35,140 A 15,15 0 0,0 65,140 A 100,100 0 0,0 90,50 A 40,40 0 0,0 50,10 Z" 
                     fill="none" 
                     stroke="#64748b" 
                     strokeWidth="2.5" 
                   />
                   {/* Liquid fill */}
                   {currentYOverD !== undefined && (
                     <mask id="ovoidMask-bottom">
                       <rect x="0" y={150 - currentYOverD * 130 - 10} width="100" height="150" fill="white" />
                     </mask>
                   )}
                   <path 
                     d="M 50,10 A 40,40 0 0,0 10,50 A 100,100 0 0,0 35,140 A 15,15 0 0,0 65,140 A 100,100 0 0,0 90,50 A 40,40 0 0,0 50,10 Z" 
                     fill="#3b82f6" 
                     fillOpacity="0.2"
                     mask="url(#ovoidMask-bottom)"
                   />
                 </>
               )}
             </svg>
             <div className="absolute top-0 right-0 h-full w-1.5 bg-slate-100">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500 shadow-[0_-2px_4px_rgba(59,130,246,0.3)]" 
                  style={{ height: `${(currentYOverD ?? 0) * 100}%` }}
                ></div>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grado de Llenado</span>
            <p className="font-mono text-lg font-black text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">{isCircular ? 'y/D' : 'y/H'}: {(currentYOverD ?? 0).toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
