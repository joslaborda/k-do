# Testing Guide: Trip Invitations System

## 🎯 Objetivo
Verificar que el sistema completo de invitaciones funciona: crear invitaciones, enviar emails, aceptar/rechazar, y actualizar Trip con nuevo miembro.

## 📝 Archivos Creados/Modificados

### Creados (3)
1. `src/pages/Invites.jsx` - Página de aceptación/rechazo con 2 vistas
2. `src/lib/invites.js` - Funciones auxiliares de invitación
3. `TRIP_INVITES_TESTING.md` - Este documento

### Modificados (2)
1. `src/components/trip/MembersPanel.jsx` - UI para invitar con rol selector
2. `src/pages.config.js` - Registración de página Invites

### Actualizado (1)
1. `src/entities/TripInvite.json` - Añadidos campos `invite_token` y `responded_date`

## 🧪 Pasos de Prueba

### Paso 1: Setup - Viaje y Admin

```
1. Crea viaje "Test Trip 1" como usuario A (admin@example.com)
2. Entra al viaje (Home?trip_id=...)
3. Desciende a sección "Viajeros" / "Members Panel"
4. Deberías ver:
   - Tu email como miembro
   - Tu rol: "Admin"
   - Sección "Invitar viajero por email" (visible solo para admins)
   - Input para email
   - Dropdown para rol (Admin/Editor/Lector)
   - Botón "Enviar invitación"
```

### Paso 2: Enviar Invitación

```
1. En Members Panel, escribe: invitado@example.com
2. Selecciona rol: Editor
3. Click "Enviar invitación"
4. Deberías ver toast: "✓ Invitación enviada - Email enviado a invitado@example.com"
5. En la BD:
   - Se crea TripInvite con:
     * trip_id: {id del viaje}
     * email: invitado@example.com
     * role: editor
     * status: pending
     * invite_token: {token generado}
     * invited_by: admin@example.com
6. Email se envía a invitado@example.com con:
   - Asunto: "Te invitan a Test Trip 1 🧳"
   - Cuerpo incluye: nombre viaje, rol, link de aceptación
   - Link formato: /.../Invites?token=INVITE_TOKEN
```

### Paso 3: Re-invitar Email Pendiente

```
1. En Members Panel, intenta invitar de nuevo: invitado@example.com
2. Selecciona rol: Admin (diferente al anterior)
3. Click "Enviar invitación"
4. Deberías ver toast: "✓ Invitación enviada"
5. En la BD:
   - NO se crea nueva TripInvite
   - Se actualiza la EXISTENTE con:
     * invite_token: {nuevo token}
     * invited_by: admin@example.com
   - El role NO cambia a menos que se actualice manualmente
6. Email se re-envía con nuevo token
```

### Paso 4: Validar Duplicado en Miembros

```
1. Añade "miembro@example.com" manualmente a Trip.members
2. En Members Panel, intenta invitar: miembro@example.com
3. Deberías ver toast: "Ya es miembro - Este usuario ya está en el viaje"
4. NO se crea TripInvite
5. Input no se limpia (para que user vea que fue rechazado)
```

### Paso 5: Aceptar Invitación (Nuevo Usuario)

```
Setup:
  - Abre link de invitación en navegador privado (nuevo usuario B)
  - URL: /.../Invites?token=VALID_TOKEN

Pantalla que deberías ver:
  - Icono celebración 🎉
  - Título: "Te han invitado"
  - Card naranja con:
    * Nombre viaje
    * Ubicación (MapPin icon)
    * Fecha (Calendar icon)
    * Rol asignado (badge azul)
  - Dos botones:
    * "✓ Aceptar invitación" (verde)
    * "Rechazar" (outline)

Acciones:
  1. Haz login como usuario invitado (invitado@example.com)
     - O si no tienes cuenta, Base44 pide signup
  2. Click "✓ Aceptar invitación"
  3. Deberías ver toast: "✓ ¡Invitación aceptada! - Te has unido a Test Trip 1"
  4. Redirige automáticamente a Home?trip_id={trip_id}
  5. En la BD:
     - TripInvite.status = 'accepted'
     - TripInvite.responded_date = now (ISO)
     - Trip.members añade invitado@example.com
     - Trip.roles[invitado@example.com] = 'editor'
  6. En Members Panel:
     - invitado@example.com aparece como nuevo miembro
     - Rol: "Editor" (según lo invitado)
```

