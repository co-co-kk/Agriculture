// 该文件提供数据选择器通用工具函数，供不同场景复用。
import type { GeoGridCell, Plot } from '@/types/domain'

// 统计数组元素出现次数并输出降序结果。
export const countBy = <T extends string>(items: T[]): Array<{ name: T; value: number }> => {
  const counter = new Map<T, number>()
  for (const item of items) {
    counter.set(item, (counter.get(item) ?? 0) + 1)
  }
  return [...counter.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

// 格式化百分比字符串，供 KPI 与提示文案复用。
export const toPercent = (value: number): string => `${(value * 100).toFixed(1)}%`

// 对地块风险网格按风险从高到低排序，便于渲染热区列表。
export const sortCells = (cells: GeoGridCell[]): GeoGridCell[] => {
  return [...cells].sort((a, b) => b.riskScore - a.riskScore)
}

// 根据地块 ID 快速建立索引，减少重复查找开销。
export const createPlotIndex = (plots: Plot[]): Record<string, Plot> => {
  return plots.reduce<Record<string, Plot>>((acc, plot) => {
    acc[plot.id] = plot
    return acc
  }, {})
}

// 将风险值映射为“高/中/低”级别标签。
export const riskLabel = (score: number): '高' | '中' | '低' => {
  if (score >= 0.78) {
    return '高'
  }
  if (score >= 0.58) {
    return '中'
  }
  return '低'
}
