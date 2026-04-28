import { ArrowRight, GraduationCap, Droplets, Ruler, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  return (
    <div className="space-y-16 py-8">
      <div className="text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-200"
        >
          <GraduationCap className="w-4 h-4" />
          Ingeniería Sanitaria Diseño de colectores
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]"
        >
          SaniDimension <br/>
          <span className="text-blue-600">Dimensionamiento Hidráulico</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Herramienta docente interactiva para el aprendizaje activo del dimensionamiento hidráulico de colectores 
          urbanos, combinando cálculo guiado, verificaciones hidráulicas y visualización gráfica.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={onStart}
            className="px-10 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 uppercase tracking-widest"
          >
            Comenzar módulos
            <ArrowRight className="w-5 h-5 text-blue-400" />
          </button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16 px-4">
        {[
          {
            title: "Cálculo de Manning",
            desc: "Algoritmos optimizados para secciones circulares, ovoides y galerías visitables de cualquier escala.",
            icon: Droplets
          },
          {
            title: "Llenado parcial",
            desc: "Relaciones hidráulicas precisas y/D, V/Vll y Q/Qll basadas en las tablas de Thormann y Franke.",
            icon: BarChart3
          },
          {
            title: "Verificación hidráulica",
            desc: "Validación automática de velocidades de autolimpieza y erosión (0.6 - 5.0 m/s).",
            icon: Ruler
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">{feature.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-xl overflow-hidden mt-20">
        <div className="bg-slate-900 rounded-xl p-12 text-white relative overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-black mb-6 tracking-tight leading-tight">Aprendizaje activo <br/> con resultados interactivos</h2>
              <div className="space-y-4">
                {[
                  "Ajuste de rugosidad según material (n)",
                  "Cálculo de horizontes de población (+25 años)",
                  "Modelado de escorrentía pluvial racional",
                  "Gráficas de comportamiento hidráulico"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="space-y-2 font-mono text-[10px] text-blue-300">
                <p># VERIFICACIÓN HIDRÁULICA</p>
                <p>diámetro: 600mm</p>
                <p>pendiente: 0.008 m/m</p>
                <p>velocidad: 1.54 m/s [Válida]</p>
                <p>llenado: 0.72 [Revisar]</p>
              </div>
            </div>
          </div>
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
      </div>
    </div>
  );
}
