import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Info, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          <Calculator size={20} />
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
          {t.common.stepByStep}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {steps.map((step, index) => (
          <div key={`${step.title}-${index}`} className="relative pl-10">
            {index < steps.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-200" />
            )}
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
              {index + 1}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                {step.title}
                {index < steps.length - 1 && <ArrowRight size={14} className="text-slate-400" />}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {step.description}
              </p>

              {step.formula && (
                <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3 font-mono text-xs text-slate-700 overflow-x-auto">
                  <span className="text-blue-600 font-bold">{t.common.formula}</span> {step.formula}
                </div>
              )}

              {step.calculation && (
                <div className="bg-blue-50/60 rounded-lg border border-blue-100 p-3 font-mono text-xs text-blue-900 overflow-x-auto">
                  <span className="font-bold">{step.calcLabel ? `${step.calcLabel}:` : t.common.calculation}</span>{' '}
                  {step.calculation}
                  {step.result && (
                    <span className="block mt-2 text-blue-700 font-black">{step.result}</span>
                  )}
                </div>
              )}

              {!step.calculation && step.result && (
                <div className="bg-blue-50/60 rounded-lg border border-blue-100 p-3 font-mono text-xs text-blue-900 overflow-x-auto">
                  <span className="font-bold">{t.common.result}</span> {step.result}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-bold text-slate-700">{t.common.teachingNote}</span>{' '}
          {t.common.interpolationNote}
        </p>
      </div>
    </motion.div>
  );
};
