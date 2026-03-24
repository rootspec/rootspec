import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

export interface LedgerEntry {
  id: string
  name: string
  suite: 'unit' | 'integration' | 'e2e'
  file: string
  lastRun: string
  lastRunStatus: 'pass' | 'fail'
  lastSuccessRun: string | null
  durationMs: number
}

export interface LedgerSummary {
  lastUpdated: string
  counts: Record<'unit' | 'integration' | 'e2e', number>
  failing: string[]
}

export type Ledger = { _summary?: LedgerSummary } & Record<string, LedgerEntry>

export const LEDGER_PATH = path.resolve(process.cwd(), 'test-ledger.json')

export function computeTestId(filepath: string, testName: string): string {
  const hash = createHash('sha256')
    .update(`${filepath}::${testName}`)
    .digest('hex')
    .slice(0, 8)
  return `t${hash}`
}

export function readLedger(ledgerPath: string = LEDGER_PATH): Ledger {
  if (!existsSync(ledgerPath)) return {}
  try {
    const raw = JSON.parse(readFileSync(ledgerPath, 'utf-8'))
    delete raw._summary
    return raw
  } catch {
    return {}
  }
}

export function writeLedger(ledger: Ledger, ledgerPath: string = LEDGER_PATH): void {
  const entries = Object.entries(ledger).filter(([k]) => k !== '_summary') as [string, LedgerEntry][]

  const counts = { unit: 0, integration: 0, e2e: 0 }
  const failing: string[] = []
  for (const [, entry] of entries) {
    counts[entry.suite]++
    if (entry.lastRunStatus === 'fail') failing.push(entry.id)
  }

  const output: Record<string, unknown> = {
    _summary: {
      lastUpdated: new Date().toISOString(),
      counts,
      failing: failing.sort(),
    } satisfies LedgerSummary,
  }

  for (const key of entries.map(([k]) => k).sort()) {
    output[key] = ledger[key]
  }

  writeFileSync(ledgerPath, JSON.stringify(output, null, 2) + '\n')
}
