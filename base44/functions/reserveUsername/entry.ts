import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function normalizeUsername(input) {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function validateUsername(input) {
  if (!input) return 'El username no puede estar vacío';
  if (input.length < 3) return 'Mínimo 3 caracteres';
  if (input.length > 30) return 'Máximo 30 caracteres';
  if (!/^[a-z]/.test(input)) return 'Debe empezar por letra (a-z)';
  if (input.startsWith('_') || input.endsWith('_')) return 'No puede empezar ni terminar con _';
  if (/__/.test(input)) return 'No se permiten dos _ consecutivos';
  if (!/^[a-z][a-z0-9_]{2,29}$/.test(input)) return 'Solo minúsculas (a-z), números y guion bajo (_)';
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const body = await req.json();
    const { username, display_name, avatar_url, bio, home_country, home_currency,
            default_spot_visibility, default_doc_visibility } = body;

    const normalized = normalizeUsername(username || '');
    const validationError = validateUsername(normalized);
    if (validationError) return Response.json({ error: validationError }, { status: 400 });

    // Check uniqueness (service role to bypass RLS)
    const existing = await base44.asServiceRole.entities.UserProfile.filter({
      username_normalized: normalized,
    });

    const takenByOther = existing.filter((p) => p.user_id !== user.id);
    if (takenByOther.length > 0) {
      return Response.json({ error: 'Username ya está en uso' }, { status: 409 });
    }

    // Find existing profile for this user
    const myProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    const myProfile = myProfiles[0];

    const profileData = {
      user_id: user.id,
      username: normalized,
      username_normalized: normalized,
      display_name: display_name || normalized,
      ...(avatar_url !== undefined && { avatar_url }),
      ...(bio !== undefined && { bio }),
      ...(home_country !== undefined && { home_country }),
      ...(home_currency !== undefined && { home_currency }),
      ...(default_spot_visibility !== undefined && { default_spot_visibility }),
      ...(default_doc_visibility !== undefined && { default_doc_visibility }),
    };

    let profile;
    if (myProfile) {
      profile = await base44.asServiceRole.entities.UserProfile.update(myProfile.id, profileData);
    } else {
      profile = await base44.asServiceRole.entities.UserProfile.create(profileData);
    }

    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});