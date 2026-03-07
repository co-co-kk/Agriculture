// 该文件提供固定随机种子与通用随机工具，保证 mock 数据每次可复现。
import { fakerZH_CN as faker } from '@faker-js/faker'

// 固定随机种子，确保演示环境在不同机器上得到一致结果。
faker.seed(20260308)

// 导出 faker 实例供各工厂统一使用。
export { faker }

// 随机挑选数组元素，减少重复代码。
export const pickOne = <T>(items: T[]): T => {
  return items[faker.number.int({ min: 0, max: items.length - 1 })]
}

// 生成区间内浮点数并保留两位小数。
export const randomFloat = (min: number, max: number): number => {
  return Number(faker.number.float({ min, max, fractionDigits: 2 }).toFixed(2))
}
