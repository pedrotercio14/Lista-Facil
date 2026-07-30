import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORY_ORDER_KEY = 'listaFacil_category_order';
const QUEUE_KEY = 'listaFacil_offlineQueue';

const DEFAULT_CATEGORIES = [
  'Hortifruti', 
  'Açougue', 
  'Laticínios', 
  'Limpeza', 
  'Bebidas', 
  'Mercearia', 
  'Padaria',
  'Outros'
];

export const CATEGORY_ICONS = {
  'Hortifruti': '🍎',
  'Açougue': '🥩',
  'Laticínios': '🧀',
  'Limpeza': '🧼',
  'Bebidas': '🥤',
  'Mercearia': '🥫',
  'Padaria': '🥐',
  'Outros': '🛒'
};

export const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || '🛒';
};

// Gerenciador de Fila Offline
let isProcessingQueue = false;

const addToQueue = (operation) => {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  q.push(operation);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  processQueue(); // Tenta processar imediatamente
};

export const processQueue = async () => {
  if (!navigator.onLine || isProcessingQueue) return;
  isProcessingQueue = true;
  
  try {
    let q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    while (q.length > 0) {
      const op = q[0];
      let error = null;
      
      try {
        if (op.type === 'INSERT') {
          const { error: err } = await supabase.from('shopping_items').insert([op.payload]);
          error = err;
        } else if (op.type === 'UPDATE') {
          const { error: err } = await supabase.from('shopping_items').update(op.payload).eq('id', op.id);
          error = err;
        } else if (op.type === 'DELETE') {
          const { error: err } = await supabase.from('shopping_items').delete().eq('id', op.id);
          error = err;
        } else if (op.type === 'CLEAR_ALL') {
          const { error: err } = await supabase.from('shopping_items').delete().eq('user_id', op.hostId).eq('list_type', op.listType);
          error = err;
        }
      } catch (e) {
        error = e;
      }

      // Se for erro de rede (Failed to fetch), aborta o processamento para tentar depois
      if (error && (error.message === 'Failed to fetch' || String(error).includes('fetch'))) {
        break; 
      }
      
      if (error) {
        console.error("Erro ao sincronizar item offline (descartando operação):", error);
      }

      // Remove a operação processada com sucesso (ou com erro fatal não-rede)
      q.shift();
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    }
  } finally {
    isProcessingQueue = false;
  }
};

// Iniciar processamento se ficar online
window.addEventListener('online', processQueue);


