import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

export function ClearAllButton({ onClearAll, hasItems }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirm = () => {
    onClearAll();
    setIsDialogOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {hasItems && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none"
          >
            <button
              onClick={() => setIsDialogOpen(true)}
              className="pointer-events-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-white/40 dark:border-slate-800/40 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-95"
            >
              Limpar Lista
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Limpar tudo?"
        message="Isso removerá todos os itens da sua lista permanentemente."
        onConfirm={handleConfirm}
        onCancel={() => setIsDialogOpen(false)}
      />
    </>
  );
}
