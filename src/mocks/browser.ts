// 该文件在浏览器环境启动 MSW worker，拦截前端请求。
import { setupWorker } from 'msw/browser'
import { handlers } from '@/mocks/handlers'

// 导出 worker 实例，供入口按需启动。
export const worker = setupWorker(...handlers)
