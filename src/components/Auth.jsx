import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export function Auth({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Conta criada! Você já pode entrar.' });
        setIsLogin(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-emerald-100 dark:selection:bg-emerald-900/50">
      <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-emerald-500/10 dark:from-emerald-500/5 to-transparent -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <HiOutlineSparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Lista<span className="font-light text-emerald-600 dark:text-emerald-400">Fácil</span></h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Sua lista de compras na nuvem</p>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 rounded-xl text-sm font-medium text-center ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineMail className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              placeholder="Seu e-mail"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineLockClosed className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/25 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 mt-6"
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
