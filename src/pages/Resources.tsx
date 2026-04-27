import { useState } from 'react';
import { BookOpen, Table, BarChart, FileText } from 'lucide-react';
import HydraulicChartExplorer from '../components/HydraulicChartExplorer';

export default function Resources() {
  const [activeChart, setActiveChart] = useState('circular');

  return (
    <div className="space-y-12 py-4">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
          <BookOpen className="w-3 h-3" />
          Acervo Técnico de Referencia
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          Material Complementario
        </h1>
        <p className="text-sm text-slate-500 font-medium">Standardización de fórmulas y parámetros para el cálculo de saneamiento urbano.</p>
      </header>

      <section className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                <FileText className="w-3.5 h-3.5 text-blue-500 mr-2" />
                Fórmula Fundamental de Manning
              </h2>
              <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 uppercase">Estándar ISO</span>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="p-10 bg-slate-50 rounded-lg flex items-center justify-center font-mono text-2xl text-slate-900 border border-slate-100 relative group">
                <span className="relative z-10">Q = (1/n) · R<sub>H</sub><sup>2/3</sup> · j<sup>1/2</sup> · S</span>
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                {[
                  { sym: "Q", desc: "Caudal Volumétrico", unit: "m³/s" },
                  { sym: "n", desc: "Rugosidad de Manning", unit: "adimensional" },
                  { sym: "RH", desc: "Radio Hidráulico", unit: "m" },
                  { sym: "j", desc: "Pendiente Hidráulica", unit: "m/m" },
                  { sym: "S", desc: "Sección Mojada", unit: "m²" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 group">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-blue-500 transition-colors">{item.sym}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 uppercase">{item.desc}</p>
                      <p className="text-[9px] font-mono text-slate-400">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center">
                    <Table className="w-3.5 h-3.5 text-blue-500 mr-2" />
                    Sección Circular
                  </h3>
               </div>
               <div className="p-6 space-y-4">
                  {[
                    { label: "Área (Sll)", val: "π · D² / 4" },
                    { label: "Radio (RH,ll)", val: "D / 4" },
                    { label: "Perímetro (Pll)", val: "π · D" }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-500 uppercase">{row.label}</span>
                      <span className="font-mono font-bold text-slate-900">{row.val}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-white bg-slate-900">
               <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center">
                    <Table className="w-3.5 h-3.5 text-blue-400 mr-2" />
                    Sección Ovoide
                  </h3>
               </div>
               <div className="p-6 space-y-4">
                  {[
                    { label: "Radio (RH)", val: "0.193 · H" },
                    { label: "Área (S)", val: "0.51 · H²" },
                    { label: "Formatos", val: "60x90, 80x120" }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-400 uppercase">{row.label}</span>
                      <span className="font-mono font-bold text-blue-400">{row.val}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => setActiveChart('circular')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeChart === 'circular' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Circular
                </button>
                <button 
                  onClick={() => setActiveChart('ovoid')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeChart === 'ovoid' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Ovoidal
                </button>
              </div>
              <div className="p-2">
                <HydraulicChartExplorer type={activeChart as any} />
              </div>
           </div>
           
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center text-blue-600">
                    <BarChart className="w-3.5 h-3.5 mr-2" />
                    Protocolos y Límites de Diseño
                  </h3>
              </div>
              <div className="p-6 space-y-6">
                  {[
                    { val: "Vmax = 5.0 m/s", desc: "Prevención de erosión estructural nocturna.", color: "text-red-600", bg: "bg-red-50" },
                    { val: "Vmin = 0.6 m/s", desc: "Garantía de autolimpieza en estiaje.", color: "text-green-600", bg: "bg-green-50" },
                    { val: "y/D ≤ 0.80", desc: "Ventilación y control de gases (H2S).", color: "text-blue-600", bg: "bg-blue-50" }
                  ].map((limit, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className={`shrink-0 w-1 rounded-full h-12 ${limit.bg.replace('bg-', 'bg-opacity-100 bg-')}`}></div>
                        <div>
                          <p className={`text-lg font-mono font-black ${limit.color}`}>{limit.val}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{limit.desc}</p>
                        </div>
                    </div>
                  ))}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
