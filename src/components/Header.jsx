import { HiOutlineSparkles, HiOutlineMoon, HiOutlineSun, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineUserGroup } from 'react-icons/hi';
import { cn } from '../lib/utils';
import { ProgressRing } from './ProgressRing';

export function Header({ itemsCount, pendingCount, isDarkMode, toggleDarkMode, onLogout, onOpenFamily }) {
  const isAllDone = itemsCount > 0 && pendingCount === 0;
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const progress = itemsCount === 0 ? 0 : ((itemsCount - pendingCount) / itemsCount) * 100;

  return (
    <header className="flex flex-col gap-3 py-3 px-4 sm:px-6 sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 mix-blend-overlay"></div>
            <HiOutlineShoppingBag className="w-4 h-4 text-white relative z-10" />
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            Lista<span className="text-emerald-600 dark:text-emerald-400 font-light">Fácil</span>
            {isAllDone && (
              <HiOutlineSparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            )}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {itemsCount > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-none whitespace-nowrap">
                  {isAllDone ? 'Tudo Pronto!' : `${itemsCount - pendingCount} de ${itemsCount}`}
                </span>
                <span className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                  {isAllDone ? 'Compras Feitas' : 'Itens'}
                </span>
              </div>
              <ProgressRing radius={18} stroke={3.5} progress={progress} isDone={isAllDone} />
            </div>
          )}

          <button
            onClick={onOpenFamily}
            className="p-2 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 shrink-0"
            aria-label="Minha Família"
            title="Compartilhamento Familiar"
          >
            <HiOutlineUserGroup className="w-5 h-5" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-400 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all active:scale-95 shrink-0"
            aria-label="Alternar Modo Escuro"
          >
            {isDarkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={onLogout}
            className="p-2 rounded-full text-gray-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 shrink-0"
            aria-label="Sair da Conta"
          >
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-1">
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500 transition-colors truncate">
          {greeting}! • {dateStr}
        </p>
      </div>
    </header>
  );
}
