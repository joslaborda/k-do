# Testing Guide: Feed Social con Tabs

## 🎯 Objetivo
Verificar que el feed social en TripsList funciona completamente con 3 tabs (Explorar/Siguiendo/Guardados), búsqueda de usuarios, filtros y paginación.

## 📝 Archivos Creados/Modificados

### Creados (2)
1. `src/components/social/TemplatesFeedTabs.jsx` - Feed con tabs, filtros, paginación
2. `src/components/social/UserSearchPanel.jsx` - Buscador de usuarios mejorado

### Modificados (1)
1. `src/pages/TripsList.jsx` - Reemplazado SocialExploreSection con TemplatesFeedTabs

## 🧪 Pasos de Prueba

### Paso 1: Setup Inicial
```
1. Ve a http://localhost:5173/TripsList
2. Asegúrate de estar autenticado
3. Verifica que tu perfil esté creado (username visible)
4. Deberías ver "Mis viajes" grid en la parte superior
5. Scroll hacia abajo → verás "🌍 Comunidad" con 3 tabs
```

### Paso 2: Tab EXPLORAR
```
1. Haz click en tab "🌐 Explorar"
2. Deberías ver:
   - Input de búsqueda
   - Selector de país (Todos los países)
   - Selector de duración (Cualquier duración)
   - Botón "Limpiar" (deshabilitado si sin filtros)
   - Grid de tarjetas (si hay templates públicos)

3. Sin filtros:
   - Mostrará todos los templates públicos
   - Máximo 12 por página (paginación)
   - Si < 12, sin paginación
   - Si > 12, botones "Anterior/Siguiente"
```

### Paso 3: Búsqueda en EXPLORAR
```
1. Escribe en input búsqueda: "japan" (o parcial)
2. Debería filtrar por:
   - Título del template
   - Ciudades (cities[])
   - Tags
3. Sin resultados → mensaje "No se encontraron itinerarios"
4. Filtros se aplican instantáneamente
5. Paginación resetea a página 1
```

### Paso 4: Filtrar por País
```
1. Click en "Todos los países" → aparece dropdown
2. Selecciona un país (ej. "Japón")
3. Grid se filtra a templates con ese país en countries[]
4. Paginación se resetea
5. Input búsqueda sigue visible (puedes combinar filtros)
```

### Paso 5: Filtrar por Duración
```
1. Click en "Cualquier duración" → aparece dropdown
2. Opciones:
   - 1–3 días
   - 4–7 días
   - 8–14 días
   - 15+ días
3. Selecciona una → se filtra por duration_days
4. Puedes combinar con país
5. Limpiar resetea ambos filtros
```

### Paso 6: Paginación
```
1. Si hay > 12 templates filtrados:
   - Botones "Anterior" y "Siguiente" aparecen
   - "Anterior" deshabilitado en página 1
   - "Siguiente" deshabilitado en última página
2. Click "Siguiente" → carga siguientes 12
3. Índice visible: "Página 2 de 5" (ej.)
4. No recarga toda la lista (keepPreviousData)
```

### Paso 7: Tarjeta de Template
```
En cada tarjeta verás:
  - cover_image (o emoji si falta)
  - Título (truncado a 2 líneas)
  - Summary (truncada a 2 líneas)
  - "X días" (duration_days)
  - Ciudades (ej. "3 ciudades")
  - País/Países
  - Botón "Ver" (link a TemplateDetail)
  - Botón heart (Guardar/Quitar)

Click "Ver" → abre TemplateDetail en tab nuevo/modal
Click heart → guarda/quita de colección "Guardados"
```

### Paso 8: Guardar Template
```
1. En tab EXPLORAR, click heart en una tarjeta
2. Si no autenticado → toast: "Debes iniciar sesión"
3. Si autenticado → se vuelve rojo (♥)
4. Se crea/actualiza Collection "Guardados"
5. Aparece en tab "Guardados"
```

### Paso 9: Tab SIGUIENDO
```
1. Click en "👥 Siguiendo (0)" (o número actual)
2. Si no sigues a nadie:
   - Mensaje: "No sigues a nadie todavía"
   - Botón: "Buscar usuarios" → vuelve a EXPLORAR
3. Si sigues usuarios:
   - Muestra templates públicos de esos usuarios
   - Mismo sistema de filtros/búsqueda que EXPLORAR
   - Misma paginación
```

### Paso 10: Tab GUARDADOS
```
1. Click en "♥ Guardados (X)"
2. Muestra templates que guardaste en EXPLORAR/SIGUIENDO
3. Sin guardados → mensaje "Aún no has guardado"
4. Con guardados:
   - Grid de tarjetas
   - Mismo sistema de filtros
   - heart aparece lleno (rojo)
   - Click heart → quita de Guardados
```

### Paso 11: Buscador de Usuarios (en EXPLORAR)
```
1. Scroll hacia abajo en tab EXPLORAR (debajo de templates)
2. Verás sección "🔍 Buscar usuarios"
3. Input: "Busca por username, nombre o país..."
4. Empieza a escribir (ej. "ana"):
   - Busca por:
     * username: @ana*
     * display_name: *Ana*
     * home_country: *Ana*
   - Case-insensitive
   - Resultados actualizados al escribir
5. Sin resultados → "No se encontraron usuarios"
```

