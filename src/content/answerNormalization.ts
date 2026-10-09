/**
 * Normalizes a free-text answer for comparison: Unicode NFC, straight quotes, lower case,
 * collapsed whitespace and no trailing sentence punctuation. IPA symbols such as the
 * stress marks are left untouched so that distinct symbols stay distinct.
 */
export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!?]+$/, '')
    .trim()
}
