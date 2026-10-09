import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** `useAppStore()` with no selector subscribes the component to every store change. */
export function findWholeStoreSubscriptions(source: string): number[] {
  return source.split('\n').flatMap((line, index) => /\buseAppStore\(\s*\)/.test(line) ? [index + 1] : [])
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return tsxFiles(path)
    return name.endsWith('.tsx') ? [path] : []
  })
}

describe('store subscriptions', () => {
  it('detects a selector-less subscription and accepts selectors and getState', () => {
    expect(findWholeStoreSubscriptions('const { a } = useAppStore()\nconst b = useAppStore( )')).toEqual([1, 2])
    expect(findWholeStoreSubscriptions('const a = useAppStore((state) => state.a)')).toEqual([])
    expect(findWholeStoreSubscriptions('const s = useAppStore.getState()')).toEqual([])
  })

  it('does not subscribe app or feature components to the whole store', () => {
    const offenders = [...tsxFiles('src/app'), ...tsxFiles('src/features')].flatMap((file) =>
      findWholeStoreSubscriptions(readFileSync(file, 'utf8')).map((line) => `${file}:${line}`)
    )
    expect(offenders).toEqual([])
  })
})
