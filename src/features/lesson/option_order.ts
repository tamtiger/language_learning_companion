import { useState } from 'react'

function hashSeed(seed: string): number {
  let hash = 1779033703 ^ seed.length
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
  return (hash ^ (hash >>> 16)) >>> 0
}

function createRandom(seed: string): () => number {
  let state = hashSeed(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates shuffle that is a pure function of `seed`; never mutates `items`. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items]
  const random = createRandom(seed)
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

/**
 * Shuffles options by seed. When `avoid` is the order that would reveal the answer
 * (for example the correct ordering), a result equal to it is rotated by one position.
 */
export function orderOptions(options: readonly string[], seed: string, avoid?: readonly string[]): string[] {
  const shuffled = seededShuffle(options, seed)
  const matchesAvoided = avoid !== undefined
    && shuffled.length > 1
    && shuffled.length === avoid.length
    && shuffled.every((option, index) => option === avoid[index])
  return matchesAvoided ? [...shuffled.slice(1), shuffled[0]] : shuffled
}

/** A random value fixed for the lifetime of one mounted component, so each attempt gets its own order. */
export function useShuffleSalt(): string {
  const [salt] = useState(() => Math.random().toString(36).slice(2))
  return salt
}
