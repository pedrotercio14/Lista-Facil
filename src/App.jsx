import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Header } from './components/Header';
import { AddItemForm } from './components/AddItemForm';
import { ShoppingList } from './components/ShoppingList';
import { ClearAllButton } from './components/ClearAllButton';
import { Auth } from './components/Auth';
import { FamilyShareModal } from './components/FamilyShareModal';
import { useShoppingList, shareList } from './hooks/useShoppingList';
import { useDarkMode } from './hooks/useDarkMode';
import { HiOutlineSparkles, HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineViewGrid, HiOutlineMenu, HiOutlineSortAscending, HiOutlineShare } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { cn } from './lib/utils';

function MainApp({ session }) {
  const [listType, setListType] = useState('casa');
  const [viewMode, setViewMode] = useState('category');
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  const { 
    items, loading, addItem, toggleItem, removeItem, editItemName, clearAll, 
    categories, reorderCategories, itemHistory,
    isGuest, joinFamily, leaveFamily, activeHostId, isOffline
  } = useShoppingList(session.user.id, listType);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const itemsCount = items.length;
  const pendingCount = items.filter(i => !i.checked).length;

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <HiOutlineSparkles className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full max-w-lg mx-auto relative flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-100 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="fixed top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-emerald-500/[0.03] dark:from-emerald-500/[0.02] to-transparent z-0 pointer-events-none" />
      
      <Header 
        itemsCount={itemsCount} 
        pendingCount={pendingCount} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenFamily={() => setIsFamilyModalOpen(true)}
        onLogout={() => supabase.auth.signOut()}
        isOffline={isOffline}
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 relative z-10 scroll-smooth pb-32 pt-4">
        {/* List Switcher */}
        <div className="p-1 bg-gray-100 dark:bg-slate-800/80 rounded-2xl flex relative overflow-hidden shadow-sm">
          {/* Animated Background Pill */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-gray-200/50 dark:border-slate-600/50 z-0"
            animate={{ 
              x: listType === 'casa' ? 4 : 'calc(100% + 4px)',
            }}
          />
          
          <button
            onClick={() => setListType('casa')}
            className={cn(
              "flex-1 relative z-10 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              listType === 'casa' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            )}
          >
            <HiOutlineHome className="w-4 h-4" />
            Minha Casa
          </button>
          
          <button
            onClick={() => setListType('condominio')}
            className={cn(
              "flex-1 relative z-10 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
              listType === 'condominio' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            )}
          >
            <HiOutlineOfficeBuilding className="w-4 h-4" />
            Condomínio
          </button>
        </div>
        
        {/* Adicionar Item (Retornou para o topo da lista!) */}
        <div className="mt-6 mb-8">
          <AddItemForm 
            onAdd={addItem} 
            categories={categories}
            itemHistory={itemHistory}
          />
        </div>

        <div className="space-y-6">
          {itemsCount > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                Sua Lista
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => shareList(items, listType, categories)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1.5 rounded-lg active:scale-95"
                >
                  <HiOutlineShare className="w-4 h-4" />
                  Compartilhar
                </button>
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('category')}
                  aria-label="Ver por categorias"
                  title="Por Categorias"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    viewMode === 'category' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  )}
                >
                  <HiOutlineViewGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('recent')}
                  aria-label="Ver recentes primeiro"
                  title="Lista Simples (Mais Recentes)"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    viewMode === 'recent' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  )}
                >
                  <HiOutlineMenu className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('alphabetical')}
                  aria-label="Ver ordem alfabética"
                  title="Ordem Alfabética"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    viewMode === 'alphabetical' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  )}
                >
                  <HiOutlineSortAscending className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          )}

          <ShoppingList 
            items={items} 
            categories={categories}
            onToggle={toggleItem} 
            onRemove={removeItem}
            onEdit={editItemName}
            onReorder={reorderCategories}
            viewMode={viewMode}
          />
        </div>
      </main>

      <ClearAllButton 
        onClearAll={clearAll} 
        hasItems={itemsCount > 0} 
      />

      <FamilyShareModal 
        isOpen={isFamilyModalOpen} 
        onClose={() => setIsFamilyModalOpen(false)}
        activeHostId={activeHostId}
        isGuest={isGuest}
        joinFamily={joinFamily}
        leaveFamily={leaveFamily}
      />
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isCheckingAuth) {
    return <div className="h-[100dvh] bg-gray-50 dark:bg-slate-950 transition-colors" />;
  }

  if (!session) {
    return <Auth isDarkMode={isDarkMode} />;
  }

  return <MainApp session={session} />;
}

export default App;
