import { useState, useEffect, useRef } from 'react';
import { HiOutlinePlus } from 'react-icons/hi';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryIcon } from '../hooks/useShoppingList';

export function AddItemForm({ onAdd, categories, itemHistory }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState(categories[0]);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Autocomplete logic
  useEffect(() => {
    if (name.trim().length > 1) {
      const lowerName = name.toLowerCase();
      const matches = Object.keys(itemHistory)
        .filter(item => item.includes(lowerName))
        .slice(0, 3);
      setSuggestions(matches);
      
      if (itemHistory[lowerName] && categories.includes(itemHistory[lowerName])) {
        setCategory(itemHistory[lowerName]);
      }
    } else {
      setSuggestions([]);
    }
  }, [name, itemHistory, categories]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (navigator.vibrate) navigator.vibrate(30);
    
    onAdd({ name, quantity, category });
    setName('');
    setQuantity(1);
    setSuggestions([]);
  };

  const handleSelectSuggestion = (suggestion) => {
    setName(suggestion);
    if (itemHistory[suggestion] && categories.includes(itemHistory[suggestion])) {
      setCategory(itemHistory[suggestion]);
    }
    setSuggestions([]);
  };

  // Helper para rolar horizontalmente com a roda do mouse (desktop)
  const handleWheel = (e) => {
    const container = e.currentTarget;
    if (e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className={cn(
        "flex flex-col gap-4 p-5 rounded-3xl transition-all duration-300 relative z-20",
        "bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
        isFocused ? "shadow-[0_8px_30px_rgb(5,150,105,0.08)] dark:shadow-[0_8px_30px_rgb(5,150,105,0.15)] ring-1 ring-emerald-100 dark:ring-emerald-900/50" : ""
      )}
      ref={wrapperRef}
    >
      <div className="flex gap-3 items-center relative">
        <div className="flex-1 flex flex-col justify-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder="Adicionar novo item..."
            aria-label="Nome do item"
            className="w-full bg-transparent border-none p-0 text-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-300 dark:placeholder:text-slate-600 focus:ring-0 outline-none font-medium"
            required
            autoComplete="off"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50/80 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-gray-100/50 dark:border-slate-700/50">
          <button 
            type="button" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Diminuir quantidade"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold text-gray-700 dark:text-slate-300 text-sm">{quantity}</span>
          <button 
            type="button" 
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Aumentar quantidade"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors"
          >
            +
          </button>
        </div>

        <AnimatePresence>
          {suggestions.length > 0 && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-30"
            >
              {suggestions.map((suggestion) => {
                const suggCat = itemHistory[suggestion];
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors capitalize first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                  >
                    {suggestion}
                    <span className="text-xs text-gray-400 dark:text-slate-500 float-right mt-1 flex items-center gap-1">
                      <span>{getCategoryIcon(suggCat)}</span>
                      {suggCat}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-50/50 dark:border-slate-800/50">
        
        {/* Usando flex-wrap para que as categorias quebrem em duas linhas caso necessário em telas menores ou desktops */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center gap-1.5",
                  category === cat 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                    : "bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <span>{getCategoryIcon(cat)}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!name.trim()}
          aria-label="Adicionar item"
          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-300 dark:disabled:text-slate-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-600/25 disabled:shadow-none active:scale-90 self-end"
        >
          <HiOutlinePlus className="w-6 h-6" />
        </button>
      </div>
    </motion.form>
  );
}
