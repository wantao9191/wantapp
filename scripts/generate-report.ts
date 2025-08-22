import fs from 'node:fs'
import path from 'node:path'

function readJson<T = any>(p: string): T | null {
  try {
    const s = fs.readFileSync(p, 'utf8')
    return JSON.parse(s)
  } catch {
    return null
  }
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function formatPercent(v: number | string | undefined) {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return `${v.toFixed(2)}%`
  return '-'
}

const root = process.cwd()
const coverageSummaryPath = path.join(root, 'coverage', 'coverage-summary.json')
const testResultsPath = path.join(root, 'reports', 'test-results.json')
const junitPath = path.join(root, 'reports', 'junit.xml')
const htmlIndex = path.join(root, 'coverage', 'index.html')
const outDir = path.join(root, 'reports')
const outFile = path.join(outDir, 'TEST_REPORT.md')

const cov = readJson<any>(coverageSummaryPath)
const res = readJson<any>(testResultsPath)

ensureDir(outDir)

const covTotal = cov?.total
const covTable = covTotal
  ? `| 覆盖项 | 覆盖率 |\n| --- | --- |\n| Statements | ${formatPercent(covTotal.statements?.pct)} |\n| Branches | ${formatPercent(covTotal.branches?.pct)} |\n| Functions | ${formatPercent(covTotal.functions?.pct)} |\n| Lines | ${formatPercent(covTotal.lines?.pct)} |\n`
  : '_未找到覆盖率数据，请先运行 `pnpm test:coverage`。_\n'

let totalTests = 0, passed = 0, failed = 0, skipped = 0
let durationMs = res?.duration ?? res?.stats?.duration ?? 0

if (res?.summary) {
  totalTests = res.summary?.testCount?.total ?? res.summary?.tests ?? 0
  passed = res.summary?.testCount?.passed ?? res.summary?.passed ?? 0
  failed = res.summary?.testCount?.failed ?? res.summary?.failed ?? 0
  skipped = res.summary?.testCount?.skipped ?? res.summary?.skipped ?? 0
} else if (res?.stats) {
  totalTests = res.stats?.tests ?? 0
  passed = res.stats?.passes ?? 0
  failed = res.stats?.failures ?? 0
  skipped = res.stats?.pending ?? 0
}

const testTable = `| 指标 | 数量 |\n| --- | ---:|\n| 总测试数 | ${totalTests} |\n| 通过 | ${passed} |\n| 失败 | ${failed} |\n| 跳过 | ${skipped} |\n| 用时(ms) | ${durationMs} |\n`

const md = `# 测试报告\n\n## 覆盖率摘要\n\n${covTable}\n## 测试结果摘要\n\n${testTable}\n## 报告文件\n\n- 覆盖率 HTML: coverage/index.html\n- 覆盖率 LCOV: coverage/lcov.info\n- 测试 JUnit XML: reports/junit.xml\n- 测试结果 JSON: reports/test-results.json\n`

fs.writeFileSync(outFile, md, 'utf8')
console.log(`Wrote report: ${outFile}`)


