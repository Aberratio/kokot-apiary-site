import { z } from 'zod'

/**
 * Validation for the CMS forms. Error messages are keys into the admin dictionary's
 * `errors`, so the admin UI shows them in its own language.
 */
export type ErrorKey =
  | 'required'
  | 'tooLong'
  | 'invalidPrice'
  | 'invalidEmail'
  | 'invalidUrl'
  | 'invalidNumber'
  | 'invalidChoice'

/** Parses "60", "60,5", "60.50" or "1 200,00" (złoty) into grosze. */
export function parsePriceToGrosze(text: string): number | null {
  const normalised = text.replace(/[\s ]/g, '').replace(/zł$/i, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalised)) return null
  return Math.round(Number(normalised) * 100)
}

/** The other way round, for filling forms: 6050 → "60,50". */
export function formatGroszeForInput(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',')
}

const text = (max: number) => z.string().trim().max(max, 'tooLong').default('')
const requiredText = (max: number) => z.string().trim().max(max, 'tooLong').min(1, 'required')
const price = z
  .string()
  .trim()
  .min(1, 'required')
  .transform((value, ctx) => {
    const grosze = parsePriceToGrosze(value)
    if (grosze === null) {
      ctx.addIssue({ code: 'custom', message: 'invalidPrice' })
      return z.NEVER
    }
    return grosze
  })
const sortOrder = z
  .string()
  .default('')
  .transform((value, ctx) => {
    if (value.trim() === '') return 0
    const number = Number(value)
    if (!Number.isInteger(number)) {
      ctx.addIssue({ code: 'custom', message: 'invalidNumber' })
      return z.NEVER
    }
    return number
  })
// An unchecked checkbox is simply missing from FormData.
const checkbox = z
  .string()
  .optional()
  .transform((value) => value === 'on')

export const productSchema = z.object({
  namePl: requiredText(120),
  nameEn: requiredText(120),
  descriptionPl: text(1000),
  descriptionEn: text(1000),
  size: text(40),
  priceGrosze: price,
  imageAltPl: text(200),
  imageAltEn: text(200),
  available: checkbox,
  featured: checkbox,
  sortOrder,
})
export type ProductInput = z.output<typeof productSchema>

export const deliveryOptionSchema = z.object({
  namePl: requiredText(120),
  nameEn: requiredText(120),
  descriptionPl: text(500),
  descriptionEn: text(500),
  priceGrosze: price,
  enabled: checkbox,
  sortOrder,
})
export type DeliveryOptionInput = z.output<typeof deliveryOptionSchema>

export const paymentInfoSchema = z.object({
  accountHolder: requiredText(120),
  bankName: requiredText(120),
  accountNumber: requiredText(64),
  transferTitleHintPl: text(300),
  transferTitleHintEn: text(300),
})
export type PaymentInfoInput = z.output<typeof paymentInfoSchema>

const url = z
  .string()
  .trim()
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }, 'invalidUrl')

export const settingsSchema = z.object({
  apiaryName: requiredText(120),
  orderMode: z.enum(['form', 'contact'], { message: 'invalidChoice' }),
  contactEmail: z.string().trim().min(1, 'required').pipe(z.email('invalidEmail')),
  contactPhone: text(40),
  heroTaglinePl: text(300),
  heroTaglineEn: text(300),
  aboutStoryPl: text(3000),
  aboutStoryEn: text(3000),
  // One link per line: "Label | https://…".
  socialLinks: z
    .string()
    .default('')
    .transform((value, ctx) => {
      const links = []
      for (const line of value.split(/\r?\n/).filter((l) => l.trim())) {
        const [label = '', href = ''] = line.split('|').map((part) => part.trim())
        const parsed = url.safeParse(href)
        if (!label || !parsed.success) {
          ctx.addIssue({ code: 'custom', message: 'invalidUrl' })
          return z.NEVER
        }
        links.push({ label, url: parsed.data })
      }
      return links
    }),
})
export type SettingsInput = z.output<typeof settingsSchema>

export type FieldErrors = Partial<Record<string, ErrorKey>>

/** Validates a submitted form. Returns the parsed data, or one error key per field. */
export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { ok: true; data: z.output<S> } | { ok: false; errors: FieldErrors } {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value
  }
  const result = schema.safeParse(values)
  if (result.success) return { ok: true, data: result.data }
  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    errors[field] ??= toErrorKey(issue.message)
  }
  return { ok: false, errors }
}

const errorKeys: ErrorKey[] = [
  'required',
  'tooLong',
  'invalidPrice',
  'invalidEmail',
  'invalidUrl',
  'invalidNumber',
  'invalidChoice',
]

function toErrorKey(message: string): ErrorKey {
  // A missing field fails before our own messages run; treat that as required.
  return (errorKeys as string[]).includes(message) ? (message as ErrorKey) : 'required'
}
