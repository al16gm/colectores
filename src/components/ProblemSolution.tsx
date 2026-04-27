import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Info, ArrowRight } from 'lucide-react';

interface SolutionStep {
  title: string;
  description: string;
  formula?: string;
  calcLabel?: string;
  calculation?: string;
  result?: string;
}

interface ProblemSolutionProps {
  steps: SolutionStep[];
}

export const ProblemSolution: React.FC<ProblemSolutionProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div id="problem-solution-container" className="mt-8 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Solución Paso a Paso</h3>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                
                {step.formula && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px] text-blue-700 flex items-center overflow-x-auto">
                    <span className="text-slate-400 mr-2 shrink-0">Fórmula:</span>
                    <span className="whitespace-nowrap">{step.formula}</span>
                  </div>
                )}
                
                {step.calculation && (
                  <div className="flex flex-wrap items-center gap-2 py-1 text-sm text-slate-700 font-medium">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                      {step.calcLabel ? `${step.calcLabel}:` : 'Cálculo:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{step.calculation}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-blue-600 font-bold">{step.result}</span>
                    </div>
                  </div>
                )}
                
                {!step.calculation && step.result && (
                   <div className="text-sm font-bold text-blue-600">
                     Resultado: {step.result}
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Nota:</strong> Los valores de las razones hidráulicas se han obtenido mediante interpolación lineal de tablas técnicas estandarizadas.
        </p>
      </div>
    </div>
  );
};
