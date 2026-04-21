# Testing Guide: Publicar Viaje como Itinerario

## 🎯 Objetivo
Verificar que el flujo Trip → Template → Explore funciona completamente:
- Publicar un viaje desde Home
- Cambiar visibilidad (private/unlisted/public)
- Encontrarlo en Explore
- Clonar a nuevo viaje

## 📝 Archivos Modificados/Creados

### Creados (4)
1. `src/lib/publishTripAsTemplate.js` - Helper function
2. `src/components/trip/PublishSection.jsx` - UI de publicación
3. `src/pages/Explore.jsx` - Página de exploración pública
4. `src/pages/TemplateDetail.jsx` - Detalle de template con privacidad

### Modificados (3)
1. `src/entities/Trip.json` - Añadido template_visibility, template_id
2. `src/pages/Home.jsx` - Integrado PublishSection + query de profile
3. `src/App.jsx` - Rutas explícitas para Explore y TemplateDetail

## 🧪 Pasos de Prueba

### Paso 1: Setup Básico
```
1. Ve a http://localhost:5173/TripsList
2. Si tienes un viaje, abre su Home con el botón de Inicio
3. Si no, crea un viaje rápido:
   - Nombre: "Test Japón"
   - Destino: Tokio
   - Fecha inicio: [hoy + 30 días]
   - Noches: 7
   - Crear
```

### Paso 2: Ubicar PublishSection
```
En Home del viaje:
- Scroll hacia abajo en toda la página
- Antes de que termine, verás un bloque naranja "Publicar Itinerario"
- NOTA: Solo aparece si eres admin del viaje
```

### Paso 3: Publicar como No Listado
```
1. En PublishSection, selector "Visibilidad" = "No listado (link)"
2. Lee la descripción: "Accesible por enlace directo..."
3. Botón = "Publicar Ahora"
4. Espera → Toast verde "Itinerario publicado"
5. Status badge aparece: "Publicado - Accesible por enlace"
6. Se muestra enlace para copiar con botón "Copiar"
```

### Paso 4: Copiar y Compartir Link
```
1. Pulsa botón "Copiar" junto al enlace
2. Toast = "Enlace copiado"
3. La URL debe ser: /TemplateDetail?id={templateId}
4. Abre enlace en pestaña nueva → debe funcionar
5. Verás detalles del itinerario: cover, title, summary, ciudades
```

### Paso 5: Cambiar a Público
```
1. Vuelve a Home del viaje original
2. En PublishSection, cambia selector = "Público (Explorar)"
3. Lees descripción: "Aparecerá en la sección Explorar..."
4. Pulsa "Actualizar Publicación"
5. Toast = "Itinerario publicado"
6. Status cambia a "Público - Aparece en Explorar"
```

### Paso 6: Verificar en Explore
```
1. Navega a /Explore (o desde TripsList link "Ver más")
2. Deberías ver tu template en la grid
3. Búsqueda: escribe nombre del viaje → debe aparecer
4. Filtros:
   - País: selecciona el país de tu viaje → aparece
   - Duración: selecciona rango correcto → aparece
5. Click en template → abre TemplateDetail
```

### Paso 7: Cambiar a Privado
```
1. Vuelve a Home del viaje original
2. Selector = "Privado (solo yo)"
3. "Actualizar Publicación"
4. Status badge actualiza
5. Enlace para compartir DESAPARECE (solo privado)
6. Vuelve a /Explore:
   - Tu template YA NO aparece
   - Verificado: privados no en Explore
7. Abre URL directa del template:
   - Error: "No tienes acceso - Este itinerario es privado"
```

