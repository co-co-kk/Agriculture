// 该文件用于验证看板页面的关键交互流程。
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { DashboardPage } from '@/pages/DashboardPage'

// 渲染页面时统一包裹查询 Provider。
const renderPage = () => {
  return render(
    <QueryProvider>
      <DashboardPage />
    </QueryProvider>,
  )
}

describe('DashboardPage', () => {
  it('支持场景切换并展示虫害趋势模块', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('农业AI无人机巡检作战平台')
    await user.click(screen.getByRole('button', { name: '虫害检测' }))

    await waitFor(() => {
      expect(screen.getByText('虫口密度趋势')).toBeInTheDocument()
    })
  })

  it('支持打开报告抽屉', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('农业AI无人机巡检作战平台')
    await user.click(screen.getByRole('button', { name: '打开报告' }))

    await waitFor(() => {
      expect(screen.getByText('智能分析报告')).toBeInTheDocument()
    })
  })
})
