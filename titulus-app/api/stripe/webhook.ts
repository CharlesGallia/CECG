/**
 * POST /api/stripe/webhook
 * Endpoint webhook Stripe. Vérifie la signature et marque la session comme payée.
 *
 * Configuration : Stripe Dashboard → Webhooks → Add endpoint
 *   URL : https://adherer.gallia.space/api/stripe/webhook
 *   Events : checkout.session.completed
 *   Secret → variable STRIPE_WEBHOOK_SECRET dans Vercel
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin'
import { sendEmail, imperialEmailHtml } from '../_lib/resendClient'

const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
const stripe = stripeKey ? new Stripe(stripeKey) : null

export const config = {
  api: {
    bodyParser: false, // raw body requis pour vérifier la signature
  },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!stripe || !webhookSecret) {
    console.error('[Titulus] Stripe webhook misconfigured.')
    return res.status(500).end()
  }

  const sig = req.headers['stripe-signature'] as string
  if (!sig) return res.status(400).end()

  let event: Stripe.Event
  try {
    const buf = await getRawBody(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('[Titulus] Webhook signature verification failed:', err)
    return res.status(400).end()
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const uuid = session.metadata?.declarant_uuid
    if (!uuid) {
      console.warn('[Titulus] Webhook reçu sans declarant_uuid')
      return res.status(200).end()
    }

    await supabaseAdmin
      .from('titulus_sessions')
      .update({
        status: 'PAIEMENT_OK',
        stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('uuid', uuid)

    // E-mail de confirmation paiement
    if (session.customer_email) {
      const baseUrl = process.env.VITE_PUBLIC_BASE_URL ?? ''
      await sendEmail({
        to: session.customer_email,
        subject: 'Imperio Gallorum Sociatis — Confirmation de paiement · Titulus Civilis',
        html: imperialEmailHtml({
          titre: 'Votre paiement a bien été reçu',
          corps: `
            <p>Salve,</p>
            <p>Nous accusons réception de votre cotisation fondatrice de <strong>77&nbsp;€</strong> à l'Association GIFTER, dans le cadre de votre souscription à la <em>Titulus Civilis</em>.</p>
            <p>Vous pouvez à présent compléter votre <em>Declaratio Galliæ</em> à l'étape suivante du funnel.</p>
            <p style="margin-top:18px;font-style:italic;color:#5A4D2A;">Gallia Aeterna.</p>
          `,
          cta: baseUrl ? { label: 'Compléter ma Declaratio', href: `${baseUrl}/declaratio` } : undefined,
        }),
      })
    }
  }

  return res.status(200).json({ received: true })
}
