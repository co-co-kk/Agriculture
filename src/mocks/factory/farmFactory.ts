// 该文件负责生成农场和地块基础数据。
import type { Farm, LngLat, Plot } from '@/types/domain'
import { pickOne, randomFloat } from '@/mocks/factory/seed'

// 构建默认演示农场信息，供全局看板头部复用。
export const createFarm = (): Farm => {
  return {
    id: 'farm-001',
    name: '繁昌智慧示范农场',
    province: '安徽省',
    city: '芜湖市',
    totalAreaMu: 1920,
  }
}

// 根据中心点生成近似矩形地块边界，用于地图填充。
const createPolygon = (center: LngLat, size = 0.003): LngLat[] => {
  const [lng, lat] = center
  return [
    [lng - size, lat - size],
    [lng + size, lat - size],
    [lng + size, lat + size],
    [lng - size, lat + size],
    [lng - size, lat - size],
  ]
}

// 生成 12 个地块，满足场景演示的区域分布需求。
export const createPlots = (): Plot[] => {
  const cropOptions = ['小麦', '玉米', '水稻', '棉花']
  const baseLng = 118.39
  const baseLat = 31.08
  const plots: Plot[] = []

  // 使用 3x4 网格模拟真实农田区域布局。
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const index = row * 4 + col + 1
      const center: LngLat = [
        Number((baseLng + col * 0.008).toFixed(6)),
        Number((baseLat + row * 0.007).toFixed(6)),
      ]

      plots.push({
        id: `plot-${index.toString().padStart(2, '0')}`,
        name: `第${index}号地块`,
        crop: pickOne(cropOptions),
        areaMu: randomFloat(120, 185),
        center,
        polygon: createPolygon(center),
      })
    }
  }

  return plots
}
