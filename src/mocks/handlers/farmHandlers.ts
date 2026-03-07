// 该文件定义农场基础信息接口，返回地块边界与农场信息。
import { HttpResponse, delay, http } from 'msw'
import { dataset } from '@/mocks/data/dataset'

// 导出农场基础接口 handler。
export const farmHandlers = [
  http.get('/api/farm', async () => {
    await delay(100)
    return HttpResponse.json({
      farm: dataset.farm,
      plots: dataset.plots,
    })
  }),
]
