import path from 'node:path'
import { readLedger, writeLedger, computeTestId, LEDGER_PATH } from './ledger-utils'
import type { LedgerEntry } from './ledger-utils'

const AC_ID_RE = /^(AC-\d{3,}-\d+):/

export function registerLedgerReporter(on: Cypress.PluginEvents) {
  on('after:run', (results) => {
    if (!results || !('runs' in results)) return

    const ledger = readLedger(LEDGER_PATH)
    const now = new Date().toISOString()

    for (const run of results.runs) {
      const relFile = path.relative(process.cwd(), run.spec.absolute)

      for (const test of run.tests) {
        if (test.state === 'pending') continue

        const fullTitle = test.title.join(' > ')

        // Extract AC-XXX-N id from title segments, fall back to hash
        const acSegment = test.title.find((t: string) => AC_ID_RE.test(t))
        const id = acSegment
          ? acSegment.match(AC_ID_RE)![1]
          : computeTestId(relFile, fullTitle)

        const status = test.state === 'passed' ? 'pass' as const : 'fail' as const
        const existing = ledger[id]

        const durationMs = test.duration ?? (
          test.attempts?.reduce((sum: number, a: any) => sum + (a.duration ?? 0), 0) ?? 0
        )

        ledger[id] = {
          id,
          name: fullTitle,
          suite: 'e2e',
          file: relFile,
          lastRun: now,
          lastRunStatus: status,
          lastSuccessRun: status === 'pass' ? now : (existing?.lastSuccessRun ?? null),
          durationMs: Math.round(durationMs),
        }
      }
    }

    writeLedger(ledger, LEDGER_PATH)
  })
}
