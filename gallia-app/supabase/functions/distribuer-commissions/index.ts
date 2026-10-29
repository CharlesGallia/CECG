/**
 * Ancien distributeur CECG RETIRÉ (2026-10-29).
 * L'ancien programme GL/merite n'est pas le parcours Status Civilis Galli.
 * Ne crée plus de commissions, points, notifications ou matrices.
 *
 * La fonction conservée sous son nom historique permet de détecter un ancien
 * appelant et de le rediriger vers le parcours actuel, sans aucune mutation.
 * Rouvrir uniquement par un nouveau contrat serveur, avec authentification
 * applicative et idempotence prouvées ; ne jamais restaurer cette ancienne version.
 */
Deno.serve(() => new Response(JSON.stringify({
  error: "CECG_LEGACY_COMMISSION_DISABLED",
  message: "L'ancien traitement CECG est désactivé. Aucune écriture de points ni commission."
}), {status: 410,headers: {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff"
}}));
