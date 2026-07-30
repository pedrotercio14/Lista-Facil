import { useState } from 'react';
import { HiOutlineUserGroup, HiOutlineX, HiOutlineClipboardCopy, HiOutlineLogout } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export function FamilyShareModal({ isOpen, onClose, activeHostId, isGuest, joinFamily, leaveFamily }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeHostId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');
    
    const { error: joinError } = await joinFamily(inviteCode.trim());
    if (joinError) {
      setError('Código inválido ou erro ao conectar.');
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    await leaveFamily();
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <HiOutlineUserGroup className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
              Compartilhamento Familiar
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-2 leading-relaxed">
              Conecte contas diferentes para todos verem a mesma lista ao vivo.
            </p>
          </div>

          {isGuest ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
                Você está conectado à lista de outra pessoa.
              </p>
              <button 
                onClick={handleLeave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-red-600 font-bold py-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Sair da Família
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Seu Código de Convite
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly
                    value={activeHostId || ''} 
                    className="flex-1 bg-white dark:bg-slate-900 text-sm font-mono text-gray-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none"
                  />
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                    title="Copiar código"
                  >
                    {copied ? <HiCheck className="w-5 h-5" /> : <HiOutlineClipboardCopy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-gray-400 uppercase">Ou</span>
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Entrar em uma família
                </p>
                <input 
                  type="text" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Cole o código do convite aqui..." 
                  className="w-full bg-gray-50 dark:bg-slate-800/80 text-sm text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {error && <p className="text-xs text-red-500 font-semibold px-1">{error}</p>}
                
                <button 
                  type="submit"
                  disabled={loading || !inviteCode.trim()}
                  className="w-full bg-gray-900 dark:bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Conectando...' : 'Entrar na Lista'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Dummy check icon since it's not imported at the top
function HiCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
