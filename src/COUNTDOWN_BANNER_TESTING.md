# Testing Guide: Trip Countdown Banner

## 🎯 Objetivo
Verificar que el banner de viaje próximo aparece, muestra checklist funcional, y se puede ocultar por 24h.

## 📝 Archivos Creados/Modificados

### Creados (1)
1. `src/components/trip/TripCountdownBanner.jsx` - Banner con checklist y persistencia

### Modificados (1)
1. `src/pages/Home.jsx` - Integrado TripCountdownBanner

## 🧪 Pasos de Prueba

### Paso 1: Setup - Viaje Próximo
```
1. Crea viaje con:
   - Nombre: "Viaje Test"
   - Inicio: HOY + 3 días (en futuro)
   - Fin: HOY + 10 días
2. Ve a Home del viaje (click en card o /Home?trip_id=...)
3. Deberías ver banner naranja/rojo en la sección "Navigation Section"
4. Mensaje: "🚀 Tu viaje empieza en 3 días"
```

### Paso 2: Verificar Visualización del Banner
```
Banner debe mostrar:
  - Título: "🚀 Tu viaje empieza en X días"
  - Subtítulo: "Aquí está tu checklist rápido"
  - Botón X (Ocultar)
  - Checklist con 5 items:
    * 📄 Docs listos - [ ] o [✓]
    * 🧳 Maleta - [ ] o [✓]
    * 💱 Divisa - [ ] o [✓]
    * 🗺️ Ruta - [ ] o [✓]
    * 👥 Invitados - [ ] o [✓]
  - Botón: "Ver checklist completo"

Color: gradiente naranja a rojo
Posición: arriba de "Hoy / Mañana"
```

### Paso 3: Condición de Visualización
```
Banner SOLO aparece si:
  - daysUntilTrip > 0 AND daysUntilTrip <= 7

Pruebas:
  1) Viaje que comienza en 7 días → APARECE
  2) Viaje que comienza en 8 días → NO APARECE
  3) Viaje que ya pasó (ayer) → NO APARECE
  4) Viaje que comienza hoy → APARECE
  5) Viaje que comienza mañana → APARECE
```

### Paso 4: Checklist - Estado de Items
```
Los items se calculan automáticamente:

A) Docs listos (📄)
   - Estado OK si: trip tiene al least 1 documento
   - Fuente: cantidad de tickets/docs del viaje
   - Click → va a Documents?trip_id=...

B) Maleta (🧳)
   - Estado OK si: packedPercentage >= 80%
   - Fuente: packingItems del viaje
   - Click → va a Packing?trip_id=...

C) Divisa (💱)
   - Estado OK si: trip.currency existe
   - Fuente: trip.currency field
   - Click → va a Utilities?trip_id=...

D) Ruta (🗺️)
   - Estado OK si: cities.length > 0
   - Fuente: ciudades del viaje
   - Click → va a Cities?trip_id=...

E) Invitados (👥)
   - Estado OK si: members.length > 1
   - Fuente: trip.members
   - NO es clicable (info solamente)
```

### Paso 5: Icono Checklist
```
Cada item muestra:
  - Verde ✓ si estado OK
  - Gris ○ si pendiente
  
Prueba:
  1) Crea docs → Docs listos muestra ✓
  2) Quita docs → muestra ○
  3) Añade ciudades → Ruta muestra ✓
  4) Quita ciudades → muestra ○
```

### Paso 6: Click en Items Funcionales
```
Click en item (excepto Invitados):
  - Abre página correspondiente con ?trip_id=...
  - Mantiene contexto de viaje

Prueba:
  1) Click "Maleta" → abre Packing?trip_id=...
  2) Click "Docs listos" → abre Documents?trip_id=...
  3) Click "Divisa" → abre Utilities?trip_id=...
  4) Click "Ruta" → abre Cities?trip_id=...
  5) Click "Invitados" → no hace nada (es readonly)
```

### Paso 7: Botón "Ver checklist completo"
```
Click botón "Ver checklist completo":
  - Abre Packing?trip_id=... (sección que mejor incluye todos los items)
  - Color blanco con texto naranja
```

### Paso 8: Ocultar Banner (24h)
```
1. Click botón X en esquina superior derecha
2. Banner desaparece instantáneamente
3. localStorage guardó:
   - Key: kodo_hide_trip_banner_{tripId}
   - Value: timestamp actual

4. Refresh página → banner NO reaparece
5. Espera 24+ horas (simular con console):
   - localStorage.removeItem('kodo_hide_trip_banner_{tripId}')
   - Refresh → banner reaparece

Prueba de localStorage:
  1) Click X → desaparece
  2) Abre DevTools → Application → localStorage
  3. Busca "kodo_hide_trip_banner_" + tripId
  4. Verifica valor (timestamp Unix)
  5) Modifica valor a (ahora - 25h):
     - console.log(Date.now() - (25*60*60*1000))
     - localStorage.setItem('kodo_hide_trip_banner_{id}', ...)
  6. Refresh → banner reaparece
```

