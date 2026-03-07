// 该文件在测试环境启动 MSW Node server，保证单测请求稳定。
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

// 导出测试专用 mock server。
export const server = setupServer(...handlers)
