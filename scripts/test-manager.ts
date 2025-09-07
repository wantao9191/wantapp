#!/usr/bin/env tsx

/**
 * 统一测试管理脚本
 * 整合所有测试相关功能
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'

interface TestOptions {
  pattern?: string
  coverage?: boolean
  watch?: boolean
  verbose?: boolean
  bail?: boolean
  reporter?: 'default' | 'verbose' | 'json' | 'junit'
  timeout?: number
  ui?: boolean
}

class TestManager {
  private baseCommand = 'pnpm exec vitest'

  constructor(private options: TestOptions = {}) { }

  /**
   * 构建测试命令
   */
  private buildCommand(): string {
    let command = this.baseCommand

    if (this.options.watch) {
      command += ' --watch'
    } else {
      command += ' run'
    }

    if (this.options.coverage) {
      command += ' --coverage'
    }

    if (this.options.verbose) {
      command += ' --reporter=verbose'
    } else if (this.options.reporter) {
      command += ` --reporter=${this.options.reporter}`
    }

    if (this.options.bail) {
      command += ' --bail=1'
    }

    if (this.options.timeout) {
      command += ` --testTimeout=${this.options.timeout}`
    }

    if (this.options.ui) {
      command += ' --ui'
    }

    if (this.options.pattern) {
      command += ` ${this.options.pattern}`
    }

    return command
  }

  /**
   * 运行测试
   */
  run(): void {
    const command = this.buildCommand()
    console.log(`🧪 Running tests: ${command}`)
    console.log('─'.repeat(50))

    try {
      execSync(command, {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('─'.repeat(50))
      console.log('✅ All tests passed!')
    } catch (error) {
      console.log('─'.repeat(50))
      console.log('❌ Some tests failed!')
      process.exit(1)
    }
  }

  /**
   * 运行特定类型的测试
   */
  static runByType(type: string, options: TestOptions = {}): void {
    const patterns: Record<string, string | string[]> = {
      unit: [
        'tests/lib/auth-helper.enhanced.test.ts',
        'tests/lib/crypto.test.ts',
        'tests/lib/form-utils.test.ts',
        'tests/lib/http-token-refresh-simple.test.ts',
        'tests/lib/https.test.ts',
        'tests/lib/jwt.test.ts',
        'tests/lib/password.test.ts',
        'tests/lib/permissions.test.ts',
        'tests/lib/utils.test.ts',
        'tests/lib/validations.test.ts'
      ],
      api: [
        'tests/api/admin.auth.login.enhanced.test.ts',
        'tests/api/admin.auth.refresh.test.ts',
        'tests/api/admin.auth.revoke.test.ts',
        'tests/api/admin.menus.all.route.test.ts',
        'tests/api/admin.menus.route.test.ts',
        'tests/api/admin.organizations.integration.test.ts',
        'tests/api/admin.permissions.id.route.test.ts',
        'tests/api/admin.permissions.route.test.ts',
        'tests/api/admin.roles.id.route.test.ts',
        'tests/api/admin.roles.route.test.ts',
        'tests/api/admin.users.id.route.test.ts',
        'tests/api/admin.users.route.test.ts',
        'tests/api/captcha.route.test.ts',
        'tests/api/catch-all.route.test.ts',
        'tests/api/dicts.route.test.ts',
        'tests/api/utils.handler.test.ts',
        'tests/api/utils.response.enhanced.test.ts'
      ],
      ui: [
        'tests/ui/admin.index.page.test.tsx',
        'tests/ui/admin.layout.test.tsx',
        'tests/ui/admin.login.page.test.tsx',
        'tests/ui/admin.menus.page.test.tsx',
        'tests/ui/admin.menus.useItems.test.tsx',
        'tests/ui/admin.permissions.page.test.tsx',
        'tests/ui/admin.permissions.useItems.test.tsx',
        'tests/ui/admin.roles.page.test.tsx',
        'tests/ui/admin.roles.useItems.test.tsx',
        'tests/ui/admin.users.editModal.test.tsx',
        'tests/ui/admin.users.page.test.tsx',
        'tests/ui/admin.users.useItems.test.tsx',
        'tests/ui/AppIcons.test.tsx',
        'tests/ui/BasicAside.test.tsx',
        'tests/ui/BasicHeader.test.tsx',
        'tests/ui/BasicLayout.test.tsx',
        'tests/ui/BasicTabs.test.tsx',
        'tests/ui/ConfigForm.test.tsx',
        'tests/ui/ConfigModal.test.tsx',
        'tests/ui/ConfigPagination.test.tsx',
        'tests/ui/ConfirmTable.test.tsx',
        'tests/ui/Loading.test.tsx',
        'tests/ui/OrganizationsEditModal.test.tsx',
        'tests/ui/OrganizationsPage.unit.test.tsx',
        'tests/ui/OrganizationsUseItems.test.tsx'
      ],
      hooks: [
        'tests/hooks/useAuth.test.ts',
        'tests/hooks/useSlider.test.ts',
        'tests/hooks/useTabs.test.ts',
        'tests/hooks/useTheme.test.ts'
      ],
      integration: [
        'tests/integration/auth-flow.test.ts'
      ],
      middleware: [
        'tests/middleware.test.ts'
      ],
      enhanced: [
        'tests/api/admin.auth.login.enhanced.test.ts',
        'tests/api/utils.response.enhanced.test.ts',
        'tests/lib/auth-helper.enhanced.test.ts'
      ],
      auth: [
        'tests/api/admin.auth.login.enhanced.test.ts',
        'tests/api/admin.auth.refresh.test.ts',
        'tests/api/admin.auth.revoke.test.ts',
        'tests/hooks/useAuth.test.ts',
        'tests/integration/auth-flow.test.ts',
        'tests/lib/auth-helper.enhanced.test.ts'
      ],
      admin: [
        'tests/api/admin.auth.login.enhanced.test.ts',
        'tests/api/admin.auth.refresh.test.ts',
        'tests/api/admin.auth.revoke.test.ts',
        'tests/api/admin.menus.all.route.test.ts',
        'tests/api/admin.menus.route.test.ts',
        'tests/api/admin.organizations.integration.test.ts',
        'tests/api/admin.permissions.id.route.test.ts',
        'tests/api/admin.permissions.route.test.ts',
        'tests/api/admin.roles.id.route.test.ts',
        'tests/api/admin.roles.route.test.ts',
        'tests/api/admin.users.id.route.test.ts',
        'tests/api/admin.users.route.test.ts',
        'tests/ui/admin.index.page.test.tsx',
        'tests/ui/admin.layout.test.tsx',
        'tests/ui/admin.login.page.test.tsx',
        'tests/ui/admin.menus.page.test.tsx',
        'tests/ui/admin.menus.useItems.test.tsx',
        'tests/ui/admin.permissions.page.test.tsx',
        'tests/ui/admin.permissions.useItems.test.tsx',
        'tests/ui/admin.roles.page.test.tsx',
        'tests/ui/admin.roles.useItems.test.tsx',
        'tests/ui/admin.users.editModal.test.tsx',
        'tests/ui/admin.users.page.test.tsx',
        'tests/ui/admin.users.useItems.test.tsx'
      ]
    }

    const pattern = patterns[type]
    if (!pattern) {
      console.error(`❌ Unknown test type: ${type}`)
      console.log('Available types:', Object.keys(patterns).join(', '))
      process.exit(1)
    }

    // 如果是数组，逐个运行测试文件
    if (Array.isArray(pattern)) {
      console.log(`🔍 Found ${pattern.length} auth test files`)
      TestManager.runMultipleFiles(pattern, options)
    } else {
      new TestManager({ ...options, pattern }).run()
    }
  }

  /**
   * 运行多个测试文件
   */
  static runMultipleFiles(files: string[], options: TestOptions = {}): void {
    console.log(`🧪 Running ${files.length} test files...`)
    
    let totalPassed = 0
    let totalFailed = 0
    const results: Array<{ file: string; success: boolean; error?: string }> = []

    for (const file of files) {
      console.log(`\n🔍 Running ${file}...`)
      try {
        new TestManager({ ...options, pattern: file }).run()
        results.push({ file, success: true })
        totalPassed++
      } catch (error) {
        console.log(`❌ ${file} failed`)
        results.push({ 
          file, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        totalFailed++
      }
    }

    // 显示总结
    console.log('\n📊 Test Summary:')
    console.log(`Total files: ${files.length}`)
    console.log(`Passed: ${totalPassed}`)
    console.log(`Failed: ${totalFailed}`)
    
    if (totalFailed > 0) {
      console.log('\n❌ Failed files:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.file}`)
      })
      process.exit(1)
    } else {
      console.log('\n✅ All test files passed!')
    }
  }

  /**
   * 运行完整测试套件并生成报告
   */
  static runFullSuite(): void {
    console.log('📊 Running comprehensive test suite...')

    const testSuites = [
      { name: 'Unit Tests', pattern: 'tests/lib/**/*.test.ts' },
      { name: 'API Tests', pattern: 'tests/api/**/*.test.ts' },
      { name: 'Hooks Tests', pattern: 'tests/hooks/**/*.test.ts' },
      { name: 'Middleware Tests', pattern: 'tests/middleware.test.ts' },
      { name: 'Integration Tests', pattern: 'tests/integration/**/*.test.ts' }
    ]

    const results: Array<{ name: string; success: boolean; error?: string }> = []

    for (const suite of testSuites) {
      console.log(`\n🔍 Running ${suite.name}...`)
      try {
        new TestManager({
          pattern: suite.pattern,
          reporter: 'default',
          bail: false
        }).run()
        results.push({ name: suite.name, success: true })
      } catch (error) {
        console.log(`❌ ${suite.name} failed`)
        results.push({
          name: suite.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 生成测试报告
    TestManager.generateReport(results)

    // 最后运行覆盖率测试
    console.log('\n📈 Generating coverage report...')
    try {
      new TestManager({ coverage: true }).run()
    } catch (error) {
      console.log('❌ Coverage report generation failed')
    }
  }

  /**
   * 生成测试报告
   */
  static generateReport(results: Array<{ name: string; success: boolean; error?: string }>): void {
    const timestamp = new Date().toISOString()
    const totalSuites = results.length
    const passedSuites = results.filter(r => r.success).length
    const failedSuites = totalSuites - passedSuites

    const report = {
      timestamp,
      summary: {
        total: totalSuites,
        passed: passedSuites,
        failed: failedSuites,
        success_rate: `${((passedSuites / totalSuites) * 100).toFixed(1)}%`
      },
      suites: results
    }

    // 确保reports目录存在
    const reportsDir = path.join(process.cwd(), 'reports')
    if (!existsSync(reportsDir)) {
      execSync(`mkdir -p ${reportsDir}`)
    }

    // 写入JSON报告
    const reportPath = path.join(reportsDir, 'test-summary.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('\n📋 Test Summary:')
    console.log(`Total Suites: ${totalSuites}`)
    console.log(`Passed: ${passedSuites}`)
    console.log(`Failed: ${failedSuites}`)
    console.log(`Success Rate: ${report.summary.success_rate}`)
    console.log(`Report saved to: ${reportPath}`)
  }

  /**
   * 检查测试环境
   */
  static checkEnvironment(): boolean {
    const requiredFiles = [
      'vitest.config.ts',
      'tests/setup/ui.setup.ts'
    ]

    const missingFiles = requiredFiles.filter(file => !existsSync(file))

    if (missingFiles.length > 0) {
      console.error('❌ Missing required test files:')
      missingFiles.forEach(file => console.error(`  - ${file}`))
      return false
    }

    console.log('✅ Test environment is ready')
    return true
  }

  /**
   * 清理测试相关文件
   */
  static cleanup(): void {
    console.log('🧹 Cleaning up test artifacts...')

    const cleanupPaths = [
      'coverage',
      'reports/junit.xml',
      'reports/test-results.json',
      '.vitest'
    ]

    for (const cleanupPath of cleanupPaths) {
      try {
        if (existsSync(cleanupPath)) {
          execSync(`rm -rf ${cleanupPath}`)
          console.log(`✅ Cleaned: ${cleanupPath}`)
        }
      } catch (error) {
        console.log(`⚠️ Failed to clean: ${cleanupPath}`)
      }
    }
  }
}

// 命令行接口
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  // 检查环境
  if (command !== 'cleanup' && !TestManager.checkEnvironment()) {
    process.exit(1)
  }

  switch (command) {
    case 'unit':
      TestManager.runByType('unit', { verbose: true })
      break

    case 'api':
      TestManager.runByType('api', { verbose: true })
      break

    case 'ui':
      TestManager.runByType('ui', { verbose: true })
      break

    case 'hooks':
      TestManager.runByType('hooks', { verbose: true })
      break

    case 'integration':
      TestManager.runByType('integration', { verbose: true })
      break

    case 'middleware':
      TestManager.runByType('middleware', { verbose: true })
      break

    case 'enhanced':
      TestManager.runByType('enhanced', { verbose: true })
      break

    case 'auth':
      TestManager.runByType('auth', { verbose: true })
      break

    case 'admin':
      TestManager.runByType('admin', { verbose: true })
      break

    case 'watch':
      new TestManager({ watch: true, verbose: true }).run()
      break

    case 'coverage':
      new TestManager({ coverage: true, verbose: true }).run()
      break

    case 'full':
      TestManager.runFullSuite()
      break

    case 'quick':
      new TestManager({
        pattern: 'tests/basic.test.ts',
        bail: true,
        timeout: 10000
      }).run()
      break

    case 'ui-mode':
      new TestManager({ ui: true }).run()
      break

    case 'cleanup':
      TestManager.cleanup()
      break

    default:
      console.log(`
🧪 Test Manager Usage:

  tsx scripts/test-manager.ts <command>

Commands:
  unit         - Run unit tests (lib)
  api          - Run API tests
  ui           - Run UI component tests
  hooks        - Run React hooks tests
  integration  - Run integration tests
  middleware   - Run middleware tests
  enhanced     - Run enhanced test suites
  auth         - Run authentication tests
  admin        - Run admin module tests
  watch        - Run tests in watch mode
  coverage     - Run tests with coverage
  full         - Run comprehensive test suite
  quick        - Run quick basic tests
  ui-mode      - Run tests in UI mode
  cleanup      - Clean up test artifacts

Examples:
  tsx scripts/test-manager.ts unit
  tsx scripts/test-manager.ts coverage
  tsx scripts/test-manager.ts watch
  tsx scripts/test-manager.ts full
      `)
      break
  }
}

if (require.main === module) {
  main()
}

export { TestManager }