### Paso 9: Rango de Días Correcto
```
Crear múltiples viajes para probar:

Trip A (Comienza en 1 día):
  → APARECE banner "Tu viaje empieza en 1 día"

Trip B (Comienza en 3 días):
  → APARECE banner "Tu viaje empieza en 3 días"

Trip C (Comienza en 7 días):
  → APARECE banner "Tu viaje empieza en 7 días"

Trip D (Comienza en 8 días):
  → NO APARECE banner

Trip E (Comenzó hace 1 día):
  → NO APARECE banner

Trip F (Hoy):
  → APARECE banner "Tu viaje empieza en 0 días"
```

### Paso 10: Persistencia Multi-Trip
```
Teniendo 2 viajes dentro de rango:

1. Trip A (3 días): Banner visible
2. Trip B (5 días): Banner visible
3. Oculta banner de Trip A
   - localStorage: {trip_a_id} → timestamp
   - localStorage: {trip_b_id} → (no existe)
4. Refresh
   - Trip A: banner NO aparece (24h)
   - Trip B: banner aparece (no oculto)
5. Navega a Trip A → banner no visible
6. Navega a Trip B → banner visible
```

### Paso 11: Responsive Design
```
Probar en mobile/tablet:

- Banner ancho completo (px-6)
- Texto legible
- Checklist items scrollean si necesario
- Botón X accesible
- Links funcionan en mobile
```

## ✅ Checklist de Verificación

- [ ] Banner aparece si daysUntilTrip está entre 1–7
- [ ] Banner NO aparece si daysUntilTrip > 7
- [ ] Banner NO aparece si daysUntilTrip <= 0
- [ ] Mensaje muestra días correctos
- [ ] Docs listos: ✓ si existe documento, ○ si no
- [ ] Maleta: ✓ si >= 80% packed, ○ si no
- [ ] Divisa: ✓ si trip.currency existe, ○ si no
- [ ] Ruta: ✓ si cities > 0, ○ si no
- [ ] Invitados: ✓ si members > 1, ○ si no
- [ ] Click "Docs listos" → Documents?trip_id=...
- [ ] Click "Maleta" → Packing?trip_id=...
- [ ] Click "Divisa" → Utilities?trip_id=...
- [ ] Click "Ruta" → Cities?trip_id=...
- [ ] Click "Invitados" → no hace nada
- [ ] Click "Ver checklist completo" → Packing?trip_id=...
- [ ] Click X → banner desaparece
- [ ] localStorage guarda timestamp correctamente
- [ ] Banner reaparece después de 24h (simular)
- [ ] localStorage se limpia correctamente
- [ ] Banner no reaparece en otros viajes no ocultos
- [ ] Responsive en mobile/tablet
- [ ] Colores y estilos correctos

## 🎨 Detalles Visuales

- **Gradiente**: `from-orange-500 to-red-500`
- **Rounded**: `rounded-2xl`
- **Padding**: `p-6`
- **Shadow**: `shadow-lg`
- **Texto**: blanco
- **Icono checkmark**: verde `text-green-300`
- **Icono pendiente**: blanco/40 `text-white/40`
- **Botón X**: esquina superior derecha, hover más opaco

## 📱 Posición en Layout

```
Home.jsx estructura:
  - Hero section (cover image)
  - Stats cards (Duración, Comienza en, etc.)
  - [AQUÍ: TripCountdownBanner] ← Nueva
  - Hoy / Mañana
  - Compartido
  - Personal
  - Members Panel
  - Publish Section
```

## 🔍 Datos Utilizados

El banner reutiliza datos ya disponibles en Home.jsx:
- `daysUntilTrip` (calculado)
- `tripId` (URL param)
- `cities` (query)
- `packingItems` (query)
- `trip` (query)
- `expenses` (query)

**NO hace queries nuevas** (reutiliza existentes).

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Banner no aparece | Verifica daysUntilTrip (1–7 rango) |
| Items no actualizan | Verifica datos en queries (cities, packingItems, etc.) |
| localStorage no funciona | Abre DevTools, Application, localStorage |
| Click no funciona | Verifica createPageUrl y trip_id en URL |
| Banner no reaparece | Limpia localStorage manualmente y refresh |

## 🚀 Performance

- **Sin queries nuevas**: reutiliza datos existentes
- **localStorage**: lectura en mount, escritura en ocultar
- **No causa re-renders innecesarios**: estado local aislado