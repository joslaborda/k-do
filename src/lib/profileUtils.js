/**
 * Kōdo profile utilities
 *
 * UserProfile does NOT have an email field — only user_id.
 * Use these helpers to build email-keyed maps by crossing
 * UserProfile (user_id → avatar, display_name) with User (id → email).
 */

/**
 * Build a { [email]: UserProfile } map from profiles + usersData.
 * Falls back to profile.user_email / profile.email if present (legacy).
 */
export function buildProfilesByEmail(profiles = [], usersData = []) {
  const byUserId = {};
  for (const p of profiles) byUserId[p.user_id] = p;

  const map = {};
  for (const u of usersData) {
    if (u.email && byUserId[u.id]) map[u.email] = byUserId[u.id];
  }

  // Legacy fallback — some older profiles may have email fields
  for (const p of profiles) {
    const legacyEmail = p.email || p.user_email;
    if (legacyEmail && !map[legacyEmail]) map[legacyEmail] = p;
  }

  return map;
}

/**
 * Find a profile by email using a pre-built profilesByEmail map.
 * Safe to call even if map is undefined or email is empty.
 */
export function profileByEmail(profilesByEmail = {}, email = '') {
  if (!email) return null;
  return profilesByEmail[email] || null;
}
