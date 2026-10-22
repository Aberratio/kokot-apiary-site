import { z } from 'zod'
import { HONEYPOT_FIELD } from './honeypot'

export { HONEYPOT_FIELD }

/**
 * Public form validation. Messages are keys into the site dictionary's `forms.errors`, so the
 * page shows them in the visitor's language.
 */
export type PublicErrorKey = 'required' | 'tooLong' | 'invalidEmail' | 'invalidPhone'

const required = (max: number) => z.string().trim().min(1, 'required').max(max, 'tooLong')
const optional = (max: number) => z.string().trim().max(max, 'tooLong').default('')
const email = z.string().trim().min(1, 'required').max(200, 'tooLong').pipe(z.email('invalidEmail'))

export const orderCustomerSchema = z.object({
  name: required(120),
  email,
  phone: z
    .string()
    .trim()
    .min(1, 'required')
    .regex(/^\+?[\d\s()-]{7,20}$/, 'invalidPhone'),
  address: optional(500),
  note: optional(1000),
  deliveryOptionId: z.string().trim().min(1, 'required'),
})
export type OrderCustomer = z.output<typeof orderCustomerSchema>

export const contactSchema = z.object({
  name: required(120),
  email,
  message: required(3000),
})
export type ContactMessage = z.output<typeof contactSchema>

export function isBot(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD)
  return typeof value === 'string' && value.trim() !== ''
}

export function parsePublicForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
):
  { ok: true; data: z.output<S> } | { ok: false; errors: Partial<Record<string, PublicErrorKey>> } {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value
  }
  const result = schema.safeParse(values)
  if (result.success) return { ok: true, data: result.data }
  const errors: Partial<Record<string, PublicErrorKey>> = {}
  const known: PublicErrorKey[] = ['required', 'tooLong', 'invalidEmail', 'invalidPhone']
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    errors[field] ??= (known as string[]).includes(issue.message)
      ? (issue.message as PublicErrorKey)
      : 'required'
  }
  return { ok: false, errors }
}
