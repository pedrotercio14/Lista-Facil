import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[320px] p-6 shadow-2xl dark:shadow-emerald-900/10 border border-gray-100 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 text-center">{title}</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8 text-center text-sm leading-relaxed">{message}</p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Sim, limpar tudo
              </button>
              <button
                onClick={onCancel}
                className="w-full py-3.5 text-sm font-bold text-gray-600 dark:text-slate-400 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
