// 该文件汇总所有 mock 接口处理器，供浏览器和测试环境统一注册。
import { alertHandlers } from '@/mocks/handlers/alertHandlers'
import { dashboardHandlers } from '@/mocks/handlers/dashboardHandlers'
import { dataCenterHandlers } from '@/mocks/handlers/dataCenterHandlers'
import { detectionHandlers } from '@/mocks/handlers/detectionHandlers'
import { farmHandlers } from '@/mocks/handlers/farmHandlers'
import { missionHandlers } from '@/mocks/handlers/missionHandlers'
import { reportHandlers } from '@/mocks/handlers/reportHandlers'

export const handlers = [
  ...farmHandlers,
  ...dashboardHandlers,
  ...missionHandlers,
  ...detectionHandlers,
  ...alertHandlers,
  ...reportHandlers,
  ...dataCenterHandlers,
]
