import { useState, useRef, useEffect } from 'react';
import { HiOutlineTrash, HiCheck, HiOutlinePencil } from 'react-icons/hi';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function ShoppingItem({ item, onToggle, onRemove, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    if (isEditing) return;
    if (navigator.vibrate) navigator.vibrate(20);
    onToggle(item.id);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editValue.trim() !== item.name) {
      if (navigator.vibrate) navigator.vibrate(20);
      onEdit(item.id, editValue);
    } else {
      setEditValue(item.name); // revert if empty
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(item.name);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(50);
    onRemove(item.id);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -100, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01 }}
      className="relative group rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-gray-100/50 dark:border-slate-800/50"
    >
      <div className="relative z-10 flex items-center gap-2 p-3 w-full">
        <div 
          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
          onClick={handleToggle}
          role="checkbox"
          aria-checked={item.checked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleToggle();
            }
          }}
          aria-label={`Marcar ${item.name}`}
        >
          <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <div className={cn(
              "absolute inset-0 rounded-full border-2 transition-all duration-300",
              item.checked 
                ? "border-emerald-500 bg-emerald-500 scale-110" 
                : "border-gray-300 dark:border-slate-600 group-hover:border-emerald-400 group-hover:dark:border-emerald-500"
            )} />
            
            <HiCheck 
              className={cn(
                "relative z-10 w-4 h-4 text-white transition-all duration-300",
                item.checked ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )} 
            />
          </div>
          
          <div className="flex-1 min-w-0" onClick={(e) => {
            if (isEditing) e.stopPropagation();
          }}>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b-2 border-emerald-500 focus:outline-none text-[15px] font-medium text-gray-900 dark:text-white py-0.5"
              />
            ) : (
              <p className={cn(
                "font-medium truncate transition-all duration-300 text-[15px]",
                item.checked ? "text-gray-400 dark:text-slate-500 line-through" : "text-gray-700 dark:text-slate-200"
              )}>
                {item.name}
              </p>
            )}
          </div>
          
          {item.quantity > 1 && !isEditing && (
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 transition-colors",
              item.checked 
                ? "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400" 
                : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            )}>
              x{item.quantity}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-2 text-gray-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Editar item"
          >
            {isEditing ? <HiCheck className="w-4 h-4" /> : <HiOutlinePencil className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Excluir item"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
