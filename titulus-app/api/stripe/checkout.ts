/**
 * POST /api/stripe/checkout
 * Body: { uuid }
 * Crée une Stripe Checkout Session (one-shot 77 € EUR) et renvoie l'URL.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin'

const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
const stripe = stripeKey ? new Stripe(stripeKey) : null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!stripe) return res.status(500).json({ error: 'Stripe non configuré.' })

  const { uuid } = req.body ?? {}
  if (!uuid) return res.status(400).json({ error: 'UUID requis.' })

  // Vérifier que la session existe et est en IDENTITE_OK
  const { data: session, error: selErr } = await supabaseAdmin
    .from('titulus_sessions')
    .select('uuid, prenom, nom, email, status')
    .eq('uuid', uuid)
    .single()

  if (selErr || !session) {
    return res.status(404).json({ error: 'Session introuvable.' })
  }

  const baseUrl = process.env.VITE_PUBLIC_BASE_URL
                ?? `https://${req.headers.host}`

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: session.email ?? undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: 7700, // 77,00 €
          product_data: {
            name: 'Titulus Civilis — Cotisation fondatrice',
            description: 'Adhésion annuelle à l\'Imperio Gallorum Sociatis · Phase fondatrice · 6,42 €/mois équivalent — paiement annuel unique 77 €.',
          },
        },
      }],
      metadata: {
        declarant_uuid: uuid,
        funnel: 'titulus_civilis',
        prenom: session.prenom ?? '',
        nom: session.nom ?? '',
      },
      success_url: `${baseUrl}/declaratio?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/adhesion?canceled=true`,
      locale: 'fr',
    })

    // Mémoriser l'ID Stripe
    await supabaseAdmin
      .from('titulus_sessions')
      .update({ stripe_session_id: checkout.id })
      .eq('uuid', uuid)

    return res.status(200).json({ url: checkout.url })
  } catch (err) {
    console.error('[Titulus] Stripe checkout error:', err)
    return res.status(500).json({ error: 'Erreur Stripe.' })
  }
}
