import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function MigrateData() {
  const [status, setStatus] = useState('ready');
  const [log, setLog] = useState([]);
  const navigate = useNavigate();

  const addLog = (message) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const migrateData = async () => {
    setStatus('migrating');
    addLog('Iniciando migración...');

    try {
      // 1. Create default trip for existing data
      addLog('Creando viaje por defecto para datos existentes...');
      const defaultTrip = await base44.entities.Trip.create({
        name: 'Japón 2025',
        destination: 'Tokio',
        country: 'Japón',
        start_date: '2025-04-01',
        end_date: '2025-04-15',
        description: 'Mi viaje a Japón',
        currency: 'JPY',
      });
      addLog(`✓ Viaje creado con ID: ${defaultTrip.id}`);

      const user = await base44.auth.me();
      const tripId = defaultTrip.id;
      const userId = user.id;

      // 2. Migrate Cities
      addLog('Migrando ciudades...');
      const cities = await base44.entities.City.list();
      for (const city of cities) {
        if (!city.trip_id) {
          await base44.entities.City.update(city.id, { ...city, trip_id: tripId });
        }
      }
      addLog(`✓ ${cities.length} ciudades migradas`);

      // 3. Migrate PackingItems
      addLog('Migrando items de equipaje...');
      const packingItems = await base44.entities.PackingItem.list();
      for (const item of packingItems) {
        if (!item.trip_id) {
          await base44.entities.PackingItem.update(item.id, { ...item, trip_id: tripId, user_id: userId });
        }
      }
      addLog(`✓ ${packingItems.length} items de equipaje migrados`);

      // 4. Migrate Tickets
      addLog('Migrando documentos...');
      const tickets = await base44.entities.Ticket.list();
      for (const ticket of tickets) {
        if (!ticket.trip_id) {
          await base44.entities.Ticket.update(ticket.id, { ...ticket, trip_id: tripId, user_id: userId });
        }
      }
      addLog(`✓ ${tickets.length} documentos migrados`);

      // 5. Migrate Expenses
      addLog('Migrando gastos...');
      const expenses = await base44.entities.Expense.list();
      for (const expense of expenses) {
        if (!expense.trip_id) {
          await base44.entities.Expense.update(expense.id, { ...expense, trip_id: tripId });
        }
      }
      addLog(`✓ ${expenses.length} gastos migrados`);

      // 6. Migrate DiaryEntries
      addLog('Migrando entradas de diario...');
      const diaryEntries = await base44.entities.DiaryEntry.list();
      for (const entry of diaryEntries) {
        if (!entry.trip_id) {
          await base44.entities.DiaryEntry.update(entry.id, { ...entry, trip_id: tripId, type: 'personal' });
        }
      }
      addLog(`✓ ${diaryEntries.length} entradas de diario migradas`);

      // 7. Migrate ItineraryDays
      addLog('Migrando días de itinerario...');
      const itineraryDays = await base44.entities.ItineraryDay.list();
      for (const day of itineraryDays) {
        if (!day.trip_id) {
          await base44.entities.ItineraryDay.update(day.id, { ...day, trip_id: tripId });
        }
      }
      addLog(`✓ ${itineraryDays.length} días de itinerario migrados`);

      // 8. Migrate Restaurants
      addLog('Migrando restaurantes...');
      const restaurants = await base44.entities.Restaurant.list();
      for (const restaurant of restaurants) {
        if (!restaurant.trip_id) {
          await base44.entities.Restaurant.update(restaurant.id, { ...restaurant, trip_id: tripId });
        }
      }
      addLog(`✓ ${restaurants.length} restaurantes migrados`);

      // 9. Migrate UsefulInfo
      addLog('Migrando información útil...');
      const usefulInfos = await base44.entities.UsefulInfo.list();
      for (const info of usefulInfos) {
        if (!info.trip_id) {
          await base44.entities.UsefulInfo.update(info.id, { ...info, trip_id: tripId });
        }
      }
      addLog(`✓ ${usefulInfos.length} info útiles migradas`);

      // 10. Migrate TodoItems
      addLog('Migrando tareas...');
      const todoItems = await base44.entities.TodoItem.list();
      for (const todo of todoItems) {
        if (!todo.trip_id) {
          await base44.entities.TodoItem.update(todo.id, { ...todo, trip_id: tripId });
        }
      }
      addLog(`✓ ${todoItems.length} tareas migradas`);

      addLog('✅ Migración completada exitosamente!');
      setStatus('success');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass border-2 border-border rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">🔄 Migración de Datos</h1>
          <p className="text-muted-foreground mb-6">
            Esta herramienta migrará todos tus datos existentes al nuevo sistema multi-viaje.
            Tus datos se asignarán a un viaje por defecto llamado "Japón 2025".
          </p>

          {status === 'ready' && (
            <Button onClick={migrateData} size="lg" className="bg-primary hover:bg-primary/90">
              Iniciar Migración
            </Button>
          )}

          {status === 'migrating' && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-foreground font-medium">Migrando datos...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-xl">
              <p className="text-green-600 font-medium">✅ Migración completada exitosamente!</p>
              <Button 
                onClick={() => navigate(createPageUrl('TripsList'))} 
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Ir a Mis Viajes
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
              <p className="text-red-600 font-medium">❌ Error durante la migración</p>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-foreground mb-2">Log de migración:</h3>
              <div className="bg-secondary/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                {log.map((entry, idx) => (
                  <p key={idx} className="text-sm text-foreground font-mono mb-1">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}