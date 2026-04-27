/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home as HomeIcon, BookOpen, Calculator, Info, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Problem1 from './pages/Problem1';
import Problem2 from './pages/Problem2';
import Problem3 from './pages/Problem3';
import Problem4 from './pages/Problem4';
import Problem5 from './pages/Problem5';
import Problem6 from './pages/Problem6';
import Problem7 from './pages/Problem7';

type Page = 'home' | 'resources' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onStart={() => setCurrentPage('resources')} />;
      case 'resources': return <Resources />;
      case 'p1': return <Problem1 />;
      case 'p2': return <Problem2 />;
      case 'p3': return <Problem3 />;
      case 'p4': return <Problem4 />;
      case 'p5': return <Problem5 />;
      case 'p6': return <Problem6 />;
      case 'p7': return <Problem7 />;
      default: return <Home onStart={() => setCurrentPage('resources')} />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Inicio', icon: HomeIcon, category: 'General' },
    { id: 'resources', label: 'Material Complementario', icon: BookOpen, category: 'General' },
    { id: 'p1', label: 'Problema 1: Sección Circular', icon: Calculator, category: 'Ejercicios' },
    { id: 'p2', label: 'Problema 2: Colector Urbano', icon: Calculator, category: 'Ejercicios' },
    { id: 'p3', label: 'Problema 3: Sección Ovoide', icon: Calculator, category: 'Ejercicios' },
    { id: 'p4', label: 'Problema 4: Galería', icon: Calculator, category: 'Ejercicios' },
    { id: 'p5', label: 'Problema 5: Vertedero', icon: Calculator, category: 'Ejercicios' },
    { id: 'p6', label: 'Problema 6: Colector Unitario', icon: Calculator, category: 'Ejercicios' },
    { id: 'p7', label: 'Problema 7: Dimensionamiento Zonal', icon: Calculator, category: 'Ejercicios' },
  ];

  const currentLabel = navItems.find(n => n.id === currentPage)?.label || '';

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50 w-full">
        <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">
          Ingeniería<br/><span className="text-blue-400">Sanitaria</span>
        </h1>
        <button id="menu-toggle" onClick={() => setIsSidebarOpen(true)} className="text-slate-400">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex w-full h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed inset-0 z-50 md:relative md:flex md:w-72 flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">
              Ingeniería<br/><span className="text-blue-400">Sanitaria</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest">DISEÑO DE COLECTORES</p>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">General</div>
            <div className="space-y-1 mb-6">
              {navItems.filter(i => i.category === 'General').map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-6 py-3 text-sm transition-all
                    ${currentPage === item.id 
                      ? 'text-white bg-blue-600/20 border-r-4 border-blue-500 font-medium' 
                      : 'text-slate-400 hover:text-white'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Ejercicios Prácticos</div>
            <div className="space-y-1">
              {navItems.filter(i => i.category === 'Ejercicios').map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-6 py-2 text-[13px] transition-all
                    ${currentPage === item.id 
                      ? 'text-white bg-blue-600/20 border-r-4 border-blue-500 font-medium' 
                      : 'text-slate-400 hover:text-white'}
                  `}
                >
                  <ChevronRight className={`w-3 h-3 ${currentPage === item.id ? 'text-blue-400' : 'text-slate-600'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-6 bg-slate-800/10 mt-auto border-t border-slate-800/50">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Software Técnico</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span>Módulos</span>
              <span>/</span>
              <span className="text-slate-900 font-bold uppercase tracking-wide">{currentLabel}</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors uppercase tracking-wider">
                Ver Manual
              </button>
              <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors uppercase tracking-wider">
                Guardar
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <div className="max-w-6xl mx-auto">
                  {renderPage()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