export function useShoppingList(userId, listType = 'casa') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHostId, setActiveHostId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [categoryOrder, setCategoryOrder] = useState(() => {
    const saved = localStorage.getItem(CATEGORY_ORDER_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Detector de Online/Offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper para salvar items na tela e no cache local
  const updateItems = useCallback((newItems) => {
    setItems(newItems);
    if (activeHostId) {
      localStorage.setItem(`listaFacil_cache_${listType}_${activeHostId}`, JSON.stringify(newItems));
    }
  }, [activeHostId, listType]);

  const loadCache = useCallback(() => {
    if (!activeHostId) return;
    const cached = localStorage.getItem(`listaFacil_cache_${listType}_${activeHostId}`);
    if (cached) {
      setItems(JSON.parse(cached));
    }
  }, [activeHostId, listType]);

  // Checar Compartilhamento Familiar
  const checkFamily = useCallback(async () => {
    if (!userId) return;
    
    // Se estiver offline no momento do login, assume que é ele mesmo (ou podemos cachear o family state também)
    if (!navigator.onLine) {
      const cachedHost = localStorage.getItem('listaFacil_lastHostId') || userId;
      const cachedIsGuest = localStorage.getItem('listaFacil_lastIsGuest') === 'true';
      setActiveHostId(cachedHost);
      setIsGuest(cachedIsGuest);
      return;
    }

    const { data, error } = await supabase
      .from('user_shares')
      .select('host_id')
      .eq('guest_id', userId)
      .maybeSingle();

    if (data && data.host_id) {
      setActiveHostId(data.host_id);
      setIsGuest(true);
      localStorage.setItem('listaFacil_lastHostId', data.host_id);
      localStorage.setItem('listaFacil_lastIsGuest', 'true');
    } else {
      setActiveHostId(userId);
      setIsGuest(false);
      localStorage.setItem('listaFacil_lastHostId', userId);
      localStorage.setItem('listaFacil_lastIsGuest', 'false');
    }
  }, [userId]);

  useEffect(() => {
    checkFamily();
  }, [checkFamily]);

  const fetchItems = useCallback(async () => {
    if (!activeHostId) return;
    
    // Carrega do cache imediatamente para leitura offline instantânea
    loadCache();
    
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', activeHostId)
        .eq('list_type', listType)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (data) updateItems(data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error.message);
    } finally {
      setLoading(false);
    }
  }, [activeHostId, listType, loadCache, updateItems]);

  useEffect(() => {
    if (!activeHostId) return;
    fetchItems();

    if (navigator.onLine) {
      const channel = supabase
        .channel(`schema-db-changes-${listType}-${activeHostId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shopping_items',
            filter: `user_id=eq.${activeHostId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              if (payload.new.list_type !== listType) return;
              setItems((prev) => {
                if (prev.some(i => i.id === payload.new.id)) return prev;
                const next = [...prev, payload.new];
                localStorage.setItem(`listaFacil_cache_${listType}_${activeHostId}`, JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'DELETE') {
              setItems((prev) => {
                const next = prev.filter((item) => item.id !== payload.old.id);
                localStorage.setItem(`listaFacil_cache_${listType}_${activeHostId}`, JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'UPDATE') {
              if (payload.new.list_type !== listType) return;
              setItems((prev) => {
                const next = prev.map((item) => (item.id === payload.new.id ? payload.new : item));
                localStorage.setItem(`listaFacil_cache_${listType}_${activeHostId}`, JSON.stringify(next));
                return next;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeHostId, listType, fetchItems]);

  const addItem = async ({ name, quantity, category }) => {
    if (!activeHostId) return;
    
    // Geração de ID Client-Side para suportar Offline-First
    const newId = crypto.randomUUID();
    
    const newItem = {
      id: newId,
      user_id: activeHostId,
      name: name.trim(),
      quantity: parseInt(quantity, 10) || 1,
      category: category,
      list_type: listType,
      checked: false,
      created_at: new Date().toISOString()
    };

    // 1. Atualiza a tela imediatamente (Optimistic UI)
    updateItems([...items, newItem]);

    // 2. Enfileira a operação para o Supabase
    addToQueue({
      type: 'INSERT',
      payload: newItem
    });
  };

  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // 1. Atualiza tela
    updateItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

    // 2. Enfileira operação
    addToQueue({
      type: 'UPDATE',
      id: id,
      payload: { checked: !item.checked }
    });
  };

  const removeItem = async (id) => {
    // 1. Atualiza tela
    updateItems(items.filter((item) => item.id !== id));

    // 2. Enfileira operação
    addToQueue({
      type: 'DELETE',
      id: id
    });
  };

  const editItemName = async (id, newName) => {
    if (!newName.trim()) return;
    const itemToEdit = items.find(i => i.id === id);
    if (!itemToEdit || itemToEdit.name === newName) return;

    // 1. Atualiza tela
    updateItems(items.map((i) => (i.id === id ? { ...i, name: newName.trim() } : i)));

    // 2. Enfileira operação
    addToQueue({
      type: 'UPDATE',
      id: id,
      payload: { name: newName.trim() }
    });
  };

  const clearAll = async () => {
    // 1. Limpa tela
    updateItems([]);

    // 2. Enfileira operação de limpeza em massa
    addToQueue({
      type: 'CLEAR_ALL',
      hostId: activeHostId,
      listType: listType
    });
  };

  const reorderCategories = (newOrder) => {
    setCategoryOrder(newOrder);
  };

  const itemHistory = useMemo(() => {
    const history = {};
    [...items].reverse().forEach(item => {
      const lowerName = item.name.toLowerCase();
      if (!history[lowerName]) {
        history[lowerName] = item.category;
      }
    });
    return history;
  }, [items]);

  // Family Functions
  const joinFamily = async (hostId) => {
    if (!hostId || hostId === userId) return { error: 'Código inválido.' };
    const { error } = await supabase
      .from('user_shares')
      .insert([{ guest_id: userId, host_id: hostId }]);
    
    if (error) return { error: error.message };
    await checkFamily();
    return { success: true };
  };

  const leaveFamily = async () => {
    const { error } = await supabase
      .from('user_shares')
      .delete()
      .eq('guest_id', userId);
    
    if (error) return { error: error.message };
    await checkFamily();
    return { success: true };
  };

  return {
    items,
    loading: loading || !activeHostId,
    addItem,
    toggleItem,
    removeItem,
    editItemName,
    clearAll,
    categories: categoryOrder,
    reorderCategories,
    itemHistory,
    isGuest,
    joinFamily,
    leaveFamily,
    activeHostId,
    isOffline // Exposto para a UI
  };
}

export const shareList = async (items, listType, categories) => {
  if (!items || items.length === 0) {
    alert('Sua lista está vazia!');
    return;
  }

  const title = `🛒 Lista de Compras: ${listType === 'casa' ? 'Minha Casa' : 'Condomínio'}`;
  
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  let text = `*${title}*\n\n`;

  const activeCategories = categories.filter(cat => groupedItems[cat]);

  activeCategories.forEach((category) => {
    text += `${getCategoryIcon(category)} *${category}*\n`;
    const catItems = groupedItems[category];
    
    catItems.sort((a, b) => {
      if (a.checked === b.checked) return 0;
      return a.checked ? 1 : -1;
    });

    catItems.forEach(item => {
      const check = item.checked ? '[x]' : '[ ]';
      const qtd = item.quantity > 1 ? `${item.quantity}x ` : '';
      const name = item.checked ? `~${item.name}~` : item.name;
      text += `${check} ${qtd}${name}\n`;
    });
    
    text += '\n';
  });

  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Lista copiada para a área de transferência!');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Erro ao compartilhar:', error);
    }
  }
};
