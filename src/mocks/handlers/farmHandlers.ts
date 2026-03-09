// 该文件定义农场基础信息接口，返回地块边界与农场信息。
import { HttpResponse, delay, http } from 'msw'
import { queryFarm } from '@/mocks/data/querySelectors'

export const farmHandlers = [
  http.get('/api/farm', async () => {
    await delay(100)
    return HttpResponse.json(queryFarm())
  }),
]
