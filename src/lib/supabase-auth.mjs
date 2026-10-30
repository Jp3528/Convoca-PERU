/** @param {string} key @returns {Record<string, string>} */
export function supabaseAuthHeaders(key) {
  if (key.startsWith("sb_secret_")) return { apikey: key };
  return { apikey: key, Authorization: "Bearer " + key };
}
