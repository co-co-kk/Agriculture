// 该文件汇总所有 mock 接口处理器，供浏览器和测试环境统一注册。
import { alertHandlers } from '@/mocks/handlers/alertHandlers'
import { dashboardHandlers } from '@/mocks/handlers/dashboardHandlers'
import { detectionHandlers } from '@/mocks/handlers/detectionHandlers'
import { farmHandlers } from '@/mocks/handlers/farmHandlers'
import { missionHandlers } from '@/mocks/handlers/missionHandlers'
import { reportHandlers } from '@/mocks/handlers/reportHandlers'

// 导出统一 handlers 数组，避免重复维护。
export const handlers = [
  ...farmHandlers,
  ...dashboardHandlers,
  ...missionHandlers,
  ...detectionHandlers,
  ...alertHandlers,
  ...reportHandlers,
]