### Paso 8: Volver a Público y Clonar
```
1. Vuelve a Home del viaje original
2. Selector = "Público (Explorar)"
3. "Actualizar Publicación"
4. Navega a /Explore → tu template aparece
5. Click en template → TemplateDetail
6. Botón "Usar Este Itinerario" → abre modal
7. Rellena:
   - Nombre: "Mi Clon de Japón"
   - Fecha inicio: [cualquier fecha futura]
   - Duración: 7 noches
8. "Crear Viaje"
9. Espera → se crea Trip + Cities automáticamente
10. Redirige a Home del viaje clonado
11. Verifica:
    - Nombre, fechas correctas
    - Cities creadas desde template
    - NO hay documentos (Documents está vacío)
    - NO hay gastos (Expenses está vacío)
    - NO hay diarios (Diary está vacío)
```

### Paso 9: Verificar Privacidad Otros Usuarios
```
Si tienes otra cuenta:
1. En cuenta original: publica viaje como PRIVADO
2. Copia URL del template
3. Abre en sesión incógnita (sin login)
4. Error: "No tienes acceso"

Si es UNLISTED:
1. Publica como "No listado"
2. En incógnito sin login: abre URL directa
3. DEBE funcionar (ver detalles)
4. NO aparece en /Explore

Si es PUBLIC:
1. Publica como "Público"
2. En incógnito: aparece en /Explore
3. URL directa funciona
4. Botón "Guardar" deshabilitado (requiere login)
5. Botón "Usar" redirige a login
```

## ✅ Checklist Final

- [ ] PublishSection aparece en Home (solo admin)
- [ ] Publicar genera ItineraryTemplate
- [ ] Visibilidades funcionan (private/unlisted/public)
- [ ] Enlace para compartir copia correctamente
- [ ] Templates públicos aparecen en Explore
- [ ] Templates privados NO aparecen en Explore
- [ ] Acceso privado deniega en TemplateDetail
- [ ] Acceso unlisted funciona por link
- [ ] Búsqueda y filtros en Explore funcionan
- [ ] Clonar crea Trip sin docs/gastos/diarios
- [ ] Paginación en Explore funciona (12 por página)
- [ ] Save/Unsave en TemplateDetail funciona
- [ ] Non-logged users no pueden guardar
- [ ] Non-logged users no pueden clonar
- [ ] Botón "Actualizar Publicación" aparece si ya existe template
- [ ] Visibilidad se persiste en Trip.template_visibility
- [ ] Template se vincula con Trip.template_id

## 🔍 Detalles Técnicos

### Flujo Publicación
```
Home.jsx →
  PublishSection.handlePublish() →
    publishTripAsTemplate() →
      if trip.template_id:
        ItineraryTemplate.update()
      else:
        ItineraryTemplate.create()
        Trip.update({ template_id, template_visibility })
```

### Flujo Clonado
```
TemplateDetail.jsx →
  cloneMutation.mutate() →
    Trip.create() [sin docs, gastos, diarios]
    City.create() [distribuida duración entre ciudades]
    redirect a /Home?trip_id={newTrip.id}
```

### Validación Acceso
```
TemplateDetail.canAccess():
  - visibility='public' → siempre OK
  - visibility='unlisted' → siempre OK (link)
  - visibility='private' → solo si user.id === created_by_user_id
```

### Explore Listado
```
Explore.jsx:
  - Query: ItineraryTemplate.filter({ visibility: 'public' })
  - NO incluye private o unlisted
  - Search: title + summary + tags
  - Filtros: country, duration_days
  - Paginación: 12 templates/página
```

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| PublishSection no aparece | ¿Eres admin del viaje? Chequea roles en Trip |
| Template no aparece en Explore | ¿Visibilidad='public'? Refresh /Explore |
| Clonar redirige a TripsList | Trip creado pero no cities. Chequea console |
| Error al compartir link | TemplateDetail no cargó. Verifica templateId |
| Privado aparece en Explore | Cache. Hace hard refresh Explore |

## 📝 Notas

1. **Cities se distribuyen** entre start_date y end_date según noches
2. **Summary** fallback a descripción corta si está vacío
3. **Cover image** fallback a blank si no existe
4. **Layout**: Explore y TemplateDetail NO usan Layout wrapper (sin nav)
5. **Permisos**: Solo admins publican. Roles de Trip se respetan.