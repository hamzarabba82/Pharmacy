import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = join('C:', 'Users', 'momorabba', 'Desktop', 'web', 'testtt', 'Pharmacy', 'src')

function collectFiles(dir: string): string[] {
  const result: string[] = []
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      result.push(...collectFiles(fullPath))
    } else if (entry.endsWith('.ts') || entry.endsWith('.vue')) {
      result.push(fullPath)
    }
  }
  return result
}

const MUTATION_APIS = ['createSale', 'refundSale', 'createPurchase', 'completePurchase']

describe('architecture layers', () => {
  describe('pages must not import mutation APIs directly', () => {
    const pages = collectFiles(join(ROOT, 'pages'))
    const violations = pages
      .map((p) => {
        const content = readFileSync(p, 'utf-8')
        const found = MUTATION_APIS.filter((fn) => {
          const re = new RegExp(`import\\s*\\{[^}]*\\b${fn}\\b[^}]*\\}\\s*from\\s*['"]\\.\\./api/`)
          return re.test(content)
        })
        return found.length > 0 ? { file: relative(ROOT, p), functions: found } : null
      })
      .filter(Boolean)

    it('no page directly imports mutation APIs', () => {
      if (violations.length > 0) {
        const msg = violations
          .map((v: any) => `${v.file}: ${v.functions.join(', ')}`)
          .join('\n')
        expect.unreachable(`Use orchestrator instead of direct api import:\n${msg}`)
      }
    })
  })

  describe('services must not import stores', () => {
    const services = collectFiles(join(ROOT, 'services'))
    const violations = services
      .filter((p) => !p.endsWith('navigation.service.ts'))
      .map((p) => {
        const content = readFileSync(p, 'utf-8')
        return /from\s+['"].*stores\//.test(content) ? relative(ROOT, p) : null
      })
      .filter(Boolean)

    it('no service imports a store', () => {
      if (violations.length > 0) {
        expect.unreachable(`Services must not import stores:\n${violations.join('\n')}`)
      }
    })
  })

  describe('stores must not import other stores', () => {
    const stores = collectFiles(join(ROOT, 'stores'))
    const violations = stores
      .map((p) => {
        const content = readFileSync(p, 'utf-8')
        const lines = content.split('\n')
        const badLines = lines.filter((l) => l.includes('from') && l.includes('/stores/'))
        return badLines.length > 0 ? { file: relative(ROOT, p), lines: badLines } : null
      })
      .filter(Boolean)

    it('no cross-store imports', () => {
      if (violations.length > 0) {
        const msg = violations
          .map((v: any) => `${v.file}:\n  ${v.lines.join('\n  ')}`)
          .join('\n')
        expect.unreachable(`Stores must not import other stores:\n${msg}`)
      }
    })
  })
})
