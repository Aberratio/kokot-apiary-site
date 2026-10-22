export interface Email {
  to: string
  subject: string
  text: string
  replyTo?: string
}

export type SendResult = 'sent' | 'skipped' | 'failed'

/**
 * Sends a plain-text email through Resend's HTTP API. Without `RESEND_API_KEY` it logs and
 * returns 'skipped', so local work and previews never fail on email.
 *
 * `EMAIL_FROM` needs a domain verified in Resend. Until there is one, Resend's shared sender
 * only delivers to the Resend account owner's own address.
 */
export async function sendEmail(email: Email): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(`email skipped (no RESEND_API_KEY): "${email.subject}"`)
    return 'skipped'
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Pasieka <onboarding@resend.dev>',
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo && { reply_to: email.replyTo }),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (response.ok) return 'sent'
    console.error(`email failed: ${response.status} ${await response.text()}`)
    return 'failed'
  } catch (error) {
    console.error('email failed', error)
    return 'failed'
  }
}
