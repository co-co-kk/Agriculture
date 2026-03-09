// 该文件验证核心演示流程：数据中心采集解析、看板回看与版本对比。
import { expect, test } from '@playwright/test'

test('数据中心可采集并解析，回到看板后可切场景与对比', async ({ page }) => {
  await page.goto('/data-center')
  await expect(page.getByText('Data Center')).toBeVisible()

  await page.getByRole('button', { name: '点击采集' }).first().click()
  await page.getByRole('button', { name: '解析' }).first().click()

  await page.getByRole('button', { name: '返回看板' }).click()
  await expect(page.getByText('农业AI无人机巡检作战平台')).toBeVisible()

  await page.getByRole('button', { name: '营养诊断' }).click()
  await expect(page.getByText('缺素类型分布')).toBeVisible()

  await page.getByLabel('开启双版本对比').check()
  await expect(page.getByText('双版本对比')).toBeVisible()
})
