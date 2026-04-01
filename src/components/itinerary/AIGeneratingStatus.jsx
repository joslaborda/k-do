import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  'Creando tu viaje inteligente... ✨',
  'Organizando por zonas para optimizar tu tiempo... 🗺️',
  'Seleccionando las mejores experiencias... 🎌',
  'Evitando desplazamientos innecesarios... 🚇',
  'Incorporando tus preferencias... 💫',
  'Casi listo...',
];

export default function AIGeneratingStatus({ step = 0, cityName }) {
  const message = MESSAGES[Math.min(step, MESSAGES.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>

      {cityName && (
        <p className="text-sm text-muted-foreground mb-1">Trabajando en {cityName}...</p>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="text-base font-medium text-foreground"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-orange-500' : 'bg-orange-100'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}