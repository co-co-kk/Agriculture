// 该文件在测试运行前执行，注入断言扩展并启动 MSW Node 服务。
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/mocks/server'

// 将图表组件替换为测试占位节点，规避 jsdom 对 canvas 的限制。
vi.mock('echarts-for-react', () => ({
  default: () => null,
}))

// 补齐浏览器环境缺失 API，避免图表组件在 jsdom 下报错。
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('matchMedia', () => ({
  matches: false,
  media: '',
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}))

// 测试开始前启动 mock server，确保请求稳定可控。
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 每个用例结束后重置 handler，避免状态污染。
afterEach(() => server.resetHandlers())

// 测试完成后关闭服务，释放资源。
afterAll(() => server.close())
