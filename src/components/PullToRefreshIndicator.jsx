import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ isPulling, pullDistance }) {
  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = (pullDistance / 80) * 360;

  return (
    <AnimatePresence>
      {pullDistance > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-stone-800 rounded-full p-3 shadow-lg border border-stone-200 dark:border-stone-700"
        >
          <RefreshCw
            className={`w-6 h-6 ${isPulling ? 'text-red-600' : 'text-stone-400'}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}