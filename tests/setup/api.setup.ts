import { vi } from 'vitest'

// API 测试的 setup 文件
// 这里可以添加 API 测试需要的全局配置

// 模拟 console 方法以避免测试输出干扰
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
