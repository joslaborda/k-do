# "Publicar Viaje" - Resumen de Implementación

## 🎯 Objetivo Logrado
Implementar flujo completo Trip → ItineraryTemplate → Explore → Clonar nuevo Trip, con validación de privacidad (private/unlisted/public).

## 📊 Cambios Realizados

### 1. Entity Trip (src/entities/Trip.json)
**Nuevos campos:**
```json
{
  "template_visibility": "string (private|unlisted|public, default: private)",
  "template_id": "string (opcional, vincula con ItineraryTemplate)"
}
```

### 2. Helper Function (src/lib/publishTripAsTemplate.js)
```javascript
publishTripAsTemplate(trip, cities, user, profile, visibility)
  → Crea/actualiza ItineraryTemplate
  → Extrae: title, summary, duration_days, countries, cities, cover_image
  → Si trip.template_id existe: actualiza
  → Si no existe: crea + guarda template_id en Trip
  → Retorna: { id, visibility, source_trip_id }

getTemplateShareUrl(templateId)
  → Genera URL para compartir: /TemplateDetail?id={id}
```

### 3. UI Component (src/components/trip/PublishSection.jsx)
**Features:**
- Selector de visibilidad (private/unlisted/public)
- Info cards explicativas por cada visibilidad
- Status badge (Privado/No listado/Público)
- Link para compartir + botón Copiar (si unlisted/public)
- Solo visible para admins
- Toast feedback en acciones

### 4. Home.jsx Modificado
**Cambios:**
- Importado PublishSection
- Agregado estado publishOpen (opcional)
- Query para UserProfile (para profile.username)
- Componente PublishSection renderizado si isAdmin
- Cache invalidation en onPublish

### 5. App.jsx Routing
**Rutas explícitas:**
```javascript
<Route path="/Explore" element={<Explore />} />
<Route path="/TemplateDetail" element={<TemplateDetail />} />
```
Nota: No usan Layout wrapper (sin navegación lateral)

### 6. Explore Page (src/pages/Explore.jsx)
**Features:**
- Query: `ItineraryTemplate.filter({ visibility: 'public' })`
- Search: título, summary, tags
- Filtros: país, duración (1-3, 4-7, 8-14, 15+ días)
- Paginación: 12 templates/página
- Empty states ilustrados
- Cards que enlazan a TemplateDetail

### 7. TemplateDetail Page (src/pages/TemplateDetail.jsx)
**Features:**
- Validación de acceso:
  - public → siempre accesible
  - unlisted → accesible por link
  - private → solo creador
- Botones: Volver, Guardar (heart), Copiar link, Compartir, Usar
- Modal para clonar con nombre/fecha/noches
- Clonar crea:
  - Trip nuevo sin template_id (es una copia, no template)
  - Cities distribuidas por duración
  - NO copia: docs, gastos, diarios
- Meta display: duración, ciudades, países
- Hero image + gradient overlay
- Acceso denegado: error graceful si private + no owner

## 🔐 Privacidad

| Visibility | Explore | Link Directo | Share Button | Acceso Público |
|-----------|---------|--------------|--------------|----------------|
| private   | ❌      | ❌           | ❌           | Solo creador   |
| unlisted  | ❌      | ✅           | ✅           | Solo con link  |
| public    | ✅      | ✅           | ✅           | Todos          |

## 🔄 Flujos

### A. Publicar Viaje
```
Home → PublishSection selector (private/unlisted/public)
    → Botón "Publicar Ahora"
    → publishTripAsTemplate()
    → Crea/actualiza ItineraryTemplate
    → Guarda template_id en Trip
    → Toast + Status badge
    → Enlace compartir (si no private)
```

### B. Encontrar en Explore
```
/Explore
  → Query templates públicos (visibility='public')
  → Search/filtros
  → Click template
  → /TemplateDetail?id={id}
```

### C. Clonar Viaje
```
TemplateDetail → Botón "Usar Este Itinerario"
  → Modal: nombre, fecha, noches
  → cloneMutation.mutate()
  → Trip.create() [sin template_id]
  → City.create() [distribuida]
  → Redirect /Home?trip_id={newTrip.id}
```