### Paso 6: Rechazar Invitación

```
Setup:
  - Crea nueva invitación para otro@example.com
  - Abre link en navegador privado (usuario C)
  - Haz login como otro@example.com

Acciones:
  1. Click "Rechazar"
  2. Deberías ver toast: "Invitación rechazada - Se ha rechazado la invitación"
  3. Redirige a TripsList
  4. En la BD:
     - TripInvite.status = 'declined'
     - TripInvite.responded_date = now (ISO)
     - Trip.members NO se modifica
     - Trip.roles NO se modifica
  5. otro@example.com NO aparece en Members Panel
```

### Paso 7: Link Inválido/Expirado

```
Casos:
  1. Token inexistente: /.../Invites?token=INVALID
  2. Token de invitación ya aceptada: /.../Invites?token=ACCEPTED_TOKEN
  3. Token de invitación rechazada: /.../Invites?token=DECLINED_TOKEN

En todos los casos:
  - Pantalla de error roja con XCircle icon
  - Mensaje: "Invitación inválida - La invitación ha expirado o no es válida"
  - Botón: "Ir a mis viajes" (navega a TripsList)
```

### Paso 8: Vista de Invitaciones Pendientes (sin token)

```
Setup:
  - Usuario tiene 2 invitaciones pendientes en diferentes viajes
  - Abre: /.../Invites (sin ?token=...)

Pantalla que deberías ver:
  - Header naranja: "Invitaciones 📬"
  - Subtítulo: "Tienes 2 invitaciones pendientes"
  - Grid de 2 cards, cada una con:
    * Nombre viaje
    * "Invitado por: email@example.com"
    * Badge rol (Admin/Editor/Lector)
    * Ubicación y fecha (si existen)
    * Dos botones: "✓ Aceptar" y "✗ Rechazar"

Acciones:
  1. Click "✓ Aceptar" en card 1
  2. Acepta la invitación
  3. Redirige a Home?trip_id={trip_id} del viaje aceptado
  4. Reload de la página muestra lista sin esa invitación

Alternativa (Rechazar):
  1. Click "✗ Rechazar" en card 2
  2. Rechaza la invitación
  3. Página recarga (window.location.reload())
  4. Lista muestra solo la invitación pendiente restante
```

### Paso 9: Sin Invitaciones Pendientes

```
Setup:
  - Usuario sin invitaciones pendientes
  - Abre: /.../Invites

Pantalla que deberías ver:
  - Header: "Invitaciones 📬"
  - Subtítulo: "No tienes invitaciones pendientes"
  - Card vacío con:
    * Icono 📭
    * Título: "Sin invitaciones"
    * Descripción: "Pide a tus amigos que te inviten a colaborar en sus viajes"
    * Botón: "← Mis viajes"
  - Click botón → navega a TripsList
```

### Paso 10: Solo Admins Pueden Invitar

```
Setup:
  - Usuario A es admin del viaje
  - Usuario B es editor del viaje
  - Ambos están en Trip.members

Prueba como Admin (Usuario A):
  - Entra al viaje
  - Ve sección "Invitar viajero por email"
  - Puede invitar

Prueba como Editor (Usuario B):
  - Entra al viaje
  - NO ve sección "Invitar viajero por email" (oculta)
  - Otros miembros NO están editables
```

### Paso 11: Rol Selector en Invitación

