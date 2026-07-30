import { useState } from 'react';
import { ShoppingItem } from './ShoppingItem';
import { HiOutlineSparkles, HiOutlineMenuAlt4, HiChevronDown } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCategoryIcon } from '../hooks/useShoppingList';
import { cn } from '../lib/utils';
import { ProgressRing } from './ProgressRing';

export function ShoppingList({ items, categories, onToggle, onRemove, onEdit, onReorder, viewMode = 'category' }) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-5 shadow-inner shadow-emerald-500/10">
          <HiOutlineSparkles className="w-10 h-10 text-emerald-400 dark:text-emerald-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Sua lista está vazia!</h3>
        <p className="text-gray-400 dark:text-slate-500 text-sm max-w-[240px] leading-relaxed">
          Vamos planejar suas compras? Comece a adicionar itens pelo campo acima. 👆
        </p>
      </motion.div>
    );
  }

  // Lógica para listas planas (recent ou alphabetical)
  if (viewMode === 'recent' || viewMode === 'alphabetical') {
    const flatItems = [...items].sort((a, b) => {
      // Sempre colocar marcados por último
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      
      // Desempate
      if (viewMode === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return a.name.localeCompare(b.name, 'pt-BR');
      }
    });

    return (
      <div className="space-y-3 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
          <div className="flex flex-col gap-3">
            <AnimatePresence mode='popLayout'>
              {flatItems.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Lógica Original para Categorias (Drag and Drop)
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const activeCategories = categories.filter(cat => groupedItems[cat]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newCategories = Array.from(categories);
    const draggedCat = activeCategories[sourceIndex];
    const targetCat = activeCategories[destinationIndex];
    
    const absoluteSourceIdx = newCategories.indexOf(draggedCat);
    const absoluteTargetIdx = newCategories.indexOf(targetCat);

    newCategories.splice(absoluteSourceIdx, 1);
    newCategories.splice(absoluteTargetIdx, 0, draggedCat);

    onReorder(newCategories);
  };

  const toggleCollapse = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="categories-list">
        {(provided) => (
          <div 
            className="space-y-6 pb-12"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {activeCategories.map((category, index) => {
              const allItems = groupedItems[category];
              const checkedCount = allItems.filter(i => i.checked).length;
              const totalCount = allItems.length;
              const isAllDone = checkedCount === totalCount;
              const isCollapsed = collapsedCategories[category];

              const categoryItems = allItems.sort((a, b) => {
                if (a.checked === b.checked) {
                  return new Date(b.created_at) - new Date(a.created_at);
                }
                return a.checked ? 1 : -1;
              });

              return (
                <Draggable key={category} draggableId={category} index={index}>
                  {(provided, snapshot) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        ...(snapshot.isDragging && {
                           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                           zIndex: 50
                        })
                      }}
                      className={cn(
                        "bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300",
                        snapshot.isDragging && "ring-2 ring-emerald-500",
                        isAllDone && "opacity-80"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            {...provided.dragHandleProps} 
                            aria-label={`Reordenar categoria ${category}`}
                            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 -ml-1"
                          >
                            <HiOutlineMenuAlt4 className="w-5 h-5" />
                          </div>
                          
                          <button 
                            onClick={() => toggleCollapse(category)}
                            aria-expanded={!isCollapsed}
                            aria-label={`Alternar itens da categoria ${category}`}
                            className="flex items-center gap-2 group outline-none"
                          >
                            <span className="text-lg" role="img" aria-label="Icon">
                              {getCategoryIcon(category)}
                            </span>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 tracking-wide">
                              {category}
                            </h3>
                            <div className="ml-2">
                              <ProgressRing 
                                radius={10} 
                                stroke={2} 
                                progress={totalCount === 0 ? 0 : (checkedCount / totalCount) * 100} 
                                isDone={isAllDone} 
                              />
                            </div>
                            <HiChevronDown 
                              className={cn(
                                "w-4 h-4 text-gray-400 transition-transform duration-300",
                                isCollapsed && "-rotate-90"
                              )} 
                            />
                          </button>
                        </div>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-slate-800/50 mt-3">
                              <AnimatePresence mode='popLayout'>
                                {categoryItems.map((item) => (
                                  <ShoppingItem
                                    key={item.id}
                                    item={item}
                                    onToggle={onToggle}
                                    onRemove={onRemove}
                                    onEdit={onEdit}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
