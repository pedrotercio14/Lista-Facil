import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORY_ORDER_KEY = 'listaFacil_category_order';

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

export function useShoppingList(userId, listType = 'casa') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHostId, setActiveHostId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const [categoryOrder, setCategoryOrder] = useState(() => {
    const saved = localStorage.getItem(CATEGORY_ORDER_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Checar Compartilhamento Familiar
  const checkFamily = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('user_shares')
      .select('host_id')
      .eq('guest_id', userId)
      .maybeSingle();

    if (data && data.host_id) {
      setActiveHostId(data.host_id);
      setIsGuest(true);
    } else {
      setActiveHostId(userId);
      setIsGuest(false);
    }
  }, [userId]);

  useEffect(() => {
    checkFamily();
  }, [checkFamily]);

  const fetchItems = useCallback(async () => {
    if (!activeHostId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', activeHostId) // Busca usando o dono da família
        .eq('list_type', listType)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens:', error.message);
    } finally {
      setLoading(false);
    }
  }, [activeHostId, listType]);

  useEffect(() => {
    if (!activeHostId) return;
    fetchItems();

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
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.list_type !== listType) return;
            setItems((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeHostId, listType, fetchItems]);

  const addItem = async ({ name, quantity, category }) => {
    if (!activeHostId) return;
    const { data, error } = await supabase
      .from('shopping_items')
      .insert([
        {
          user_id: activeHostId, // Salva para a família
          name: name.trim(),
          quantity: parseInt(quantity, 10) || 1,
          category: category,
          list_type: listType
        }
      ])
      .select('*')
      .single();
      
    if (error) {
      console.error('Erro ao adicionar:', error.message);
      return;
    }

    if (data) {
      setItems((prev) => {
        if (prev.some(i => i.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );

    const { error } = await supabase
      .from('shopping_items')
      .update({ checked: !item.checked })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar:', error.message);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: item.checked } : i))
      );
    }
  };

  const removeItem = async (id) => {
    const itemToRemove = items.find(i => i.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Erro ao deletar:', error.message);
      setItems((prev) => [...prev, itemToRemove]);
    }
  };

  const editItemName = async (id, newName) => {
    if (!newName.trim()) return;
    
    const itemToEdit = items.find(i => i.id === id);
    if (!itemToEdit || itemToEdit.name === newName) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, name: newName.trim() } : i))
    );

    const { error } = await supabase
      .from('shopping_items')
      .update({ name: newName.trim() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao editar:', error.message);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, name: itemToEdit.name } : i))
      );
    }
  };

  const clearAll = async () => {
    const backup = [...items];
    setItems([]);

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', activeHostId)
      .eq('list_type', listType);
      
    if (error) {
      console.error('Erro ao limpar lista:', error.message);
      setItems(backup);
    }
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
    activeHostId
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