## 📦 Tech Details

**Publishing:**
- Duración calculada: `differenceInDays(end_date, start_date) + 1`
- Countries extraídos de cities[].country
- Slug generado: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
- Username desde UserProfile (si existe)

**Cloning:**
- Duración distribuida: `Math.floor(noches / numCities)`
- Extras distribuidos: primeras ciudades obtienen +1 noche
- Fecha cálculo: new Date(start).setDate(start.getDate() + offset)
- NEW Trip: members=[user.email], roles={email: 'admin'}, NO template_id

**Access Control:**
- Chequea: `canAccess()` antes de renderizar
- Private: `currentUser?.id === template.created_by_user_id`
- Otros: siempre true (public o unlisted)

## ✅ Seguridad & Validación

- ✅ Solo admins publican (isAdmin check)
- ✅ Private templates ocultos de Explore (filter visibility)
- ✅ Acceso deniado si private + no owner
- ✅ Non-logged users: toasts para redireccionar
- ✅ Clonado NO incluye sensitive data (docs, gastos, diarios)
- ✅ Trip clonado sin template_id (nuevo viaje independiente)

## 📊 Database Queries

**Crear/actualizar template:**
```javascript
if (trip.template_id) {
  await ItineraryTemplate.update(trip.template_id, data);
} else {
  const created = await ItineraryTemplate.create(data);
  await Trip.update(tripId, { template_id, template_visibility });
}
```

**Listar públicos:**
```javascript
await ItineraryTemplate.filter({ visibility: 'public' }, '-created_date')
```

**Clonar:**
```javascript
await Trip.create({ ...cloneData, members: [user.email], roles: {...} });
await City.create({ trip_id, name, country, order, start_date, end_date });
```

## 🚀 Performance

- Explore: staleTime 10 min (actualiza cada 10 min)
- TemplateDetail: staleTime indefinido (on-demand)
- Pagination: 12 templates/página (lazy load)
- TemplateCard: memoized

## 🎨 UX Details

- **Status badge** actualiza en tiempo real
- **Enlace copiar** muestra estado: Copy → CheckCircle por 2s
- **Visibilidad selector** con descriptions claras
- **Toasts** confirman cada acción
- **Modal clonar** calcula ciudades por noche
- **Empty states** ilustrados con emoji + CTA
- **Error acceso** privado: card clara con opción volver
- **Botones deshabilitados** si no autenticado
- **Loading states** (spinner) en mutaciones

## 📱 Responsive

- Explore: grid 1 col mobile, 2 md, 3 lg
- TemplateDetail: hero 100vw, contenido max-4xl
- PublishSection: selector 100% mobile
- Meta cards: 2 col mobile, 4 desktop

## 🔗 URLs

- **Explore:** `/Explore`
- **Template Detail:** `/TemplateDetail?id={templateId}`
- **Share Link:** `{baseUrl}/TemplateDetail?id={templateId}`
- **Home Trip:** `/Home?trip_id={tripId}`

## 📝 Archivos Tocados

**Creados (4):**
- src/lib/publishTripAsTemplate.js
- src/components/trip/PublishSection.jsx
- src/pages/Explore.jsx
- src/pages/TemplateDetail.jsx

**Modificados (3):**
- src/entities/Trip.json (+ template_visibility, template_id)
- src/pages/Home.jsx (+ PublishSection, profile query)
- src/App.jsx (+ 2 rutas explícitas)

**Sin cambios:**
- ItineraryTemplate entity (ya existe)
- Collection entity (ya existe)
- UserProfile entity (ya existe)
- Explore/TemplateDetail en pages.config (no necesarias en pagesConfig)

## 🎯 Completado

✅ Trip entity + template_visibility/template_id
✅ PublishSection UI en Home (solo admins)
✅ Helper publishTripAsTemplate()
✅ Explore con search/filtros (público only)
✅ TemplateDetail con privacidad validation
✅ Clonar sin docs/gastos/diarios
✅ Share URLs (copy button)
✅ Routing en App.jsx
✅ Toasts & feedback
✅ Loading states
✅ Empty states
✅ Responsive design