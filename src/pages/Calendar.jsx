import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Calendar() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200 dark:bg-stone-900/80">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Documentos ✈️</h1>
              <p className="text-stone-600">Vuelos, trenes, hoteles y más</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        {/* Redirect to Tickets page */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-stone-800 dark:to-stone-800 border-2 border-blue-200 dark:border-stone-700 rounded-3xl p-12 text-center">
          <Plane className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">
            Gestiona tus documentos
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
            Guarda y organiza tus vuelos, reservas de hotel, billetes de tren y más
          </p>
          <Link to={createPageUrl('Tickets')}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plane className="w-4 h-4 mr-2" />
              Ir a Documentos
            </Button>
          </Link>
        </div>


      </div>
    </div>
  );
}