### Paso 12: Usuario en Buscador
```
Cada resultado muestra:
  - Avatar (o inicial)
  - display_name
  - @username
  - home_country
  - Botón "Seguir" o "Siguiendo"

Click "Seguir" → crea Follow record
  - Botón se vuelve azul "Siguiendo"
Click "Siguiendo" → borra Follow
  - Botón vuelve a "Seguir"

Tab "Siguiendo" se actualiza automáticamente
```

### Paso 13: Flujo Completo (Multi-Usuario)
```
1. Usuario A: Publica un viaje como template público (nombre "Japan Trip")
2. Usuario B: Ve "Japan Trip" en EXPLORAR
3. Usuario B: Click heart → guarda
4. Usuario B: Click "Seguir" en buscador para Usuario A
5. Usuario B: Click tab SIGUIENDO → ve templates de A
6. Usuario B: Click tab GUARDADOS → ve "Japan Trip"
7. Usuario A: Publica otro viaje
8. Usuario B: Aparece automáticamente en SIGUIENDO (no en EXPLORAR, solo en SIGUIENDO)
```

## ✅ Checklist de Verificación

- [ ] Tab EXPLORAR muestra templates públicos
- [ ] Búsqueda en EXPLORAR filtra por título, ciudades, tags
- [ ] Filtro país funciona (dropdown con países únicos)
- [ ] Filtro duración funciona (4 rangos)
- [ ] Botón "Limpiar" limpia todos los filtros
- [ ] Paginación: 12 por página, botones Anterior/Siguiente
- [ ] Paginación está deshabilitada si < 12 resultados
- [ ] Tarjetas muestran cover, título, resumen, duración, ciudades, países
- [ ] Botón "Ver" abre TemplateDetail
- [ ] Botón heart guarda/quita de Guardados
- [ ] Tab SIGUIENDO lista solo templates de seguidos
- [ ] Tab SIGUIENDO vacío si no sigues a nadie
- [ ] Tab GUARDADOS muestra colección "Guardados"
- [ ] Tab GUARDADOS vacío si nada guardado
- [ ] Buscador de usuarios funciona (username, display_name, home_country)
- [ ] Búsqueda es case-insensitive
- [ ] Botón Seguir/Siguiendo en usuario funciona
- [ ] Follow se persiste en Base44
- [ ] Cuando sigues, templates aparecen en SIGUIENDO
- [ ] Cuando dejas seguir, desaparecen de SIGUIENDO
- [ ] Filtros SIGUIENDO/GUARDADOS funcionan igual que EXPLORAR
- [ ] Paginación en SIGUIENDO/GUARDADOS funciona

## 📊 React Query Keys

Las queries están optimizadas:

```javascript
// Estables (se cachan 10 min)
['templatesPublic']           // templates visibility='public'
['following', userId]          // usuarios que sigue
['templatesFollowing', ids]    // templates de seguidos
['guardados', userId]          // colección "Guardados"

// Dinámicos (resetean con filtros)
Paginación resetea automaticamente cuando cambias filtros
keepPreviousData = true en paginación
```

## 🎨 UX Details

- **Empty states** con iconografía apropiada
- **Loading spinners** mientras carga
- **Botones deshabilitados** si sin datos o mutando
- **Toasts** para follow/unfollow (opcional)
- **Heart** lleno si guardado, vacío si no
- **Scroll** en resultados de buscador (max-h-96 overflow-y-auto)
- **Truncación** de títulos/resumenes (line-clamp)
- **Hover effects** en tarjetas y usuarios

## 🔍 Detalles Técnicos

### Filtrado de Templates
```javascript
// Search: parcial, case-insensitive
title.includes(query) || 
cities.some(c => c.includes(query)) || 
tags.some(t => t.includes(query))

// Country
countries.includes(selectedCountry)

// Duration
duration >= range.min && duration <= range.max
```

### Búsqueda de Usuarios
```javascript
// Case-insensitive
username.toLowerCase().includes(query) ||
display_name.toLowerCase().includes(query) ||
home_country.toLowerCase().includes(query)

// Excluye al usuario actual
user_id !== currentUserId
```

## 📱 Responsive

- Mobile: 1 col grid (tarjetas full width)
- Tablet: 2 cols
- Desktop: 3 cols
- Buscador: full width en todos

## 🚀 Performance

- **Stale Time**: 10 min (actualiza cada 10 min)
- **Keep Previous Data**: true en paginación
- **Lazy Load**: 12 por página, no infinito scroll al inicio
- **Memoization**: useMemo en filtered lists

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Templates no aparecen en EXPLORAR | Verifica visibility='public' en ItineraryTemplate |
| SIGUIENDO vacío aunque sigo gente | Usuarios seguidos no tienen templates públicos |
| Buscador de usuarios no funciona | Verifica UserProfile existe con username |
| Guardados no persiste | Verifica Collection "Guardados" se crea |
| Paginación no funciona | Verifica filterTemplates retorna array |
| Country filter vacío | Verifica countries[] en templates |