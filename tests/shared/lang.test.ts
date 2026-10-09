import { describe, expect, it } from 'vitest'
import { languageOf } from '@/shared/lang'

describe('languageOf', () => {
  it('tags Vietnamese text, including text mixed with English terms', () => {
    expect(languageOf('Nghe trước khi nói')).toBe('vi')
    expect(languageOf('Viết bằng tiếng Anh một tin nhắn gồm success metric')).toBe('vi')
  })

  it('tags plain English text', () => {
    expect(languageOf('Write a 70–110 word update in English')).toBe('en')
    expect(languageOf('Could we ship the fix behind a flag?')).toBe('en')
  })

  it('defaults empty text to English', () => {
    expect(languageOf('')).toBe('en')
  })
})
