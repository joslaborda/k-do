import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { createBackfillMutation } from '@/lib/autoLinkTickets';

/**
 * Componente para depurar y arreglar vinculación de documentos
 * - Muestra estadísticas de documentos
 * - Detecta documentos sin vinculación
 * - Ejecuta backfill automático
 */
export default function BackfillDebugger({ tripId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backfillDone, setBackfillDone] = useState(false);
  const [error, setError] = useState(null);

  const analyzeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tickets, itineraryDays, cities] = await Promise.all([
        base44.entities.Ticket.filter({ trip_id: tripId }),
        base44.entities.ItineraryDay.filter({ trip_id: tripId }),
        base44.entities.City.filter({ trip_id: tripId }),
      ]);

      const withCityId = tickets.filter(t => t.city_id).length;
      const withItineraryDayId = tickets.filter(t => t.itinerary_day_id).length;
      const withBoth = tickets.filter(t => t.city_id && t.itinerary_day_id).length;
      const withoutAny = tickets.filter(t => !t.city_id && !t.itinerary_day_id).length;
      const withDate = tickets.filter(t => t.date).length;

      setStats({
        totalTickets: tickets.length,
        withCityId,
        withItineraryDayId,
        withBoth,
        withoutAny,
        withDate,
        itineraryDaysCount: itineraryDays.length,
        citiesCount: cities.length,
        tickets,
        itineraryDays,
        cities,
      });

      console.log('📊 STATISTICS:', {
        total: tickets.length,
        withCityId,
        withItineraryDayId,
        withBoth,
        withoutAny,
        withDate,
      });

      // Log sample tickets
      console.log('📋 SAMPLE TICKETS:');
      tickets.slice(0, 3).forEach(t => {
        console.log(`  - ${t.name}: date=${t.date}, city_id=${t.city_id || 'NULL'}, itinerary_day_id=${t.itinerary_day_id || 'NULL'}`);
      });
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBackfill = async () => {
    if (!stats) return;
    setLoading(true);
    setError(null);

    try {
      const mutations = createBackfillMutation(stats.tickets, stats.itineraryDays, stats.cities);

      console.log(`🔄 Running backfill for ${mutations.length} tickets...`);

      let updated = 0;
      for (const { ticketId, updates } of mutations) {
        if (Object.keys(updates).length > 0) {
          await base44.entities.Ticket.update(ticketId, updates);
          updated++;
        }
      }

      console.log(`✅ Backfill complete: ${updated} tickets updated`);
      setBackfillDone(true);
      setStats(null); // Reset para re-analizar
    } catch (err) {
      setError(err.message);
      console.error('Error running backfill:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Database className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Debug: Vinculación de Documentos</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Analiza si los documentos tienen city_id e itinerary_day_id correctamente asignados
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {backfillDone && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-green-700">✅ Backfill completado. Reanaliza para ver cambios.</span>
        </div>
      )}

      {!stats ? (
        <Button
          onClick={analyzeData}
          disabled={loading}
          variant="outline"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          {loading ? 'Analizando...' : 'Analizar Vinculación'}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Total documentos</p>
              <p className="font-bold text-lg text-foreground">{stats.totalTickets}</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Con city_id</p>
              <p className="font-bold text-lg text-orange-600">{stats.withCityId}</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Con itinerary_day_id</p>
              <p className="font-bold text-lg text-orange-600">{stats.withItineraryDayId}</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Con ambos</p>
              <p className="font-bold text-lg text-green-600">{stats.withBoth}</p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Sin vinculación</p>
              <p className={`font-bold text-lg ${stats.withoutAny > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.withoutAny}
              </p>
            </div>
            <div className="p-2 bg-secondary rounded-lg">
              <p className="text-muted-foreground text-xs">Con fecha</p>
              <p className="font-bold text-lg text-blue-600">{stats.withDate}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={analyzeData}
              disabled={loading}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 flex-1"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reanalizar
            </Button>
            {stats.withoutAny > 0 && (
              <Button
                onClick={runBackfill}
                disabled={loading}
                className="bg-orange-700 hover:bg-orange-800 flex-1"
              >
                Arreglar {stats.withoutAny}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <p>ℹ️ Abre la consola del navegador (F12) para ver logs detallados de la vinculación.</p>
          </div>
        </div>
      )}
    </div>
  );
}