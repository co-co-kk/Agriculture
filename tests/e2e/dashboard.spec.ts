// 该文件验证核心演示流程，保证双场景切换和报告抽屉可用。
import { expect, test } from '@playwright/test'

test('看板可切换虫害场景并打开报告', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('农业AI无人机巡检作战平台')).toBeVisible()

  await page.getByRole('button', { name: '虫害检测' }).click()
  await expect(page.getByText('虫口密度趋势')).toBeVisible()

  await page.getByRole('button', { name: '打开报告' }).click()
  await expect(page.getByText('智能分析报告')).toBeVisible()
})