```
1. En Members Panel (como admin):
2. Click dropdown de rol (muestra: Admin, Editor, Lector)
3. Selecciona cada uno:
   - Admin → invita con role: admin
   - Editor → invita con role: editor
   - Lector → invita con role: viewer
4. En email recibido:
   - Rol "Admin" si es admin
   - Rol "Editor" si es editor
   - Rol "Lector" si es viewer
5. Al aceptar:
   - Trip.roles[invitado@example.com] = role seleccionado
```

### Paso 12: No Sobreescribir Roles Existentes

```
Setup:
  - Trip.members = [admin@example.com, editor@example.com, otro@example.com]
  - Trip.roles = {
      admin@example.com: 'admin',
      editor@example.com: 'editor',
      otro@example.com: 'viewer'
    }
  - Usuario invita a un cuarto usuario: new@example.com con role "editor"

Resultado:
  - Trip.members = [..., new@example.com]
  - Trip.roles = {
      admin@example.com: 'admin',          ← sin cambios
      editor@example.com: 'editor',        ← sin cambios
      otro@example.com: 'viewer',          ← sin cambios
      new@example.com: 'editor'            ← nuevo
    }
```

### Paso 13: Idempotencia (Aceptar dos veces)

```
Setup:
  - Invitación en status 'pending'
  - Token válido

Acciones:
  1. Primera aceptación: click "✓ Aceptar"
  2. Toast: "✓ ¡Invitación aceptada!"
  3. Redirige a Home
  4. Vuelve atrás (browser back o por URL directo)
  5. Intenta aceptar de nuevo con la misma invitación
  6. Error toast: "Invitación inválida o expirada"
  7. NO se duplica el miembro en Trip.members
  8. NO se duplica en Trip.roles
```

### Paso 14: Email Transaccional

```
Busca el email recibido con:
  - FROM: (nombre de la app, ej. "Kōdo")
  - TO: invitado@example.com
  - SUBJECT: "Te invitan a {Trip.name} 🧳"
  - BODY contiene:
    * Nombre invitador
    * Nombre viaje
    * Rol asignado
    * Link clickeable o copiable
    * Cierre amable: "¡Que disfrutes planificando tu viaje! ✈️"
```

### Paso 15: Navegación Robusta

```
1. Invita a usuario C: newuser@example.com
2. De la URL de invitación, copia el token
3. En incógnito, accede directamente a /.../Invites?token=TOKEN
4. Sin estar logueado:
   - Muestra pantalla de invitación
   - Click "Aceptar" → redirige a login
   - Base44 maneja el login flow
   - Tras login, vuelve a la página de invitación
   - Click "Aceptar" de nuevo → funciona
5. Aceptación exitosa → Home del viaje
```

## ✅ Checklist de Verificación

### UI y Visualización
- [ ] MembersPanel muestra sección "Invitar viajero por email" solo si es admin
- [ ] Input email tiene placeholder "email@ejemplo.com"
- [ ] Dropdown rol tiene 3 opciones: Admin, Editor, Lector
- [ ] Botón "Enviar invitación" deshabilitado si email vacío
- [ ] Botón muestra "..." mientras procesa

### Crear Invitación
- [ ] TripInvite se crea con status 'pending'
- [ ] invite_token se genera (única, >16 chars)
- [ ] invited_by guarda email del admin
- [ ] Email transaccional se envía
- [ ] Toast muestra "✓ Invitación enviada"

### Re-invitar Pendiente
- [ ] Detecta TripInvite pending existente
- [ ] NO crea duplicado
- [ ] Actualiza invite_token
- [ ] Re-envía email con nuevo token
- [ ] Toast muestra "✓ Invitación enviada"

### Validaciones
- [ ] No permite invitar si ya está en members
- [ ] Toast: "Ya es miembro"
- [ ] Link inválido/expirado muestra error
- [ ] Botón "Ir a mis viajes" funciona

