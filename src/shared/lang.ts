const VIETNAMESE_LETTERS = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i

/** Language tag for displayed text: Vietnamese when it has Vietnamese letters, otherwise English. */
export function languageOf(text: string): 'vi' | 'en' {
  return VIETNAMESE_LETTERS.test(text) ? 'vi' : 'en'
}
