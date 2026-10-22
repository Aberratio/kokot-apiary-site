/**
 * Name of the hidden field bots fill in and people never see. Kept in its own module so the
 * browser bundle can import it without pulling in zod from the validation module.
 */
export const HONEYPOT_FIELD = 'website'