### Página Invites (Detail View con token)
- [ ] Carga invitación desde token
- [ ] Muestra nombre viaje
- [ ] Muestra rol asignado (badge)
- [ ] Botón "✓ Aceptar invitación" (verde)
- [ ] Botón "Rechazar" (outline)
- [ ] Spinner mientras procesa

### Aceptar Invitación
- [ ] TripInvite.status cambia a 'accepted'
- [ ] TripInvite.responded_date se guarda
- [ ] Trip.members se actualiza (nuevo email)
- [ ] Trip.roles se actualiza (email: role)
- [ ] No sobreescribe otros roles
- [ ] Toast: "✓ ¡Invitación aceptada!"
- [ ] Redirige a Home?trip_id={trip_id}
- [ ] Nuevo miembro aparece en Members Panel

### Rechazar Invitación
- [ ] TripInvite.status cambia a 'declined'
- [ ] TripInvite.responded_date se guarda
- [ ] Trip.members NO cambia
- [ ] Trip.roles NO cambia
- [ ] Toast: "Invitación rechazada"
- [ ] Redirige a TripsList

### Página Invites (List View sin token)
- [ ] Muestra lista de pendientes si existen
- [ ] Cada card con: nombre viaje, invitador, rol
- [ ] Buttons "Aceptar" y "Rechazar" funcionales
- [ ] Sin pendientes: muestra estado vacío
- [ ] Botón "Mis viajes" funciona

### Permisos y Seguridad
- [ ] Solo admins ven UI de invitar
- [ ] Editors no ven sección de invitar
- [ ] Viewers no ven sección de invitar
- [ ] No se puede aceptar invitación de otro usuario (verificar email match)

### Responsividad
- [ ] Mobile: Members Panel adaptable
- [ ] Mobile: Página Invites completa y usable
- [ ] Inputs y botones no se solapan

## 🎨 Estilos Esperados

- **Sección invitar**: bordered top, icon + label + input + dropdown + button
- **Toast aceptar**: verde con checkmark
- **Toast rechazar**: neutro/gris
- **Badge rol**: azul con icono según rol
- **Botón aceptar**: verde, con CheckCircle icon
- **Botón rechazar**: outline, con XCircle icon
- **Link email**: formato `mailto:...` o copiable

## 🔍 Datos Esperados en BD

### TripInvite Creada
```json
{
  "id": "invite_abc123",
  "trip_id": "trip_123",
  "email": "invitado@example.com",
  "role": "editor",
  "status": "pending",
  "invite_token": "abc123def456ghi789jkl012",
  "invited_by": "admin@example.com",
  "created_date": "2026-04-21T10:30:00.000Z"
}
```

### Trip Actualizado (Post-aceptación)
```json
{
  "id": "trip_123",
  "members": ["admin@example.com", "invitado@example.com"],
  "roles": {
    "admin@example.com": "admin",
    "invitado@example.com": "editor"
  }
}
```

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Email no se envía | Verificar integración SendEmail en base44 |
| Token inválido | Regenerar y copiar correctamente desde BD |
| No aparece en Members | Refetch query o reload página |
| Login no funciona en link | Base44 maneja flow, esperar redirect |
| Role no se asigna | Verificar TripInvite.role antes de aceptar |

## 🚀 Performance

- **Sin queries nuevas innecesarias**: reutiliza TripInvite.filter()
- **Token único**: random string + date
- **Idempotencia**: check status='pending' antes de ops
- **Cleanup**: responded_date marca transición de estado

## 📚 Documentación

- `src/lib/invites.js`: Funciones helper (generateToken, sendTripInvite, acceptTripInvite, declineTripInvite)
- `src/pages/Invites.jsx`: Dos vistas (con token / lista)
- `src/components/trip/MembersPanel.jsx`: UI de invitar

## 🔗 Enlaces Útiles

- Página Invites: `/.../Invites`
- Invitación con token: `/.../Invites?token=TOKEN`
- SendEmail docs: Base44 built-in integration
- TripInvite entity: `src/entities/TripInvite.json